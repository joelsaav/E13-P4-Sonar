import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { ProtectedRouteProps } from "@/types/components";

export default function ProtectedRoute({ children }: Readonly<ProtectedRouteProps>) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
