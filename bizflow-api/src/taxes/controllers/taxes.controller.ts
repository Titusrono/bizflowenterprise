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
import { CreateTaxDto, UpdateTaxDto } from '../dto/tax.dto';
import { TaxesService } from '../services/taxes.service';

@Controller('taxes')
@UseGuards(JwtAuthGuard)
export class TaxesController {
  constructor(private readonly taxesService: TaxesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTaxDto: CreateTaxDto, @Req() req: any) {
    return this.taxesService.createTax(
      createTaxDto,
      req.user?.userId,
      req.user?.organizationId,
    );
  }

  @Get()
  async findAll(@Req() req: any, @Query('search') search?: string) {
    return this.taxesService.getTaxesByOrganization(req.user?.organizationId, search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.taxesService.getById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateTaxDto: UpdateTaxDto, @Req() req: any) {
    return this.taxesService.updateTax(id, updateTaxDto, req.user?.userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.taxesService.softDelete(id, req.user?.userId);
  }
}