import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Github, ShieldCheck } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import logoLight from "@/assets/doofs-logo-light.svg";
import logoDark from "@/assets/doofs-logo-dark.svg";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useToast } from "@/hooks/use-toast";

// Security: Standard admin path - access control enforced by backend
const ADMIN_PATH = "/admin";

export const AdminLogin = () => {
  const { theme } = useTheme();
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.currentUser);
  const hasAdmin = useQuery(api.admin.hasAdmin);
  const makeMeAdmin = useMutation(api.admin.makeMeAdmin);
  const [isSettingUpAdmin, setIsSettingUpAdmin] = useState(false);

  // Redirect to admin dashboard if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      navigate(`${ADMIN_PATH}/dashboard`);
    } else if (isAuthenticated && user?.role !== "admin") {
      // If logged in but not admin, check if we need to make them admin
      if (hasAdmin === false && !isSettingUpAdmin) {
        // No admin exists yet, make this user admin
        setIsSettingUpAdmin(true);
        makeMeAdmin()
          .then(() => {
            toast({
              title: "Admin Setup Complete",
              description: "You are now the admin!",
            });
            // Refresh to get updated user role
            window.location.reload();
          })
          .catch((error) => {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive",
            });
            // Not admin and can't become admin, redirect to regular dashboard
            navigate("/dashboard");
          });
      } else if (hasAdmin === true) {
        // Admin exists but this user isn't admin, block access
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
        navigate("/dashboard");
      }
    }
  }, [isAuthenticated, user, hasAdmin, navigate, makeMeAdmin, isSettingUpAdmin, toast]);

  /* New Popup Logic */
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubSignIn = () => {
    setIsLoading(true);
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    // Open the popup pointing to our helper route
    const popup = window.open(
      "/auth/github-start",
      "github_login_popup",
      `width=${width},height=${height},left=${left},top=${top},resizable,scrollbars=yes,status=1`
    );

    // Listen for the "LOGIN_SUCCESS" message from the popup
    const handleMessage = (event: MessageEvent) => {
      // Security check: ensure origin matches
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === "LOGIN_SUCCESS") {
        console.log("Popup login success!");
        setIsLoading(false);
        if (popup) popup.close();
        window.removeEventListener("message", handleMessage);
        // The existing useEffect will detect isAuthenticated changes and redirect
      }
    };

    window.addEventListener("message", handleMessage);

    // Clean up if popup is closed manually
    const timer = setInterval(() => {
      if (popup && popup.closed) {
        clearInterval(timer);
        setIsLoading(false);
        window.removeEventListener("message", handleMessage);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white relative text-gray-800 flex flex-col overflow-hidden">
      {/* White Sphere Grid Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "white",
          backgroundImage: `
            linear-gradient(to right, rgba(71, 85, 105, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(71, 85, 105, 0.1) 1px, transparent 1px),
            radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 40%, transparent 80%)
          `,
          backgroundSize: "32px 32px, 32px 32px, 100% 100%",
        }}
      />
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 md:py-12 relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-6 md:mb-8">
            <Link to="/" className="flex items-center justify-center gap-2 mb-3 md:mb-4">
              <img
                key={theme}
                src={theme === "dark" ? logoDark : logoLight}
                alt="doofs.tech logo"
                className="h-8 md:h-10 w-auto"
              />
              <span className="font-mono font-bold text-xl sm:text-2xl tracking-tight">
                doofs<span className="text-muted-foreground text-[10px] sm:text-xs">.tech</span>
              </span>
            </Link>
            <div className="flex items-center justify-center gap-2 mb-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <h1 className="text-xl sm:text-2xl font-bold">
                Admin Access
              </h1>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              Sign in with your admin GitHub account
            </p>
          </div>

          <div className="border-2 border-primary/20 bg-card p-4 sm:p-5 md:p-6">
            <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-xs text-muted-foreground text-center">
                {hasAdmin === false
                  ? "🎉 No admin exists yet. You'll become the admin after signing in!"
                  : "⚠️ Admin access only. Unauthorized access is prohibited."
                }
              </p>
            </div>

            <Button
              type="button"
              variant="default"
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleGitHubSignIn}
              disabled={isLoading}
            >
              <Github className="h-5 w-5" />
              {isLoading ? "Signing in..." : "Sign in with GitHub (Admin)"}
            </Button>
          </div>

          {/* Back to home button - below the form */}
          <div className="mt-6 md:mt-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="text-xs sm:text-sm">Back to home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
