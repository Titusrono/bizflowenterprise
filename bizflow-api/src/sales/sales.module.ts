import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryModule } from '../inventory/inventory.module';
import { SalesController } from './controllers/sales.controller';
import { SalesRepository } from './repositories/sales.repository';
import { Sale, SaleSchema } from './schemas/sale.schema';
import { SalesService } from './services/sales.service';

@Module({
  imports: [
    InventoryModule,
    MongooseModule.forFeature([{ name: Sale.name, schema: SaleSchema }]),
  ],
  controllers: [SalesController],
  providers: [SalesRepository, SalesService],
  exports: [SalesRepository, SalesService],
})
export class SalesModule {}
