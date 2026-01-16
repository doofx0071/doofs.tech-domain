import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Mail, CheckCircle, XCircle, Reply } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { format } from "date-fns";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";

export function AdminMessages() {
    const messages = useQuery(api.contact.list);
    const updateStatus = useMutation(api.contact.updateStatus);
    const deleteMessage = useMutation(api.contact.deleteMessage);
    const { toast } = useToast();

    const [selectedMessage, setSelectedMessage] = useState<Doc<"messages"> | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const handleStatusUpdate = async (id: Id<"messages">, status: "read" | "unread" | "replied") => {
        try {
            await updateStatus({ id, status });
            toast({ title: "Status updated" });
            if (selectedMessage?._id === id) {
                setSelectedMessage(current => current ? { ...current, status } : null);
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
        }
    };

    const handleDelete = async (id: Id<"messages">) => {
        if (!confirm("Are you sure you want to delete this message?")) return;
        try {
            await deleteMessage({ id });
            toast({ title: "Message deleted" });
            if (selectedMessage?._id === id) setIsDetailsOpen(false);
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete message.", variant: "destructive" });
        }
    };

    const openDetails = (msg: Doc<"messages">) => {
        // If opening an unread message, mark it as read automatically? optional. 
        // Let's keep it manual for now or "mark read on open" logic.
        if (msg.status === "unread") {
            handleStatusUpdate(msg._id, "read");
            // We optimistically update the selected message status for the dialog
            msg = { ...msg, status: "read" };
        }
        setSelectedMessage(msg);
        setIsDetailsOpen(true);
    };

    if (!messages) {
        return (
            <div className="flex items-center justify-center p-8 min-h-[400px]">
                <LoadingSpinner showText text="Loading messages..." />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Messages</h2>
                    <p className="text-muted-foreground">
                        Manage contact form submissions.
                    </p>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>From</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {messages.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No messages found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            messages.map((msg) => (
                                <TableRow key={msg._id} className="cursor-pointer hover:bg-muted/50" onClick={() => openDetails(msg)}>
                                    <TableCell>
                                        <Badge variant={msg.status === "unread" ? "destructive" : msg.status === "replied" ? "default" : "secondary"}>
                                            {msg.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">{msg.subject}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{msg.name}</span>
                                            <span className="text-xs text-muted-foreground">{msg.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{format(msg.createdAt, "MMM d, yyyy HH:mm")}</TableCell>
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleStatusUpdate(msg._id, "unread")}>
                                                    Mark as Unread
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusUpdate(msg._id, "replied")}>
                                                    Mark as Replied
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(msg._id)}>
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{selectedMessage?.subject}</DialogTitle>
                        <DialogDescription>
                            From: {selectedMessage?.name} ({selectedMessage?.email}) - {selectedMessage && format(selectedMessage.createdAt, "PPpp")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="my-4 p-4 border rounded-md bg-muted/20 text-sm whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
                        {selectedMessage?.message}
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" asChild>
                            <a href={`mailto:${selectedMessage?.email}?subject=Re: ${selectedMessage?.subject}`}>
                                <Reply className="mr-2 h-4 w-4" /> Reply via Email
                            </a>
                        </Button>
                        <Button variant="secondary" onClick={() => setIsDetailsOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
