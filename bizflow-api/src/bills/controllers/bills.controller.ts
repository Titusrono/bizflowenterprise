import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { BillsService } from '../services/bills.service';
import { BillPaymentDto, CreateBillDto, UpdateBillDto } from '../dto/bill.dto';

@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post()
  async create(@Body() dto: CreateBillDto) {
    return this.billsService.create(dto);
  }

  @Get('organization/:orgId')
  async byOrganization(@Param('orgId') orgId: string, @Query('page') page = '1', @Query('limit') limit = '20') {
    return this.billsService.findByOrganization(orgId, Number(page), Number(limit));
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.billsService.findById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateBillDto) {
    return this.billsService.update(id, dto);
  }

  @Post(':id/payments')
  async recordPayment(@Param('id') id: string, @Body() body: { payment: BillPaymentDto }, @Req() req: any) {
    return this.billsService.recordPayment(id, body.payment, req.user?.userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.billsService.delete(id, req.user?.userId);
  }
}
