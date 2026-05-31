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
import { CreateSupplierDto, UpdateSupplierDto } from '../dto/supplier.dto';
import { SuppliersService } from '../services/suppliers.service';

@Controller('suppliers')
@UseGuards(JwtAuthGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSupplierDto: CreateSupplierDto, @Req() req: any) {
    return this.suppliersService.createSupplier(
      createSupplierDto,
      req.user?.userId,
      req.user?.organizationId,
    );
  }

  @Get()
  async findAll(@Req() req: any, @Query('search') search?: string) {
    return this.suppliersService.getSuppliersByOrganization(req.user?.organizationId, search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.suppliersService.getById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateSupplierDto: UpdateSupplierDto, @Req() req: any) {
    return this.suppliersService.updateSupplier(id, updateSupplierDto, req.user?.userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.suppliersService.softDelete(id, req.user?.userId);
  }
}