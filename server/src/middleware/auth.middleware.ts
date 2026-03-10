import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AuthRequest } from "../types";
import { UnauthorizedError, ForbiddenError } from "./errorHandler";
import { UserRole } from "@eventshere/shared";

interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    throw new UnauthorizedError("No token provided");

  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, env.JWT.ACCESS_SECRET) as JwtPayload;
    (req as AuthRequest).user = payload;
    next();
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest;
    if (!roles.includes(authReq.user.role)) {
      throw new ForbiddenError(
        "You do not have permission to perform this action",
      );
    }
    next();
  };
}
