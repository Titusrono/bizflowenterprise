import { Injectable, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRole } from '../../users/schemas/user.schema';
import { RegisterDto, LoginDto, ChangePasswordDto } from '../dto/auth.dto';
import { DocumentStatus } from '../../common/schemas/base.schema';

export interface AuthPayload {
  accessToken: string;
  refreshToken: string;
  user: Partial<User>;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService
  ) {}

  /**
   * Register a new user and organization
   */
  async register(registerDto: RegisterDto): Promise<AuthPayload> {
    const { email, password, firstName, lastName, organizationName } = registerDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate organization ID (in real app, you'd create an organization first)
    const organizationId = this.generateId();

    // Create new user
    const newUser = await this.userModel.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      organizationId,
      role: UserRole.ADMIN,
      status: DocumentStatus.ACTIVE,
      emailVerified: false,
    });

    return this.generateAuthPayload(newUser);
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<AuthPayload> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check user status
    if (user.status !== 'active') {
      throw new UnauthorizedException(`Account is ${user.status}`);
    }

    return this.generateAuthPayload(user);
  }

  /**
   * Validate JWT token
   */
  async validateToken(token: string): Promise<Partial<User>> {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.userModel.findById(decoded.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.sanitizeUser(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthPayload> {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.userModel.findById(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateAuthPayload(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
  }

  /**
   * Generate authentication payload
   */
  private generateAuthPayload(user: UserDocument): AuthPayload {
    const expiresIn = 24 * 60 * 60; // 24 hours in seconds

    const accessToken = this.jwtService.sign(
      {
        sub: user._id,
        userId: user._id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        branchId: user.branchId,
      },
      {
        expiresIn: '24h',
      }
    );

    const refreshToken = this.jwtService.sign(
      {
        sub: user._id,
        type: 'refresh',
      },
      {
        expiresIn: '7d',
        secret: process.env.JWT_REFRESH_SECRET,
      }
    );

    return {
      accessToken,
      refreshToken,
      user: this.sanitizeUser(user),
      expiresIn,
    };
  }

  /**
   * Sanitize user data (remove sensitive fields)
   */
  private sanitizeUser(user: UserDocument): Partial<User> {
    const { password, ...sanitized } = user.toObject();
    return sanitized;
  }

  /**
   * Generate random ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
