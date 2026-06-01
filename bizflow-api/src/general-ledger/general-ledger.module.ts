import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GeneralLedger, GeneralLedgerSchema } from './schemas/general-ledger.schema';
import { GeneralLedgerRepository } from './repositories/general-ledger.repository';
import { GeneralLedgerService } from './services/general-ledger.service';
import { GeneralLedgerController } from './controllers/general-ledger.controller';
import { ChartOfAccountsModule } from '../chart-of-accounts/chart-of-accounts.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: GeneralLedger.name, schema: GeneralLedgerSchema }]),
    ChartOfAccountsModule,
  ],
  providers: [GeneralLedgerRepository, GeneralLedgerService],
  controllers: [GeneralLedgerController],
  exports: [GeneralLedgerRepository, GeneralLedgerService],
})
export class GeneralLedgerModule {}
