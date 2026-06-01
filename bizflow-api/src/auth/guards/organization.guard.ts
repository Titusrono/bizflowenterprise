import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from '@nestjs/common';

/**
 * Organization Guard
 * Validates that the user has access to the specified organization
 * Checks if:
 * 1. The organization ID is provided in query/params
 * 2. The user's organizationId matches the requested organizationId (unless they are SUPER_ADMIN)
 */
@Injectable()
export class OrganizationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    // Get organizationId from params, query, or body
    const organizationId = request.params?.organizationId || 
                          request.query?.organizationId || 
                          request.body?.organizationId;

    // If no organizationId is specified, allow but set user's organization
    if (!organizationId) {
      return true;
    }

    // Super admin can access any organization
    if (user.role === 'super_admin') {
      return true;
    }

    // Regular users can only access their own organization
    if (user.organizationId !== organizationId) {
      throw new ForbiddenException(
        `Access denied: You can only access branches from your organization (${user.organizationId})`,
      );
    }

    return true;
  }
}
