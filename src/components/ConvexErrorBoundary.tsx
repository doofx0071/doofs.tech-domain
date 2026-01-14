import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, RefreshCcw } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

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

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/login";
  };

  const isSessionError = error.message.includes("Session expired") || error.message.includes("suspended");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="max-w-md space-y-6 rounded-lg border bg-white p-8 shadow-lg">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <LogOut className="h-6 w-6 text-red-600" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">
            {isSessionError ? "Session Expired" : "Something went wrong"}
          </h2>
          <p className="text-sm text-gray-500">
            {isSessionError 
              ? "Your security session has timed out. Please sign in again to continue." 
              : "An unexpected error occurred. Please try again."}
          </p>
          {!isSessionError && (
            <p className="text-xs font-mono text-gray-400 bg-gray-100 p-2 rounded overflow-auto">
              {error.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          {isSessionError ? (
            <Button onClick={handleLogout} className="w-full gap-2">
              <LogOut className="h-4 w-4" />
              Sign In Again
            </Button>
          ) : (
            <Button onClick={reset} className="w-full gap-2">
              <RefreshCcw className="h-4 w-4" />
              Try Again
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
    // We can ignore specific noisy errors if needed
    if (error.message.includes("Session expired") || error.message.includes("suspended")) {
      console.warn("Caught session error:", error);
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
