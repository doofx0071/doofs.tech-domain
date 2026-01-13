import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { NotificationDetailModal } from "./NotificationDetailModal";
import { cn } from "@/lib/utils";

export function NotificationBell() {
    const unreadCount = useQuery(api.notifications.getUnreadCount) || 0;
    const notifications = useQuery(api.notifications.list, { limit: 10 });
    const markAsRead = useMutation(api.notifications.markAsRead);
    const markAllAsRead = useMutation(api.notifications.markAllAsRead);

    const [selectedNotification, setSelectedNotification] = useState<any>(null);
    const [isInternalOpen, setIsInternalOpen] = useState(false);

    const handleNotificationClick = async (notification: any) => {
        if (!notification.read) {
            await markAsRead({ id: notification._id });
        }
        setSelectedNotification(notification);
        // We don't close the dropdown immediately, let the user see what happened
        // But actually, we want to open the modal.
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "success": return "bg-green-500";
            case "error": return "bg-red-500";
            case "warning": return "bg-yellow-500";
            default: return "bg-blue-500";
        }
    };

    return (
        <>
            <DropdownMenu open={isInternalOpen} onOpenChange={setIsInternalOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative h-8 w-8 md:h-9 md:w-9 rounded-full">
                        <Bell className="h-4 w-4" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600 ring-2 ring-background animate-pulse" />
                        )}
                        <span className="sr-only">Notifications</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[320px] p-0">
                    <div className="flex items-center justify-between p-4 border-b">
                        <h4 className="font-semibold leading-none">Notifications</h4>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto px-2 py-1 text-xs"
                                onClick={() => markAllAsRead({})}
                            >
                                <Check className="w-3 h-3 mr-1" />
                                Mark all read
                            </Button>
                        )}
                    </div>
                    <ScrollArea className="h-[300px]">
                        {notifications?.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-sm">
                                No new notifications
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {notifications?.map((notification) => (
                                    <DropdownMenuItem
                                        key={notification._id}
                                        className={cn(
                                            "flex flex-col items-start gap-1 p-4 cursor-pointer focus:bg-accent",
                                            !notification.read && "bg-muted/50"
                                        )}
                                        onSelect={(e) => {
                                            e.preventDefault(); // Prevent closing dropdown on select if we want to manipulate state
                                            handleNotificationClick(notification);
                                            // Actually prompt the modal outside
                                        }}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex items-center gap-2 w-full">
                                            <div className={cn("w-2 h-2 rounded-full shrink-0", getTypeColor(notification.type))} />
                                            <span className={cn("text-sm font-medium flex-1 truncate", !notification.read && "font-semibold")}>
                                                {notification.title}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                {new Date(notification.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 pl-4">
                                            {notification.message}
                                        </p>
                                    </DropdownMenuItem>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                    <DropdownMenuSeparator />
                    <div className="p-2 text-center">
                        {/* Could add a "View All" link later */}
                        <span className="text-[10px] text-muted-foreground">Showing last 10</span>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            {selectedNotification && (
                <NotificationDetailModal
                    isOpen={!!selectedNotification}
                    onClose={() => setSelectedNotification(null)}
                    notification={selectedNotification}
                />
            )}
        </>
    );
}
