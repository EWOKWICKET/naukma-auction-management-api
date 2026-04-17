import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ForbiddenError } from '../errors/ForbiddenError';

export function requireRole(role: Role) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (req.user.role !== role) {
      next(new ForbiddenError());

      return;
    }
    next();
  };
}
