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
import { RestocksModule } from './restocks/restocks.module';
import { CommonModule } from './common/common.module';

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
    InventoryModule,
    RestocksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
