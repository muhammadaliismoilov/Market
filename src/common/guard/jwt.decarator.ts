import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/users.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);