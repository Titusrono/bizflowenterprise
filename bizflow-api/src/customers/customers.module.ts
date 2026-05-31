import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomersController } from './controllers/customers.controller';
import { CustomersRepository } from './repositories/customers.repository';
import { CustomersService } from './services/customers.service';
import { Customer, CustomerSchema } from './schemas/customer.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Customer.name, schema: CustomerSchema }])],
  controllers: [CustomersController],
  providers: [CustomersRepository, CustomersService],
  exports: [CustomersRepository, CustomersService],
})
export class CustomersModule {}