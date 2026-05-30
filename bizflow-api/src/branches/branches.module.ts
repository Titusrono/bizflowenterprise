import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Branch, BranchSchema } from './schemas/branch.schema';
import { BranchesRepository } from './repositories/branches.repository';
import { BranchesService } from './services/branches.service';
import { BranchesController } from './controllers/branches.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Branch.name, schema: BranchSchema }]),
  ],
  controllers: [BranchesController],
  providers: [BranchesRepository, BranchesService],
  exports: [BranchesService, BranchesRepository],
})
export class BranchesModule {}
