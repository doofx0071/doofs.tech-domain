import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navigate, useLocation } from "react-router-dom";
import { GlobalLoading } from "@/components/ui/loading-spinner";

export function AdminRoute({ children }: { children: JSX.Element }) {
    const isAdmin = useQuery(api.admin.isAdmin);
    const location = useLocation();

    // If undefined, it's still loading
    if (isAdmin === undefined) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <GlobalLoading />
            </div>
        );
    }

    if (!isAdmin) {
        // Redirect to home or login, keeping the history clean
        return <Navigate to="/" replace />;
    }

    return children;
}
