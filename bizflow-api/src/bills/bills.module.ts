import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Bill, BillSchema } from './schemas/bill.schema';
import { BillsController } from './controllers/bills.controller';
import { BillsService } from './services/bills.service';
import { BillsRepository } from './repositories/bills.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: Bill.name, schema: BillSchema }])],
  controllers: [BillsController],
  providers: [BillsService, BillsRepository],
  exports: [BillsService, BillsRepository],
})
export class BillsModule {}
