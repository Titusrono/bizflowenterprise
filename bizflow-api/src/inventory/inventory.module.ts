import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryController } from './controllers/inventory.controller';
import { InventoryRepository } from './repositories/inventory.repository';
import { InventoryService } from './services/inventory.service';
import { Inventory, InventorySchema } from './schemas/inventory.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Inventory.name, schema: InventorySchema }])],
  controllers: [InventoryController],
  providers: [InventoryRepository, InventoryService],
  exports: [InventoryRepository, InventoryService],
})
export class InventoryModule {}
