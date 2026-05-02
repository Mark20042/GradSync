import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthenticatedError } from "@/errors/index.js";
import { env } from "@/config/environment.js";
import User from "@/models/User.model.js";

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticationMiddleware = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    throw new UnauthenticatedError("No token provided");
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;

    // Attach the full user document (minus password) so controllers have access to all user fields
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      throw new UnauthenticatedError("User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof UnauthenticatedError) throw error;
    throw new UnauthenticatedError("Not authorized to access this route");
  }
};

export const adminMiddleware = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.user?.isAdmin) {
    throw new UnauthenticatedError("Admin access required");
  }
  next();
};
