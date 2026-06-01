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
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { OrganizationGuard } from '../../auth/guards/organization.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { BranchesService } from '../services/branches.service';
import { CreateBranchDto, UpdateBranchDto } from '../dto/branch.dto';
import { UserRole } from '../../users/schemas/user.schema';

@Controller('branches')
@UseGuards(JwtAuthGuard, RolesGuard, OrganizationGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  /**
   * Validates that the user has access to the organization
   */
  private validateOrganizationAccess(user: any, organizationId?: string): string {
    // If no organization specified, use user's organization
    if (!organizationId) {
      if (!user.organizationId) {
        throw new BadRequestException('organizationId is required');
      }
      return user.organizationId;
    }

    // Super admin can access any organization
    if (user.role === UserRole.SUPER_ADMIN) {
      return organizationId;
    }

    // Regular users can only access their own organization
    // Convert both to strings for comparison (handle ObjectId)
    const userOrgId = user.organizationId?.toString?.() || user.organizationId?.valueOf?.() || String(user.organizationId);
    const requestedOrgId = organizationId?.toString?.() || String(organizationId);

    if (userOrgId !== requestedOrgId) {
      throw new ForbiddenException(
        `Access denied: You can only access branches from your organization`,
      );
    }

    return organizationId;
  }

  /**
   * Create a new branch
   * Only ADMIN and SUPER_ADMIN can create branches
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async create(
    @Body() createBranchDto: CreateBranchDto,
    @Query('organizationId') organizationId: string,
    @Req() req: any,
  ) {
    const orgId = this.validateOrganizationAccess(
      req.user,
      organizationId || (createBranchDto as any).organizationId,
    );
    return this.branchesService.createBranch(
      createBranchDto,
      orgId,
      req.user.userId,
    );
  }

  /**
   * Get all branches (paginated)
   * Non-admin users can only see branches from their organization
   */
  @Get()
  async findAll(
    @Req() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    let filter: any = {};

    // Non-super-admin users can only see branches from their organization
    if (req.user.role !== UserRole.SUPER_ADMIN) {
      if (!req.user.organizationId) {
        throw new BadRequestException('User organization not set');
      }
      filter.organizationId = req.user.organizationId;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    return this.branchesService.getAllPaginated(filter, pageNum, limitNum);
  }

  /**
   * Get branch statistics (count by status)
   */
  @Get('stats/summary')
  async getStatistics() {
    const all = await this.branchesService.count();
    const active = await this.branchesService.count({ status: 'active' });
    const inactive = await this.branchesService.count({ status: 'inactive' });
    const pending = await this.branchesService.count({ status: 'pending' });

    return {
      total: all,
      active,
      inactive,
      pending,
    };
  }

  /**
   * Get branch statistics for an organization
   */
  @Get('organization/:organizationId/stats/summary')
  async getOrganizationStatistics(@Param('organizationId') organizationId: string) {
    const all = await this.branchesService.count({ organizationId });
    const active = await this.branchesService.count({ organizationId, status: 'active' });
    const inactive = await this.branchesService.count({ organizationId, status: 'inactive' });
    const pending = await this.branchesService.count({ organizationId, status: 'pending' });

    return {
      total: all,
      active,
      inactive,
      pending,
    };
  }

  /**
   * Get branch by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.branchesService.getById(id);
  }

  /**
   * Get branches by organization
   */
  @Get('organization/:organizationId')
  async getBranchesByOrganization(
    @Param('organizationId') organizationId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Req() req: any,
  ) {
    this.validateOrganizationAccess(req.user, organizationId);
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    return this.branchesService.getBranchesByOrganization(
      organizationId,
      pageNum,
      limitNum,
    );
  }

  /**
   * Get active branches for organization
   */
  @Get('organization/:organizationId/active')
  async getActiveBranches(
    @Param('organizationId') organizationId: string,
    @Req() req: any,
  ) {
    this.validateOrganizationAccess(req.user, organizationId);
    return this.branchesService.getActiveBranches(organizationId);
  }

  /**
   * Get branch by code
   */
  @Get('code/:code')
  async findByCode(
    @Param('code') code: string,
    @Query('organizationId') organizationId: string,
  ) {
    return this.branchesService.getByCode(code, organizationId);
  }

  /**
   * Update branch
   * Only ADMIN and SUPER_ADMIN can update branches
   */
  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateBranchDto: UpdateBranchDto,
    @Req() req: any,
  ) {
    return this.branchesService.updateBranch(
      id,
      updateBranchDto,
      req.user.userId,
    );
  }

  /**
   * Delete branch (soft delete)
   * Only ADMIN and SUPER_ADMIN can delete branches
   */
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.branchesService.softDelete(id, req.user.userId);
  }
}
