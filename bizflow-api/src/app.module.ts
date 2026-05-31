import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { BranchesModule } from './branches/branches.module';
import { InventoryModule } from './inventory/inventory.module';
import { CategoriesModule } from './categories/categories.module';
import { RestocksModule } from './restocks/restocks.module';
import { CommonModule } from './common/common.module';
import { SalesModule } from './sales/sales.module';
import { TaxesModule } from './taxes/taxes.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGO_URI') ||
          configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    CommonModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    BranchesModule,
    CategoriesModule,
    InventoryModule,
    PaymentsModule,
    RestocksModule,
    TaxesModule,
    SalesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
