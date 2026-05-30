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
import { CreateInventoryDto, UpdateInventoryDto } from '../dto/inventory.dto';
import { InventoryService } from '../services/inventory.service';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createInventoryDto: CreateInventoryDto, @Req() req: any) {
    return this.inventoryService.createInventory(
      createInventoryDto,
      req.user.userId,
      req.user.organizationId,
    );
  }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    const filter: any = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { sku: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    return this.inventoryService.getAllPaginated(filter, pageNum, limitNum);
  }

  @Get('stats/summary')
  async getStatistics() {
    const all = await this.inventoryService.count();
    const active = await this.inventoryService.count({ status: 'active' });
    const lowStock = await this.inventoryService.count({ quantity: { $lte: 10 } } as any);
    const outOfStock = await this.inventoryService.count({ quantity: 0 } as any);

    return { total: all, active, lowStock, outOfStock };
  }

  @Get('organization/:organizationId/stats/summary')
  async getOrganizationStatistics(@Param('organizationId') organizationId: string) {
    return this.inventoryService.getOrganizationStats(organizationId);
  }

  @Get('organization/:organizationId')
  async getInventoryByOrganization(
    @Param('organizationId') organizationId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    return this.inventoryService.getInventoryByOrganization(organizationId, pageNum, limitNum);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.inventoryService.getById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateInventoryDto: UpdateInventoryDto, @Req() req: any) {
    return this.inventoryService.updateInventory(id, updateInventoryDto, req.user.userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.inventoryService.softDelete(id, req.user.userId);
  }
}
