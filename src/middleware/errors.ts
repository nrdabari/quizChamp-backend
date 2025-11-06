import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res
      .status(400)
      .json({ success: false, message: "Validation failed", errors: err });
  }
  console.error("Unhandled error:", err);
  return res
    .status(500)
    .json({ success: false, message: "Something went wrong" });
}

export function notFound(_req: Request, res: Response) {
  return res.status(404).json({ success: false, message: "Route not found" });
}
