import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { log } from 'node:console';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Foydalanuvchi topilmadi');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);
 
    

    if (!hasRole) {
      throw new ForbiddenException('Sizda bu amalni bajarish uchun ruxsat yo\'q');
    }

    return true;
  }
}