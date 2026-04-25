import jwt from 'jsonwebtoken';
import type { Response, NextFunction } from 'express';
import { env } from '../config/environment.js';
import User from '../models/User.model.js';
import type { AuthenticatedRequest } from '../interfaces/base.interfaces.js';

interface JwtPayload {
  id: string;
}

/**
 * JWT authentication middleware.
 * Extracts Bearer token from Authorization header, verifies it,
 * and attaches the authenticated user to `req.user`.
 */
export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ message: 'Not authorized, no token' });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(401).json({ message: 'Token Failed', error: message });
  }
};
