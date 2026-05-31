import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreatePaymentDto, UpdatePaymentDto } from '../dto/payment.dto';
import { PaymentsService } from '../services/payments.service';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPaymentDto: CreatePaymentDto, @Req() req: any) {
    return this.paymentsService.createPayment(
      createPaymentDto,
      req.user?.userId,
      req.user?.organizationId,
    );
  }

  @Get()
  async findAll(@Req() req: any, @Query('search') search?: string) {
    return this.paymentsService.getPaymentsByOrganization(req.user?.organizationId, search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.paymentsService.getById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto, @Req() req: any) {
    return this.paymentsService.updatePayment(id, updatePaymentDto, req.user?.userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.paymentsService.softDelete(id, req.user?.userId);
  }
}