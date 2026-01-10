import { useEffect } from "react";
import { useConvexAuth } from "convex/react";

export function PopupCallback() {
    const { isAuthenticated } = useConvexAuth();

    useEffect(() => {
        if (isAuthenticated) {
            // Notify opener
            if (window.opener) {
                window.opener.postMessage({ type: "LOGIN_SUCCESS" }, window.location.origin);
                window.close();
            } else {
                // Fallback if not in popup
                window.location.href = "/dashboard";
            }
        }
    }, [isAuthenticated]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Authentication successful! Closing window...</p>
        </div>
    );
}
