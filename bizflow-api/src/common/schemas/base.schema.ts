import { Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';

/**
 * Base Document Class
 * All domain documents should extend this class to ensure consistency
 * Provides common fields: id, timestamps, soft delete, metadata
 *
 * NOTE: This class should NOT have @Schema decorator.
 * Only the concrete schema classes (User, Organization, etc.) should have @Schema.
 * The SchemaFactory.createForClass() will inherit these decorated properties.
 */
export abstract class BaseDocument {
  @Prop({ type: Types.ObjectId, auto: true })
  _id?: Types.ObjectId;

  /**
   * Creation timestamp
   */
  @Prop({ type: Date, default: Date.now, index: true })
  createdAt: Date = new Date();

  /**
   * Last update timestamp
   */
  @Prop({ type: Date, default: Date.now })
  updatedAt: Date = new Date();

  /**
   * Soft delete flag for data archiving
   */
  @Prop({ type: Boolean, default: false, index: true })
  isDeleted: boolean = false;

  /**
   * When the document was deleted (if isDeleted is true)
   */
  @Prop({ type: Date, default: null })
  deletedAt?: Date;

  /**
   * User ID who created the document
   */
  @Prop({ type: Types.ObjectId, required: false })
  createdBy?: Types.ObjectId;

  /**
   * User ID who last updated the document
   */
  @Prop({ type: Types.ObjectId, required: false })
  updatedBy?: Types.ObjectId;

  /**
   * Custom metadata for extensibility
   */
  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;

  /**
   * Version field for optimistic locking
   */
  @Prop({ type: Number, default: 0 })
  __v?: number;
}

/**
 * Status enum for documents
 */
export enum DocumentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  ARCHIVED = 'archived',
  SUSPENDED = 'suspended',
}

/**
 * Common status fields
 */
export class StatusFields {
  @Prop({
    enum: DocumentStatus,
    default: DocumentStatus.ACTIVE,
    index: true,
  })
  status: DocumentStatus = DocumentStatus.ACTIVE;

  @Prop({ type: String, default: null })
  statusReason?: string;

  @Prop({ type: Date, default: null })
  statusChangedAt?: Date;
}
