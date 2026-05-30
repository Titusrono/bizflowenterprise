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
import { OrganizationsService } from '../services/organizations.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from '../dto/organization.dto';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  /**
   * Create a new organization
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createOrgDto: CreateOrganizationDto, @Req() req: any) {
    return this.organizationsService.createOrganization(
      createOrgDto,
      req.user.userId,
    );
  }

  /**
   * Get all organizations (paginated)
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
          { email: { $regex: search, $options: 'i' } },
        ],
      };
    }

    return this.organizationsService.getAllPaginated(filter, pageNum, limitNum);
  }

  /**
   * Get organization statistics (count by status)
   */
  @Get('stats/summary')
  async getStatistics() {
    const all = await this.organizationsService.count();
    const active = await this.organizationsService.count({ status: 'active' });
    const pending = await this.organizationsService.count({ status: 'pending' });
    const archived = await this.organizationsService.count({ status: 'archived' });

    return {
      total: all,
      active,
      pending,
      archived,
    };
  }

  /**
   * Get organization by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.organizationsService.getById(id);
  }

  /**
   * Get organization by code
   */
  @Get('code/:code')
  async findByCode(@Param('code') code: string) {
    return this.organizationsService.getByCode(code);
  }

  /**
   * Get organizations for current user
   */
  @Get('user/all')
  async getUserOrganizations(@Req() req: any) {
    return this.organizationsService.getForUser(req.user.userId);
  }

  /**
   * Update organization
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrgDto: UpdateOrganizationDto,
    @Req() req: any,
  ) {
    return this.organizationsService.updateOrganization(
      id,
      updateOrgDto,
      req.user.userId,
    );
  }

  /**
   * Add member to organization
   */
  @Post(':id/members/:userId')
  @HttpCode(HttpStatus.OK)
  async addMember(
    @Param('id') organizationId: string,
    @Param('userId') userId: string,
  ) {
    return this.organizationsService.addMember(organizationId, userId);
  }

  /**
   * Remove member from organization
   */
  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id') organizationId: string,
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    return this.organizationsService.removeMember(organizationId, userId);
  }

  /**
   * Delete organization (soft delete)
   */
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.organizationsService.softDelete(id, req.user.userId);
  }
}
