import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  BaseDocument,
  DocumentStatus,
} from '../../common/schemas/base.schema';

export type UserDocument = User & Document;

/**
 * User Roles Enum
 */
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
}

/**
 * User Schema
 * Extends BaseDocument for common fields (timestamps, soft delete, audit trail)
 */
@Schema({ timestamps: true })
export class User extends BaseDocument {
  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  })
  email: string = '';

  @Prop({ type: String, required: true })
  firstName: string = '';

  @Prop({ type: String, required: true })
  lastName: string = '';

  @Prop({ type: String, required: true })
  password: string = '';

  @Prop({ type: String, default: null })
  phone?: string;

  @Prop({ type: String, default: null })
  avatar?: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  organizationId: Types.ObjectId = new Types.ObjectId();

  @Prop({ type: Types.ObjectId, default: null, index: true })
  branchId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER,
    index: true,
  })
  role: UserRole = UserRole.USER;

  @Prop({
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
    index: true,
  })
  status: DocumentStatus = DocumentStatus.PENDING;

  @Prop({ type: Boolean, default: false })
  emailVerified: boolean = false;

  @Prop({ type: Date, default: null })
  emailVerifiedAt?: Date;

  @Prop({ type: String, default: null })
  emailVerificationToken?: string;

  @Prop({ type: String, default: null })
  passwordResetToken?: string;

  @Prop({ type: Date, default: null })
  passwordResetExpires?: Date;

  @Prop({
    enum: ['light', 'dark'],
    default: 'light',
  })
  theme: 'light' | 'dark' = 'light';

  @Prop({ type: Date, default: null })
  lastLoginAt?: Date;

  @Prop({ type: String, default: 'en' })
  language: string = 'en';

  @Prop({ type: String, default: null })
  twoFactorSecret?: string;

  @Prop({ type: Boolean, default: false })
  twoFactorEnabled: boolean = false;

  @Prop({ type: Object, default: {} })
  preferences?: Record<string, any>;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes for common queries
UserSchema.index({ organizationId: 1, status: 1 });
UserSchema.index({ branchId: 1, status: 1 });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ email: 1, isDeleted: 1 });
