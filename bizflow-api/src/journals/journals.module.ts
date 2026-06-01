import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Journal, JournalSchema } from './schemas/journal.schema';
import { JournalRepository } from './repositories/journal.repository';
import { JournalService } from './services/journal.service';
import { JournalController } from './controllers/journal.controller';
import { ChartOfAccountsModule } from '../chart-of-accounts/chart-of-accounts.module';
import { GeneralLedgerModule } from '../general-ledger/general-ledger.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Journal.name, schema: JournalSchema }]),
    ChartOfAccountsModule,
    GeneralLedgerModule,
  ],
  providers: [JournalRepository, JournalService],
  controllers: [JournalController],
  exports: [JournalRepository, JournalService],
})
export class JournalsModule {}
