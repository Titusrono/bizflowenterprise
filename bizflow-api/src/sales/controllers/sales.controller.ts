import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateSaleDto, PaymentStatus, RecordPaymentDto, SaleType } from '../dto/sales.dto';
import { SalesService } from '../services/sales.service';

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateSaleDto, @Req() req: any) {
    return this.salesService.createSale(
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
    @Query('saleType') saleType?: SaleType,
    @Query('paymentStatus') paymentStatus?: PaymentStatus,
  ) {
    return this.salesService.getSalesByOrganization(
      req.user.organizationId,
      branchId || req.user.branchId || null,
      saleType,
      paymentStatus,
      parseInt(page) || 1,
      parseInt(limit) || 10,
    );
  }

  @Get('stats/summary')
  async stats(@Req() req: any, @Query('branchId') branchId?: string) {
    return this.salesService.getSalesStats(req.user.organizationId, branchId || req.user.branchId || null);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.salesService.getById(id);
  }

  @Post(':id/payments')
  async recordPayment(@Param('id') id: string, @Body() body: RecordPaymentDto, @Req() req: any) {
    return this.salesService.recordPayment(id, body, req.user.userId);
  }
}
