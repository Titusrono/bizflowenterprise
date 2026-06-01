import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChartOfAccount, ChartOfAccountSchema } from './schemas/chart-of-account.schema';
import { ChartOfAccountRepository } from './repositories/chart-of-account.repository';
import { ChartOfAccountService } from './services/chart-of-account.service';
import { ChartOfAccountController } from './controllers/chart-of-account.controller';
import { ChartOfAccountSeederService } from './seeders/chart-of-account.seeder';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ChartOfAccount.name, schema: ChartOfAccountSchema }]),
  ],
  providers: [ChartOfAccountRepository, ChartOfAccountService, ChartOfAccountSeederService],
  controllers: [ChartOfAccountController],
  exports: [ChartOfAccountRepository, ChartOfAccountService, ChartOfAccountSeederService],
})
export class ChartOfAccountsModule {}
