import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    SheetTrigger,
} from "@/components/ui/sheet";
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
import { Loader2, Trash2, Plus, Globe } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { formatError } from "@/lib/error-handling";

interface DnsRecordsProps {
    domainId: any; // ID<"domains">
    subdomain: string;
    rootDomain: string;
    isOpen?: boolean;
    onClose?: () => void;
}

export function DnsRecords({ domainId, subdomain, rootDomain, isOpen, onClose }: DnsRecordsProps) {
    const records = useQuery(api.dns.listRecords, { domainId });
    const createRecord = useMutation(api.dns.createRecord);
    const deleteRecord = useMutation(api.dns.deleteRecord);
    const { toast } = useToast();

    const [type, setType] = useState<"A" | "AAAA" | "CNAME" | "TXT" | "MX">("A");
    const [name, setName] = useState("");
    const [content, setContent] = useState("");
    const [priority, setPriority] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleCreate = async () => {
        if (!name || !content) return;
        setIsCreating(true);
        try {
            await createRecord({
                domainId,
                type,
                name,
                content,
                priority: type === "MX" ? parseInt(priority) || 10 : undefined,
                ttl: 1, // Automatic
            });
            toast({
                title: "Record added",
                description: "DNS record has been queued for creation.",
            });
            setName("");
            setContent("");
            setPriority("");
        } catch (error: any) {
            toast({
                title: "Error",
                description: formatError(error),
                variant: "destructive",
            });
        } finally {
            setIsCreating(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteRecord({ recordId: deleteId as any });
            toast({
                title: "Record deleted",
                description: "Deletion queued.",
            });
            setDeleteId(null);
        } catch (error: any) {
            toast({
                title: "Error",
                description: formatError(error),
                variant: "destructive",
            });
        }
    };

    // Controlled mode: use isOpen/onClose props
    const isControlled = isOpen !== undefined;

    return (
        <>
            <Sheet open={isControlled ? isOpen : undefined} onOpenChange={isControlled ? (open) => !open && onClose?.() : undefined}>
                {!isControlled && (
                    <SheetTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Globe className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">DNS</span>
                        </Button>
                    </SheetTrigger>
                )}
                <SheetContent className="sm:max-w-[700px] w-full overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>DNS Records</SheetTitle>
                        <SheetDescription>
                            Manage DNS records for {subdomain}.{rootDomain}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="py-6 space-y-6">
                        {/* Create Form */}
                        <div className="p-4 border rounded-lg space-y-4 bg-muted/50">
                            <h3 className="font-medium text-sm">Add Record</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                                <div className="sm:col-span-2">
                                    <Select
                                        value={type}
                                        onValueChange={(v: any) => setType(v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="A">A</SelectItem>
                                            <SelectItem value="AAAA">AAAA</SelectItem>
                                            <SelectItem value="CNAME">CNAME</SelectItem>
                                            <SelectItem value="MX">MX</SelectItem>
                                            <SelectItem value="TXT">TXT</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className={type === "MX" ? "sm:col-span-2" : "sm:col-span-3"}>
                                    <Input
                                        placeholder="Name (@ for root)"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                {type === "MX" && (
                                    <div className="sm:col-span-1">
                                        <Input
                                            type="number"
                                            placeholder="Priority"
                                            value={priority}
                                            onChange={(e) => setPriority(e.target.value)}
                                        />
                                    </div>
                                )}
                                <div className={type === "MX" ? "sm:col-span-5" : "sm:col-span-5"}>
                                    <Input
                                        placeholder={type === "MX" ? "mail.example.com" : "Content (e.g. 1.2.3.4)"}
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <Button
                                        className="w-full"
                                        onClick={handleCreate}
                                        disabled={isCreating || !name || !content}
                                    >
                                        {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Records Table */}
                        <div className="border rounded-md overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">Type</TableHead>
                                        <TableHead className="min-w-[100px]">Name</TableHead>
                                        <TableHead className="min-w-[150px]">Content</TableHead>
                                        <TableHead className="w-[80px]">Status</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!records ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8">
                                                <LoadingSpinner size={32} />
                                            </TableCell>
                                        </TableRow>
                                    ) : records.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">No records found</TableCell>
                                        </TableRow>
                                    ) : (
                                        records.map((record: any) => (
                                            <TableRow key={record._id}>
                                                <TableCell className="font-medium">{record.type}</TableCell>
                                                <TableCell className="font-mono text-sm whitespace-nowrap">{record.name}</TableCell>
                                                <TableCell className="font-mono text-xs truncate max-w-[150px]" title={record.content}>
                                                    {record.content}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        record.status === "active" ? "default" :
                                                            record.status === "error" ? "destructive" : "secondary"
                                                    } className="text-[10px] h-5 px-1.5">
                                                        {record.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        disabled={record.status === "deleting"}
                                                        onClick={() => setDeleteId(record._id)}
                                                    >
                                                        {record.status === "deleting" ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        )}
                                                    </Button>
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

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this DNS record.
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
