import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    logger.warn(`[${err.statusCode}] ${err.message} — ${req.method} ${req.url}`);
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
    });
    return;
  }

  // Prisma client validation error (e.g. unknown arguments or invalid types)
  if (err.name === 'PrismaClientValidationError') {
    logger.warn(`Prisma Validation Error: ${err.message.split('\n').pop() || err.message}`);
    res.status(400).json({
      success: false,
      error: 'Invalid input parameters or field types provided.',
      code: 'VALIDATION_ERROR',
    });
    return;
  }

  // Prisma known request errors
  if ('code' in err && typeof err.code === 'string') {
    if (err.code === 'P2002') {
      res.status(409).json({ success: false, error: 'A record with this data already exists.', code: 'DUPLICATE_ENTRY' });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ success: false, error: 'Record not found.', code: 'NOT_FOUND' });
      return;
    }
    if (err.code === 'P2003') {
      res.status(400).json({ success: false, error: 'Related record reference not found.', code: 'FOREIGN_KEY_VIOLATION' });
      return;
    }
  }

  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack, url: req.url });
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
};
