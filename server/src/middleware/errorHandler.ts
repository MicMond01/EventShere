import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError     extends AppError { constructor(resource = 'Resource') { super(`${resource} not found`, 404); } }
export class UnauthorizedError extends AppError { constructor(msg = 'Unauthorized')  { super(msg, 401); } }
export class ForbiddenError    extends AppError { constructor(msg = 'Forbidden')     { super(msg, 403); } }
export class ValidationError   extends AppError { constructor(msg: string)           { super(msg, 400); } }
export class ConflictError     extends AppError { constructor(msg: string)           { super(msg, 409); } }

export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  console.error('Unexpected error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
}
