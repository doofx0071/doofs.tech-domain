import { useConvexAuth } from "convex/react";
import { Navigate, useLocation } from "react-router-dom";
import { GlobalLoading } from "@/components/ui/loading-spinner";

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <GlobalLoading />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
