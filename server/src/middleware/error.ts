import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  logger.error(err);
  if (res.headersSent) return;
  const status = (err as { status?: number }).status || 500;
  const message = err instanceof Error ? err.message : "Internal server error";
  res.status(status).json({ message });
}
