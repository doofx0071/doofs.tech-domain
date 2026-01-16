import { useState, useEffect, useCallback } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Plus, Pencil, Globe, RefreshCw } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { formatError } from "@/lib/error-handling";

interface PlatformDnsRecordsProps {
    platformDomainId: any;
    domain: string;
    isOpen: boolean;
    onClose: () => void;
}

type RecordType = "A" | "AAAA" | "CNAME" | "TXT" | "MX";

export function PlatformDnsRecords({ platformDomainId, domain, isOpen, onClose }: PlatformDnsRecordsProps) {
    const listRecords = useAction(api.platformDns.listRecords);
    const createRecord = useMutation(api.platformDns.createRecord);
    const updateRecord = useMutation(api.platformDns.updateRecord);
    const deleteRecordAction = useAction(api.platformDns.deleteRecordByProviderId);
    const { toast } = useToast();

    // Records state
    const [records, setRecords] = useState<any[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [type, setType] = useState<RecordType>("A");
    const [name, setName] = useState("@");
    const [content, setContent] = useState("");
    const [priority, setPriority] = useState("");
    const [ttl, setTtl] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    // Edit state
    const [editingRecord, setEditingRecord] = useState<any>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editLoading, setEditLoading] = useState(false);

    // Delete state
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const fetchRecords = useCallback(async () => {
        if (!platformDomainId) return;
        setIsLoading(true);
        try {
            const result = await listRecords({ platformDomainId });
            setRecords(result);
        } catch (error: any) {
            toast({ title: "Error", description: formatError(error), variant: "destructive" });
            setRecords([]);
        } finally {
            setIsLoading(false);
        }
    }, [platformDomainId, listRecords, toast]);

    useEffect(() => {
        if (isOpen && platformDomainId) {
            fetchRecords();
        } else {
            setRecords(null);
        }
    }, [isOpen, platformDomainId, fetchRecords]);

    const resetForm = () => {
        setType("A");
        setName("@");
        setContent("");
        setPriority("");
        setTtl("");
    };

    const handleCreate = async () => {
        if (!name || !content) return;
        setIsCreating(true);
        try {
            await createRecord({
                platformDomainId,
                type,
                name,
                content,
                priority: type === "MX" ? parseInt(priority) || 10 : undefined,
                ttl: ttl ? parseInt(ttl) : undefined,
            });
            toast({ title: "Record created", description: "DNS record has been queued for creation." });
            resetForm();
            // Refresh after a short delay to allow Cloudflare propagation
            setTimeout(() => fetchRecords(), 2000);
        } catch (error: any) {
            toast({ title: "Error", description: formatError(error), variant: "destructive" });
        } finally {
            setIsCreating(false);
        }
    };

    const openEdit = (record: any) => {
        setEditingRecord(record);
        setType(record.type);
        setName(record.name);
        setContent(record.content);
        setPriority(record.priority?.toString() || "");
        setTtl(record.ttl?.toString() || "");
        setIsEditOpen(true);
    };

    const handleUpdate = async () => {
        if (!editingRecord || !name || !content) return;
        setEditLoading(true);
        try {
            await updateRecord({
                recordId: editingRecord._id,
                type,
                name,
                content,
                priority: type === "MX" ? parseInt(priority) || 10 : undefined,
                ttl: ttl ? parseInt(ttl) : undefined,
            });
            toast({ title: "Record updated", description: "Changes have been saved." });
            setIsEditOpen(false);
            setEditingRecord(null);
            resetForm();
        } catch (error: any) {
            toast({ title: "Error", description: formatError(error), variant: "destructive" });
        } finally {
            setEditLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteRecordAction({
                platformDomainId,
                providerRecordId: deleteId
            });
            toast({ title: "Record deleted", description: "Deletion completed." });
            setDeleteId(null);
            // Refresh records list
            fetchRecords();
        } catch (error: any) {
            toast({ title: "Error", description: formatError(error), variant: "destructive" });
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive"> = {
            active: "default",
            pending: "secondary",
            error: "destructive",
            deleting: "secondary",
        };
        return (
            <Badge variant={variants[status] || "secondary"} className="text-[10px] h-5 px-1.5">
                {status}
            </Badge>
        );
    };

    return (
        <>
            <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <SheetContent className="w-full sm:max-w-[700px] overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            DNS Records
                        </SheetTitle>
                        <SheetDescription className="flex items-center justify-between">
                            <span>Manage DNS records for {domain}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={fetchRecords}
                                disabled={isLoading}
                            >
                                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </Button>
                        </SheetDescription>
                    </SheetHeader>

                    <div className="py-6 space-y-6">
                        {/* Create Form */}
                        <div className="p-4 border rounded-lg space-y-4 bg-muted/50">
                            <h3 className="font-medium text-sm">Add Record</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <div>
                                        <Label className="text-xs">Type</Label>
                                        <Select value={type} onValueChange={(v: RecordType) => setType(v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="A">A</SelectItem>
                                                <SelectItem value="AAAA">AAAA</SelectItem>
                                                <SelectItem value="CNAME">CNAME</SelectItem>
                                                <SelectItem value="TXT">TXT</SelectItem>
                                                <SelectItem value="MX">MX</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="text-xs">Name</Label>
                                        <Input
                                            placeholder="@ or subdomain"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                    {type === "MX" && (
                                        <div>
                                            <Label className="text-xs">Priority</Label>
                                            <Input
                                                type="number"
                                                placeholder="10"
                                                value={priority}
                                                onChange={(e) => setPriority(e.target.value)}
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <Label className="text-xs">TTL</Label>
                                        <Input
                                            type="number"
                                            placeholder="Auto"
                                            value={ttl}
                                            onChange={(e) => setTtl(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <Label className="text-xs">Content</Label>
                                        <Input
                                            placeholder={type === "A" ? "1.2.3.4" : type === "CNAME" ? "example.com" : "Value"}
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <Button onClick={handleCreate} disabled={isCreating || !name || !content}>
                                            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Records Table */}
                        <div className="border rounded-md overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[70px]">Type</TableHead>
                                        <TableHead className="min-w-[100px]">Name</TableHead>
                                        <TableHead className="min-w-[120px]">Content</TableHead>
                                        <TableHead className="w-[60px]">TTL</TableHead>
                                        <TableHead className="w-[80px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8">
                                                <LoadingSpinner size={32} />
                                            </TableCell>
                                        </TableRow>
                                    ) : !records || records.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                                                No DNS records found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        records.map((record: any) => (
                                            <TableRow key={record.id}>
                                                <TableCell className="font-medium">{record.type}</TableCell>
                                                <TableCell className="font-mono text-sm truncate max-w-[100px]" title={record.name}>{record.name}</TableCell>
                                                <TableCell className="font-mono text-xs truncate max-w-[120px]" title={record.content}>
                                                    {record.content}
                                                </TableCell>
                                                <TableCell className="text-xs">{record.ttl === 1 ? "Auto" : record.ttl}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 w-7 p-0"
                                                            onClick={() => openEdit(record)}
                                                        >
                                                            <Pencil className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 w-7 p-0"
                                                            onClick={() => setDeleteId(record.id)}
                                                        >
                                                            <Trash2 className="h-3 w-3 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={(open) => !open && setIsEditOpen(false)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit DNS Record</DialogTitle>
                        <DialogDescription>Update the DNS record values.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select value={type} onValueChange={(v: RecordType) => setType(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A">A</SelectItem>
                                        <SelectItem value="AAAA">AAAA</SelectItem>
                                        <SelectItem value="CNAME">CNAME</SelectItem>
                                        <SelectItem value="TXT">TXT</SelectItem>
                                        <SelectItem value="MX">MX</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Content</Label>
                            <Input value={content} onChange={(e) => setContent(e.target.value)} />
                        </div>
                        {type === "MX" && (
                            <div className="space-y-2">
                                <Label>Priority</Label>
                                <Input type="number" value={priority} onChange={(e) => setPriority(e.target.value)} />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>TTL</Label>
                            <Input type="number" placeholder="Auto" value={ttl} onChange={(e) => setTtl(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdate} disabled={editLoading}>
                            {editLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete DNS Record?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this DNS record. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
