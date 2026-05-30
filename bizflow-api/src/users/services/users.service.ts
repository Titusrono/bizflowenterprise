import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { BaseService } from '../../common/services/base.service';
import { UserDocument } from '../schemas/user.schema';
import { UsersRepository } from '../repositories/users.repository';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';
import * as bcrypt from 'bcrypt';

/**
 * Users Service
 * Extends BaseService with User-specific business logic
 * Handles password hashing, validation, and user-specific queries
 */
@Injectable()
export class UsersService extends BaseService<UserDocument> {
  constructor(private readonly usersRepository: UsersRepository) {
    super(usersRepository);
  }

  /**
   * Create user with password hashing
   */
  async createUser(createUserDto: CreateUserDto, userId?: string): Promise<any> {
    // Check if user already exists
    const existingUser = await this.usersRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const userData: any = {
      ...createUserDto,
      password: hashedPassword,
      email: createUserDto.email.toLowerCase(),
    };

    const user = await this.repository.create(userData, userId);

    // Remove password from response
    return this.sanitizeUser(user);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<any> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  /**
   * Get users by organization
   */
  async getUsersByOrganization(
    organizationId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const result = await this.usersRepository.findByOrganization(
      organizationId,
      page,
      limit,
    );

    return {
      data: result.data.map((u) => this.sanitizeUser(u)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  /**
   * Get users by branch
   */
  async getUsersByBranch(branchId: string, page: number = 1, limit: number = 10) {
    const result = await this.usersRepository.findByBranch(
      branchId,
      page,
      limit,
    );

    return {
      data: result.data.map((u) => this.sanitizeUser(u)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: string, organizationId?: string) {
    const users = await this.usersRepository.findByRole(role, organizationId);
    return users.map((u) => this.sanitizeUser(u));
  }

  /**
   * Get active users in organization
   */
  async getActiveUsers(organizationId: string) {
    const users = await this.usersRepository.findActiveByOrganization(
      organizationId,
    );
    return users.map((u) => this.sanitizeUser(u));
  }

  /**
   * Update user
   */
  async updateUser(userId: string, updateDto: UpdateUserDto, currentUserId?: string): Promise<any> {
    // Check if email is being changed
    if (updateDto.email) {
      const existingUser = await this.usersRepository.findByEmail(updateDto.email);
      if (existingUser && existingUser._id.toString() !== userId) {
        throw new ConflictException('Email already in use');
      }
    }

    const user = await this.repository.updateById(userId, updateDto, currentUserId);
    return this.sanitizeUser(user);
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.repository.updateById(userId, { password: hashedPassword }, userId);
  }

  /**
   * Verify password
   */
  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await this.repository.findById(userId);
    if (!user) {
      return false;
    }
    return bcrypt.compare(password, user.password);
  }

  /**
   * Get organization stats
   */
  async getOrganizationStats(organizationId: string) {
    return this.usersRepository.getOrganizationStats(organizationId);
  }

  /**
   * Count active users
   */
  async countActiveUsers(organizationId: string): Promise<number> {
    return this.usersRepository.countActiveByOrganization(organizationId);
  }

  /**
   * Remove password from user object for responses
   */
  private sanitizeUser(user: any): any {
    const sanitized = { ...user };
    delete sanitized.password;
    delete sanitized.passwordResetToken;
    delete sanitized.emailVerificationToken;
    return sanitized;
  }
}
