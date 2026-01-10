import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, MoreHorizontal, Plus, Loader2, Server } from "lucide-react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DnsRecords } from "./DnsRecords";

export function AdminSubdomains() {
    const [search, setSearch] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newSubdomain, setNewSubdomain] = useState("");
    const [createLoading, setCreateLoading] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteSubdomainName, setDeleteSubdomainName] = useState("");

    // DNS Sheet state
    const [dnsOpen, setDnsOpen] = useState(false);
    const [dnsDomain, setDnsDomain] = useState<any>(null);

    const domains = useQuery(api.admin.getAllDomains, { search: search || undefined });
    const createDomain = useAction(api.domains.claim);
    const deleteDomain = useAction(api.domains.remove);
    const { toast } = useToast();

    const handleCreate = async () => {
        if (!newSubdomain) return;

        setCreateLoading(true);
        try {
            await createDomain({ subdomain: newSubdomain });
            toast({
                title: "Success",
                description: `Subdomain ${newSubdomain}.doofs.tech created successfully.`,
            });
            setIsCreateOpen(false);
            setNewSubdomain("");
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to create subdomain",
                variant: "destructive",
            });
        } finally {
            setCreateLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            await deleteDomain({ id: deleteId as any });
            toast({
                title: "Deleted",
                description: "Subdomain removed successfully.",
            });
            setDeleteId(null);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete subdomain",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Subdomain Management</h1>
                    <p className="text-muted-foreground">Manage all registered subdomains.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="h-9">
                            <Plus className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Add Subdomain</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Subdomain</DialogTitle>
                            <DialogDescription>
                                Create a new subdomain. It will be active immediately.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="subdomain">Subdomain</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="subdomain"
                                        placeholder="example"
                                        value={newSubdomain}
                                        onChange={(e) => setNewSubdomain(e.target.value.toLowerCase())}
                                    />
                                    <span className="text-muted-foreground">.doofs.tech</span>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate} disabled={createLoading || !newSubdomain}>
                                {createLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Domains</CardTitle>
                            <CardDescription>All registered user subdomains</CardDescription>
                        </div>
                        <div className="relative w-full sm:w-auto">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search domains..."
                                className="pl-8 w-full sm:w-64"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-2 sm:p-6">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="px-2">Subdomain</TableHead>
                                    <TableHead className="hidden md:table-cell px-2">Owner</TableHead>
                                    <TableHead className="px-2">Status</TableHead>
                                    <TableHead className="hidden lg:table-cell px-2">Created</TableHead>
                                    <TableHead className="w-auto px-2"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!domains ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                                    </TableRow>
                                ) : domains.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No domains found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    domains.map((domain: any) => (
                                        <TableRow key={domain._id}>
                                            <TableCell className="font-medium max-w-[100px] sm:max-w-[300px] truncate px-2" title={`${domain.subdomain}.doofs.tech`}>
                                                {domain.subdomain}.doofs.tech
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell px-2">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm truncate max-w-[150px]">{domain.ownerName || domain.ownerEmail || "Unknown"}</span>
                                                    {domain.ownerName && (
                                                        <span className="text-xs text-muted-foreground truncate max-w-[150px]">{domain.ownerEmail}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-2">
                                                <Badge variant={domain.status === "active" ? "default" : "secondary"} className="text-xs px-2 py-0.5 h-6">
                                                    {domain.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell px-2">{new Date(domain.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="px-2">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            className="cursor-pointer"
                                                            onClick={() => {
                                                                setDnsDomain(domain);
                                                                setDnsOpen(true);
                                                            }}
                                                        >
                                                            <Server className="mr-2 h-4 w-4" />
                                                            DNS Records
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive cursor-pointer"
                                                            onClick={() => {
                                                                setDeleteId(domain._id);
                                                                setDeleteSubdomainName(domain.subdomain);
                                                            }}
                                                        >
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
                </CardContent>
            </Card>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <span className="font-semibold text-foreground">{deleteSubdomainName}.doofs.tech</span>.
                            This action cannot be undone.
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

            {/* DNS Records Sheet (controlled) */}
            {dnsDomain && (
                <DnsRecords
                    domainId={dnsDomain._id}
                    subdomain={dnsDomain.subdomain}
                    rootDomain={dnsDomain.rootDomain}
                    isOpen={dnsOpen}
                    onClose={() => {
                        setDnsOpen(false);
                        setDnsDomain(null);
                    }}
                />
            )}
        </div>
    );
}
