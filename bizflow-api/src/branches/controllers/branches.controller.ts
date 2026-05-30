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
import { BranchesService } from '../services/branches.service';
import { CreateBranchDto, UpdateBranchDto } from '../dto/branch.dto';

@Controller('branches')
@UseGuards(JwtAuthGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  /**
   * Create a new branch
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createBranchDto: CreateBranchDto,
    @Query('organizationId') organizationId: string,
    @Req() req: any,
  ) {
    const orgId = organizationId || (createBranchDto as any).organizationId || '';
    return this.branchesService.createBranch(
      createBranchDto,
      orgId,
      req.user.userId,
    );
  }

  /**
   * Get all branches (paginated)
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
          { name: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
        ],
      };
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
  ) {
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
  async getActiveBranches(@Param('organizationId') organizationId: string) {
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
   */
  @Put(':id')
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
   */
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.branchesService.softDelete(id, req.user.userId);
  }
}
