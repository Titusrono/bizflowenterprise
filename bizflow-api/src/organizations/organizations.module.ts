import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Organization, OrganizationSchema } from './schemas/organization.schema';
import { OrganizationsRepository } from './repositories/organizations.repository';
import { OrganizationsService } from './services/organizations.service';
import { OrganizationsController } from './controllers/organizations.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Organization.name, schema: OrganizationSchema },
    ]),
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsRepository, OrganizationsService],
  exports: [OrganizationsService, OrganizationsRepository],
})
export class OrganizationsModule {}
