import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService, AuthPayload } from '../services/auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, ChangePasswordDto } from '../dto/auth.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Register a new user
   */
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Login user
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  /**
   * Refresh access token
   */
  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  /**
   * Get current user profile
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    return {
      success: true,
      data: req.user,
    };
  }

  /**
   * Change password
   */
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Request() req: any, @Body() changePasswordDto: ChangePasswordDto) {
    await this.authService.changePassword(req.user.sub, changePasswordDto.currentPassword, changePasswordDto.newPassword);
    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  /**
   * Logout (handled by client, just for API consistency)
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req: any) {
    // In a real application, you might want to blacklist the token
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}
