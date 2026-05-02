import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { CustomAPIError } from "@/errors/index.js";
import { logger } from "@/utils/logger.js";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, {
    stack: err.stack,
  });

  if (err instanceof CustomAPIError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
};
