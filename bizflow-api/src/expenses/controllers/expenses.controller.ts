import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ExpensesService } from '../services/expenses.service';
import { CreateExpenseDto, ExpensePaymentDto, UpdateExpenseDto } from '../dto/expense.dto';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  async create(@Body() dto: CreateExpenseDto) {
    return this.expensesService.create(dto);
  }

  @Get('organization/:orgId')
  async byOrganization(@Param('orgId') orgId: string, @Query('page') page = '1', @Query('limit') limit = '20') {
    return this.expensesService.findByOrganization(orgId, Number(page), Number(limit));
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.expensesService.findById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateExpenseDto) {
    return this.expensesService.update(id, dto);
  }

  @Post(':id/payments')
  async recordPayment(@Param('id') id: string, @Body() body: { payment: ExpensePaymentDto }, @Req() req: any) {
    return this.expensesService.recordPayment(id, body.payment, req.user?.userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.expensesService.delete(id, req.user?.userId);
  }
}
