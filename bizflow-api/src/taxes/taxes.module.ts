import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaxesController } from './controllers/taxes.controller';
import { TaxesRepository } from './repositories/taxes.repository';
import { TaxesService } from './services/taxes.service';
import { Tax, TaxSchema } from './schemas/tax.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Tax.name, schema: TaxSchema }])],
  controllers: [TaxesController],
  providers: [TaxesRepository, TaxesService],
  exports: [TaxesRepository, TaxesService],
})
export class TaxesModule {}