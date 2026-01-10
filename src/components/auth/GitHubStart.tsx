import { useAuthActions } from "@convex-dev/auth/react";
import { useEffect } from "react";

export function GitHubStart() {
    const { signIn } = useAuthActions();

    useEffect(() => {
        // Redirect logic moved here to ensure it runs in the popup context
        const startLogin = async () => {
            await signIn("github", {
                redirectTo: window.location.origin + "/auth/popup-callback"
            });
        };
        startLogin();
    }, [signIn]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Redirecting to GitHub...</p>
        </div>
    );
}
