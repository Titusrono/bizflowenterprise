import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApproveRestockRequestDto, CreateRestockRequestDto, UpdateRestockRequestDto } from '../dto/restock.dto';
import { RestockService } from '../services/restock.service';

@Controller('restocks')
@UseGuards(JwtAuthGuard)
export class RestockController {
  constructor(private readonly restockService: RestockService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateRestockRequestDto, @Req() req: any) {
    return this.restockService.createRestockRequest(
      createDto,
      req.user.userId,
      req.user.organizationId,
      req.user.branchId || null,
    );
  }

  @Get()
  async findAll(
    @Req() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('branchId') branchId?: string,
  ) {
    return this.restockService.getRestocksByOrganization(
      req.user.organizationId,
      branchId || req.user.branchId || null,
      parseInt(page) || 1,
      parseInt(limit) || 10,
    );
  }

  @Get('stats/summary')
  async stats(@Req() req: any, @Query('branchId') branchId?: string) {
    return this.restockService.getRestockStats(req.user.organizationId, branchId || req.user.branchId || null);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.restockService.getById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateRestockRequestDto, @Req() req: any) {
    return this.restockService.updateRestockRequest(
      id,
      updateDto,
      req.user.userId,
      req.user.organizationId,
      req.user.branchId || null,
    );
  }

  @Post(':id/submit')
  async submit(@Param('id') id: string, @Req() req: any) {
    return this.restockService.submitRestockRequest(id, req.user.userId);
  }

  @Post(':id/approve')
  async approve(@Param('id') id: string, @Body() approveDto: ApproveRestockRequestDto, @Req() req: any) {
    return this.restockService.approveRestockRequest(id, approveDto, req.user.userId);
  }

  @Post(':id/reject')
  async reject(@Param('id') id: string, @Body() body: { approvalNotes?: string }, @Req() req: any) {
    return this.restockService.rejectRestockRequest(id, body?.approvalNotes, req.user.userId);
  }
}
