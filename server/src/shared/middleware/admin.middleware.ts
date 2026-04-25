import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../interfaces/base.interfaces.js';

/**
 * Middleware to restrict access to admin users only.
 * Must be used after the `protect` middleware.
 */
export const admin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};
