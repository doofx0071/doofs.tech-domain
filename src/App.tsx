import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { AppRoutes } from "./AppRoutes";
import { ConvexErrorBoundary } from "@/components/ConvexErrorBoundary";
import { SplashScreen } from "@/components/SplashScreen";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { PWAUpdatePrompt } from "@/components/PWAUpdatePrompt";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

// Suppress InvalidAccountId errors from auth internal checks
const originalError = console.error;
console.error = function (...args: any[]) {
  const message = String(args[0]);
  if (message.includes("InvalidAccountId")) {
    return; // Suppress this error
  }
  originalError.apply(console, args);
};

function AppContent() {
  const [showSplash, setShowSplash] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if user has seen the splash screen in this session
    const hasSeenSplash = sessionStorage.getItem("hasSeenSplash");
    if (!hasSeenSplash) {
      setShowSplash(true);
    }
    setIsReady(true);

    // Log PWA status for debugging
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    console.log("[PWA] Running in standalone mode:", isStandalone);
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem("hasSeenSplash", "true");
    setShowSplash(false);
  };

  if (!isReady) {
    return null; // Prevent flash of content before checking
  }

  return (
    <>
      {showSplash && (
        <SplashScreen
          onComplete={handleSplashComplete}
        />
      )}
      <div
        className={`transition-opacity duration-500 ${
          showSplash ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* PWA Components */}
        <PWAInstallPrompt delay={5000} maxPrompts={3} />
        <PWAUpdatePrompt delay={2000} />
        
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ConvexErrorBoundary>
            <AppRoutes />
          </ConvexErrorBoundary>
        </BrowserRouter>
      </div>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ConvexClientProvider>
      <ThemeProvider>
        <TooltipProvider>
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </ConvexClientProvider>
  </QueryClientProvider>
);

export default App;
