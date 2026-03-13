import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/hooks/useAuth";
import type { UserRole } from "@eventshere/shared";
import { ROUTE_PATHS } from "./routePaths";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

/**
 * Route guard that checks authentication state and optionally restricts
 * access to specific user roles.
 */
export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.LOGIN} replace />;
  }

  if (allowedRoles && user) {
    const userRole = (user as { role: UserRole }).role;
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to={ROUTE_PATHS.HOME} replace />;
    }
  }

  return <>{children}</>;
}
