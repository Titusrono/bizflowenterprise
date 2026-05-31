import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsController } from './controllers/payments.controller';
import { PaymentsRepository } from './repositories/payments.repository';
import { PaymentsService } from './services/payments.service';
import { Payment, PaymentSchema } from './schemas/payment.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }])],
  controllers: [PaymentsController],
  providers: [PaymentsRepository, PaymentsService],
  exports: [PaymentsRepository, PaymentsService],
})
export class PaymentsModule {}