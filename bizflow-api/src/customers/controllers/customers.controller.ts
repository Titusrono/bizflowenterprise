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
import { CreateCustomerDto, UpdateCustomerDto } from '../dto/customer.dto';
import { CustomersService } from '../services/customers.service';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCustomerDto: CreateCustomerDto, @Req() req: any) {
    return this.customersService.createCustomer(
      createCustomerDto,
      req.user?.userId,
      req.user?.organizationId,
    );
  }

  @Get()
  async findAll(@Req() req: any, @Query('search') search?: string) {
    return this.customersService.getCustomersByOrganization(req.user?.organizationId, search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.customersService.getById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto, @Req() req: any) {
    return this.customersService.updateCustomer(id, updateCustomerDto, req.user?.userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.customersService.softDelete(id, req.user?.userId);
  }
}