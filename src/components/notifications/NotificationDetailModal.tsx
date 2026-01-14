import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, Link as LinkIcon, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

// Admin route - MUST be configured via VITE_ADMIN_ROUTE environment variable
const ADMIN_PATH = import.meta.env.VITE_ADMIN_ROUTE;

interface NotificationDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    notification: any; // Using any for flexibility with Convex return type
}

export function NotificationDetailModal({ isOpen, onClose, notification }: NotificationDetailModalProps) {
    const user = useQuery(api.users.currentUser);
    const isAdmin = user?.role === "admin";

    if (!notification) return null;

    const getIcon = () => {
        switch (notification.type) {
            case "success": return <CheckCircle2 className="w-12 h-12 text-green-500" />;
            case "error": return <AlertCircle className="w-12 h-12 text-red-500" />;
            case "warning": return <AlertTriangle className="w-12 h-12 text-yellow-500" />;
            default: return <Info className="w-12 h-12 text-blue-500" />;
        }
    };

    // Determine the link based on role
    // Client: /dashboard/dns
    // Admin: ${ADMIN_PATH}/dashboard/domains?openRoot=rootDomain
    const getLink = (): string | null => {
        if (!notification.link) return null;

        // If user is admin, always redirect to admin domains page with rootDomain for deep-link
        if (isAdmin) {
            // Prefer rootDomain (platform domain) for admin deep-linking
            const rootDomain = notification.rootDomain;
            if (rootDomain) {
                return `${ADMIN_PATH}/dashboard/domains?openRoot=${encodeURIComponent(rootDomain)}`;
            }
            // Fallback to domainId if no rootDomain
            const domainId = notification.domainId;
            if (domainId) {
                return `${ADMIN_PATH}/dashboard/domains?openDns=${domainId}`;
            }
            return `${ADMIN_PATH}/dashboard/domains`;
        }

        // For clients, redirect to DNS page
        return "/dashboard/dns";
    };

    const targetLink = getLink();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md md:max-w-lg">
                <DialogHeader>
                    <div className="flex flex-col items-center text-center gap-4 py-4">
                        {getIcon()}
                        <div className="space-y-2">
                            <DialogTitle className="text-xl">{notification.title}</DialogTitle>
                            <DialogDescription className="text-base text-foreground whitespace-pre-wrap">
                                {notification.message}
                            </DialogDescription>
                            <p className="text-xs text-muted-foreground">
                                {new Date(notification.timestamp).toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                })}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                {isAdmin && notification.adminDetails && (
                    <div className="mt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Lock className="w-3 h-3 text-muted-foreground" />
                            <h4 className="text-sm font-semibold text-muted-foreground">Technical Details (Admin Only)</h4>
                        </div>
                        <ScrollArea className="h-[150px] w-full rounded-md border p-4 bg-muted/50 code text-xs font-mono">
                            <pre className="whitespace-pre-wrap break-all">
                                {notification.adminDetails}
                            </pre>
                        </ScrollArea>
                    </div>
                )}

                <DialogFooter className="sm:justify-center gap-2 mt-4">
                    {targetLink && (
                        <Button asChild className="w-full sm:w-auto">
                            <Link to={targetLink} onClick={onClose}>
                                <LinkIcon className="w-4 h-4 mr-2" />
                                View Resource
                            </Link>
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
