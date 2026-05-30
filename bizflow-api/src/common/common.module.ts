import { Module } from '@nestjs/common';

/**
 * Common Module
 * Provides shared utilities, base classes, and common services
 * This module should be imported by all feature modules that need base functionality
 */
@Module({
  imports: [],
  exports: [],
  controllers: [],
  providers: [],
})
export class CommonModule {}
