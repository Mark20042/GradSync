import jwt from "jsonwebtoken";
import type { Response } from "express";
import type { Types } from "mongoose";
import { env } from "@/config/environment.js";

interface TokenUser {
  _id: Types.ObjectId;
  email: string;
  role: string;
}

export const generateTokens = (user: TokenUser, res: Response): string => {
  const accessToken = jwt.sign(
    {
      userId: String(user._id),
      email: user.email,
      role: user.role,
    },
    env.JWT_SECRET as jwt.Secret,
    {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions,
  );

  const days = parseInt(env.JWT_COOKIE_EXPIRES_IN || "60");
  const cookieMaxAge = days * 24 * 60 * 60 * 1000;

  const isProduction = env.NODE_ENV === "production";

  res.cookie("accessToken", accessToken, {
    httpOnly: true, // Prevents XSS attacks
    secure: isProduction, // Only sends over HTTPS in production
    sameSite: isProduction ? "none" : "strict",
    maxAge: cookieMaxAge,
  });

  return accessToken;
};
