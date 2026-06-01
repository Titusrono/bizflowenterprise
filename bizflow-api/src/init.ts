import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { OrganizationsRepository } from './organizations/repositories/organizations.repository';
import { BranchesRepository } from './branches/repositories/branches.repository';
import { UsersRepository } from './users/repositories/users.repository';
import { Types } from 'mongoose';
import { DocumentStatus } from './common/schemas/base.schema';
import { UserDocument, UserRole } from './users/schemas/user.schema';
import { OrganizationDocument } from './organizations/schemas/organization.schema';
import { BranchDocument } from './branches/schemas/branch.schema';
import * as bcrypt from 'bcrypt';

/**
 * Initialize Database Script
 * Creates or refreshes the default organization, branch, and super admin user.
 * Usage: npm run start:init
 */
async function initialize() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    console.log('🚀 Starting BizFlow initialization...\n');

    const organizationsRepository = app.get(OrganizationsRepository);
    const branchesRepository = app.get(BranchesRepository);
    const usersRepository = app.get(UsersRepository);

    const organizationCode = 'BIZFLOW';
    const branchCode = 'MAIN';
    const adminEmail = 'superadmin@bizflow.local';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'SuperAdmin@123';
    const seededAdminId = new Types.ObjectId().toString();
    const seededOrganizationId = new Types.ObjectId().toString();
    const seededBranchId = new Types.ObjectId().toString();

    // 1. Create or update super admin first so the organization can point to a fixed owner.
    console.log('👤 Creating super admin user...');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const superAdminCreateData: Partial<UserDocument> = {
      _id: new Types.ObjectId(seededAdminId),
      email: adminEmail,
      firstName: 'Super',
      lastName: 'Admin',
      password: hashedPassword,
      phone: '+1234567890',
      role: UserRole.SUPER_ADMIN,
      status: DocumentStatus.ACTIVE,
      emailVerified: true,
      organizationId: new Types.ObjectId(seededOrganizationId),
    };
    const superAdminUpdateData: Partial<UserDocument> = {
      email: adminEmail,
      firstName: 'Super',
      lastName: 'Admin',
      password: hashedPassword,
      phone: '+1234567890',
      role: UserRole.SUPER_ADMIN,
      status: DocumentStatus.ACTIVE,
      emailVerified: true,
      organizationId: new Types.ObjectId(seededOrganizationId),
    };

    const existingSuperAdmin = await usersRepository.findByEmail(adminEmail);
    let superAdmin: UserDocument | null;
    if (existingSuperAdmin) {
      superAdmin = await usersRepository.updateById(
        existingSuperAdmin._id.toString(),
        superAdminUpdateData,
        seededAdminId,
      );
      console.log('✅ Super admin updated:', existingSuperAdmin._id);
    } else {
      superAdmin = await usersRepository.create(superAdminCreateData, seededAdminId);
      console.log('✅ Super admin created:', superAdmin._id);
    }

    // 2. Create or update organization
    console.log('\n📊 Creating organization...');
    const organizationData: Partial<OrganizationDocument> = {
      _id: new Types.ObjectId(seededOrganizationId),
      name: 'BizFlow Enterprise',
      code: organizationCode,
      email: 'admin@bizflow.local',
      phone: '+1234567890',
      country: 'United States',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      description: 'Default BizFlow enterprise organization',
      plan: 'enterprise',
      status: DocumentStatus.ACTIVE,
      ownerId: new Types.ObjectId(seededAdminId),
      members: [new Types.ObjectId(seededAdminId)],
      planStartDate: new Date(),
      maxBranches: 1,
      maxUsers: 10,
    };
    const organizationUpdateData: Partial<OrganizationDocument> = {
      name: 'BizFlow Enterprise',
      code: organizationCode,
      email: 'admin@bizflow.local',
      phone: '+1234567890',
      country: 'United States',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      description: 'Default BizFlow enterprise organization',
      plan: 'enterprise',
      status: DocumentStatus.ACTIVE,
      ownerId: new Types.ObjectId(seededAdminId),
      members: [new Types.ObjectId(seededAdminId)],
      planStartDate: new Date(),
      maxBranches: 1,
      maxUsers: 10,
    };

    const existingOrganization = await organizationsRepository.findByCode(organizationCode);
    if (existingOrganization) {
      await organizationsRepository.updateById(
        existingOrganization._id.toString(),
        organizationUpdateData,
        seededAdminId,
      );
      console.log('✅ Organization updated:', existingOrganization._id);
    } else {
      await organizationsRepository.create(organizationData, seededAdminId);
      console.log('✅ Organization created:', seededOrganizationId);
    }

    const organization = await organizationsRepository.findByCode(organizationCode);
    if (!organization) {
      throw new Error('Organization upsert failed');
    }

    // 3. Create or update default branch
    console.log('\n🏢 Creating branch...');
    const branchData: Partial<BranchDocument> = {
      _id: new Types.ObjectId(seededBranchId),
      name: 'Main Branch',
      code: branchCode,
      location: 'San Francisco HQ',
      phone: '+1234567890',
      email: 'branch@bizflow.local',
      organizationId: organization._id,
      status: DocumentStatus.ACTIVE,
    };
    const branchUpdateData: Partial<BranchDocument> = {
      name: 'Main Branch',
      code: branchCode,
      location: 'San Francisco HQ',
      phone: '+1234567890',
      email: 'branch@bizflow.local',
      organizationId: organization._id,
      status: DocumentStatus.ACTIVE,
    };

    const existingBranch = await branchesRepository.findByCode(branchCode, organization._id.toString());
    let branch: BranchDocument | null;
    if (existingBranch) {
      branch = await branchesRepository.updateById(
        existingBranch._id.toString(),
        branchUpdateData,
        seededAdminId,
      );
      console.log('✅ Branch updated:', existingBranch._id);
    } else {
      branch = await branchesRepository.create(branchData, seededAdminId);
      console.log('✅ Branch created:', seededBranchId);
    }

    if (!branch) {
      branch = await branchesRepository.findByCode(branchCode, organization._id.toString());
    }
    if (!branch) {
      throw new Error('Branch upsert failed');
    }

    if (superAdmin && organization.ownerId?.toString() !== superAdmin._id.toString()) {
      await organizationsRepository.updateById(
        organization._id.toString(),
        {
          ownerId: superAdmin._id,
          members: [superAdmin._id],
        },
        seededAdminId,
      );
    }

    const resolvedSuperAdmin =
      superAdmin ?? existingSuperAdmin ?? (await usersRepository.findByEmail(adminEmail));
    const resolvedOrganization =
      organization ?? existingOrganization ?? (await organizationsRepository.findByCode(organizationCode));
    const resolvedBranch =
      branch ?? existingBranch ?? (await branchesRepository.findByCode(branchCode, organization._id.toString()));

    if (!resolvedSuperAdmin || !resolvedOrganization || !resolvedBranch) {
      throw new Error('Failed to resolve seeded records after save');
    }

    // 4. Display Summary
    console.log('\n' + '='.repeat(60));
    console.log('✨ BizFlow Initialization Complete!');
    console.log('='.repeat(60));
    console.log('\n📋 Created Resources:');
    console.log(`  Organization: ${resolvedOrganization.name} (${resolvedOrganization.code})`);
    console.log(`  Branch: ${resolvedBranch.name} (${resolvedBranch.code})`);
    console.log(`  Super Admin: ${resolvedSuperAdmin.firstName} ${resolvedSuperAdmin.lastName}`);
    console.log('\n🔐 Login Credentials:');
    console.log(`  Email: ${resolvedSuperAdmin.email}`);
    console.log(`  Password: ${adminPassword}`);
    console.log('  Login URL: http://localhost:4200/auth/login');
    console.log('\n📝 Notes:');
    console.log('  - Re-running this script will refresh the default org, branch, and admin password');
    console.log('  - Set SEED_ADMIN_PASSWORD to override the default password');
    console.log('  - MongoDB must be running and MONGO_URI must point to the target database');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Initialization failed:', message);
    if (typeof error === 'object' && error && 'response' in error && error.response?.message) {
      console.error('   Details:', error.response.message);
    }
    process.exit(1);
  } finally {
    await app.close();
    process.exit(0);
  }
}

initialize();
