import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { CustomAPIError } from "@/errors/index.js";


export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error(`${req.method} ${req.originalUrl} - ${err.message}`);
  console.error(err.stack);

  if (err instanceof CustomAPIError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  if (err.name === "ValidationError") {
    const messages = Object.values((err as any).errors).map((val: any) => val.message);
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: messages.join(", "),
    });
    return;
  }

  if (err.name === "CastError") {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: `Invalid format for field: ${(err as any).path}`,
    });
    return;
  }

  if ((err as any).code && (err as any).code === 11000) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: `Duplicate value entered for ${Object.keys((err as any).keyValue)} field, please choose another value`,
    });
    return;
  }

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: "Internal Server Error",
    message: err.message,
    stack: err.stack,
  });
};
