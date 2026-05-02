import type { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

export const validateBody = (schema: z.ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: "Validation failed",
          details: error.issues.map((e) => ({
            path: e.path[0],
            message: e.message,
          })),
        });
        return;
      }
      // pass the error to the global error handler
      next(error);
    }
  };
};
