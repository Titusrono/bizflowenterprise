import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SuppliersController } from './controllers/suppliers.controller';
import { SuppliersRepository } from './repositories/suppliers.repository';
import { SuppliersService } from './services/suppliers.service';
import { Supplier, SupplierSchema } from './schemas/supplier.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Supplier.name, schema: SupplierSchema }])],
  controllers: [SuppliersController],
  providers: [SuppliersRepository, SuppliersService],
  exports: [SuppliersRepository, SuppliersService],
})
export class SuppliersModule {}