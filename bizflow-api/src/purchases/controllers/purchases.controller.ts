import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PurchasesService } from '../services/purchases.service';
import { ConvertPurchaseToBillDto, CreatePurchaseDto, PurchaseReceiptDto, UpdatePurchaseDto } from '../dto/purchase.dto';

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post()
  async create(@Body() dto: CreatePurchaseDto) {
    return this.purchasesService.create(dto);
  }

  @Get('organization/:orgId')
  async byOrganization(@Param('orgId') orgId: string, @Query('page') page = '1', @Query('limit') limit = '20') {
    return this.purchasesService.findByOrganization(orgId, Number(page), Number(limit));
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.purchasesService.findById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePurchaseDto) {
    return this.purchasesService.update(id, dto);
  }

  @Post(':id/receive')
  async receive(@Param('id') id: string, @Body() dto: PurchaseReceiptDto) {
    return this.purchasesService.recordReceipt(id, dto);
  }

  @Post(':id/approve')
  async approve(@Param('id') id: string) {
    return this.purchasesService.approve(id);
  }

  @Post(':id/mark-paid')
  async markPaid(@Param('id') id: string) {
    return this.purchasesService.markPaid(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.purchasesService.delete(id);
  }

  @Post(':id/convert-to-bill')
  async convertToBill(@Param('id') id: string, @Body() dto: ConvertPurchaseToBillDto) {
    return this.purchasesService.convertToBill(id, undefined, dto?.source);
  }
}
