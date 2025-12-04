import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRouteProps } from "@/types/components";

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
