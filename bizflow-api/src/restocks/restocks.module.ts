import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryModule } from '../inventory/inventory.module';
import { RestockController } from './controllers/restock.controller';
import { RestockRepository } from './repositories/restock.repository';
import { RestockRequest, RestockRequestSchema } from './schemas/restock.schema';
import { RestockService } from './services/restock.service';

@Module({
  imports: [
    InventoryModule,
    MongooseModule.forFeature([{ name: RestockRequest.name, schema: RestockRequestSchema }]),
  ],
  controllers: [RestockController],
  providers: [RestockRepository, RestockService],
  exports: [RestockRepository, RestockService],
})
export class RestocksModule {}
