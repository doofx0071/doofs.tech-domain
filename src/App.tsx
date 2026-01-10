import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { RequireAuth } from "@/components/RequireAuth";
import { GitHubStart } from "@/components/auth/GitHubStart";
import { PopupCallback } from "@/components/auth/PopupCallback";
import Link from "react-router-dom"; // Verify if needed, probably not.
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import About from "./pages/About";
import Docs from "./pages/Docs";
import Contact from "./pages/Contact";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const adminRoute = import.meta.env.VITE_ADMIN_ROUTE || "/admin-122303";

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
            <Routes>
              <Route path="/auth/github-start" element={<GitHubStart />} />
              <Route path="/auth/popup-callback" element={<PopupCallback />} />
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path={adminRoute} element={<AdminLogin />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/about" element={<About />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/contact" element={<Contact />} />
              <Route
                path={`${adminRoute}/dashboard/*`}
                element={
                  <RequireAuth>
                    <AdminDashboard />
                  </RequireAuth>
                }
              />
              <Route
                path="/dashboard/*"
                element={
                  <RequireAuth>
                    <ClientDashboard />
                  </RequireAuth>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ConvexClientProvider>
  </QueryClientProvider>
);

export default App;
