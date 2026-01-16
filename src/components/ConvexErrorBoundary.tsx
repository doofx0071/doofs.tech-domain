import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, RefreshCcw, AlertTriangle } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { isSessionError, isSuspendedError } from "@/lib/error-handling";

// Admin route from environment variable
const ADMIN_PATH = import.meta.env.VITE_ADMIN_ROUTE;

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Wrapper to use hooks in class component
const ErrorBoundaryContent = ({ error, reset }: { error: Error, reset: () => void }) => {
  const { signOut } = useAuthActions();

  // Detect if we're on an admin route
  const isAdminRoute = ADMIN_PATH && window.location.pathname.startsWith(ADMIN_PATH);

  const handleLogout = async () => {
    await signOut();
    // Redirect to admin login if on admin route, otherwise regular login
    if (isAdminRoute && ADMIN_PATH) {
      window.location.href = ADMIN_PATH;
    } else {
      window.location.href = "/login";
    }
  };

  // Use centralized error detection functions
  const isSession = isSessionError(error);
  const isSuspended = isSuspendedError(error);
  const isAuthRelated = isSession || isSuspended;

  // Determine UI content based on error type
  const getErrorContent = () => {
    if (isSuspended) {
      return {
        title: "Account Suspended",
        message: "Your account has been suspended. Please contact support for assistance.",
        icon: <AlertTriangle className="h-6 w-6 text-orange-600" />,
        iconBg: "bg-orange-100",
        buttonText: "Sign Out",
        buttonIcon: <LogOut className="h-4 w-4" />,
      };
    }
    if (isSession) {
      return {
        title: "Session Expired",
        message: "Your session has expired. Please sign in again to continue.",
        icon: <LogOut className="h-6 w-6 text-red-600" />,
        iconBg: "bg-red-100",
        buttonText: "Sign In Again",
        buttonIcon: <LogOut className="h-4 w-4" />,
      };
    }
    return {
      title: "Something went wrong",
      message: "An unexpected error occurred. Please try again.",
      icon: <RefreshCcw className="h-6 w-6 text-red-600" />,
      iconBg: "bg-red-100",
      buttonText: "Try Again",
      buttonIcon: <RefreshCcw className="h-4 w-4" />,
    };
  };

  const content = getErrorContent();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="max-w-md space-y-6 rounded-lg border bg-white p-8 shadow-lg">
        <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${content.iconBg}`}>
          {content.icon}
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">
            {content.title}
          </h2>
          <p className="text-sm text-gray-500">
            {content.message}
          </p>
          {/* Only show technical details for non-auth errors */}
          {!isAuthRelated && (
            <p className="text-xs font-mono text-gray-400 bg-gray-100 p-2 rounded overflow-auto">
              {error.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          {isAuthRelated ? (
            <Button onClick={handleLogout} className="w-full gap-2">
              {content.buttonIcon}
              {content.buttonText}
            </Button>
          ) : (
            <Button onClick={reset} className="w-full gap-2">
              {content.buttonIcon}
              {content.buttonText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export class ConvexErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Use centralized error detection for logging
    if (isSessionError(error) || isSuspendedError(error)) {
      console.warn("Caught auth-related error:", error);
    } else {
      console.error("Uncaught error:", error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError && this.state.error) {
      return (
        <ErrorBoundaryContent 
          error={this.state.error} 
          reset={this.handleReset} 
        />
      );
    }

    return this.props.children;
  }
}
