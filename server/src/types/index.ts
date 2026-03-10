import { Request } from 'express';
import { UserRole } from '@eventshere/shared';

export interface AuthRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
