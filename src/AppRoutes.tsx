import { Routes, Route } from "react-router-dom";
import { RequireAuth } from "@/components/RequireAuth";
import { AdminRoute } from "@/components/AdminRoute";
import { GitHubStart } from "@/components/auth/GitHubStart";
import { PopupCallback } from "@/components/auth/PopupCallback";

import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import About from "./pages/About";
import Docs from "./pages/Docs";
import ApiDocs from "./pages/ApiDocs";
import Contact from "./pages/Contact";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import Tutorials from "./pages/Tutorials";
import NotFound from "./pages/NotFound";

const adminRoute = import.meta.env.VITE_ADMIN_ROUTE || "/admin-122303";

export const AppRoutes = () => {
    return (
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
            <Route path="/api" element={<ApiDocs />} />
            <Route path="/tutorials" element={<Tutorials />} />
            <Route path="/contact" element={<Contact />} />
            <Route
                path={`${adminRoute}/dashboard/*`}
                element={
                    <AdminRoute>
                        <AdminDashboard />
                    </AdminRoute>
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
    );
};
