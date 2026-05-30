import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
  Request,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UsersService } from '../services/users.service';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Create a new user
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto, @Req() req: any) {
    return this.usersService.createUser(
      createUserDto,
      req.user.userId,
      req.user.organizationId,
    );
  }

  /**
   * Get all users (paginated)
   */
  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    let filter: any = {};
    if (search) {
      filter = {
        $or: [
          { email: { $regex: search, $options: 'i' } },
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
        ],
      };
    }

    return this.usersService.getAllPaginated(filter, pageNum, limitNum);
  }

  /**
   * Get user statistics (count by role/status)
   */
  @Get('stats/summary')
  async getStatistics() {
    const all = await this.usersService.count();
    const active = await this.usersService.count({ status: 'active' });
    const inactive = await this.usersService.count({ status: 'inactive' });
    const admins = await this.usersService.count({ role: 'admin' });

    return {
      total: all,
      active,
      inactive,
      admins,
    };
  }

  /**
   * Get user statistics for an organization
   */
  @Get('organization/:organizationId/stats/summary')
  async getOrganizationStatistics(@Param('organizationId') organizationId: string) {
    const all = await this.usersService.count({ organizationId });
    const active = await this.usersService.count({ organizationId, status: 'active' });
    const inactive = await this.usersService.count({ organizationId, status: 'inactive' });
    const admins = await this.usersService.count({ organizationId, role: 'admin' });

    return {
      total: all,
      active,
      inactive,
      admins,
    };
  }

  /**
   * Get user by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.getById(id);
  }

  /**
   * Get users by organization
   */
  @Get('organization/:organizationId')
  async getUsersByOrganization(
    @Param('organizationId') organizationId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    return this.usersService.getUsersByOrganization(organizationId, pageNum, limitNum);
  }

  /**
   * Get users by branch
   */
  @Get('branch/:branchId')
  async getUsersByBranch(
    @Param('branchId') branchId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    return this.usersService.getUsersByBranch(branchId, pageNum, limitNum);
  }

  /**
   * Get users by role
   */
  @Get('role/:role')
  async getUsersByRole(
    @Param('role') role: string,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.usersService.getUsersByRole(role, organizationId);
  }

  /**
   * Update user
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any,
  ) {
    return this.usersService.updateUser(id, updateUserDto, req.user.userId);
  }

  /**
   * Delete user (soft delete)
   */
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.usersService.softDelete(id, req.user.userId);
  }
}
