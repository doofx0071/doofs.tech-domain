import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { AppRoutes } from "./AppRoutes";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ConvexClientProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ConvexClientProvider>
  </QueryClientProvider>
);

export default App;
