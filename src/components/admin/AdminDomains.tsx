import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, MoreHorizontal, Plus, Loader2, Globe, Copy, Check, RefreshCw, Pencil, Server } from "lucide-react";
import { useQuery, useMutation, useAction } from "convex/react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
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
import { PlatformDnsRecords } from "./PlatformDnsRecords";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";

export function AdminDomains() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newDomain, setNewDomain] = useState("");
    const [description, setDescription] = useState("");
    const [createLoading, setCreateLoading] = useState(false);
    const [resultNameservers, setResultNameservers] = useState<string[] | null>(null);

    // Delete confirmation state
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteDomainName, setDeleteDomainName] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Edit dialog state
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [editDescription, setEditDescription] = useState("");
    const [editLoading, setEditLoading] = useState(false);

    // DNS Sheet state
    const [dnsOpen, setDnsOpen] = useState(false);
    const [dnsDomainId, setDnsDomainId] = useState<string | null>(null);
    const [dnsDomainName, setDnsDomainName] = useState("");

    const domains = useQuery(api.platformDomains.list, { search: search || undefined });
    const createDomainAction = useAction(api.platformDomains.create);
    const refreshStatusAction = useAction(api.platformDomains.refreshStatus);
    const deleteDomain = useMutation(api.platformDomains.remove);
    const updateDomain = useMutation(api.platformDomains.update);
    const { toast } = useToast();

    // Auto-open DNS sheet from query param (deep-link from notifications)
    useEffect(() => {
        // Support both openDns (by ID) and openRoot (by rootDomain) params
        const openDnsId = searchParams.get("openDns");
        const openRoot = searchParams.get("openRoot");

        if (domains) {
            let domain = null;

            // Try to find by ID first
            if (openDnsId) {
                domain = domains.find(d => d._id === openDnsId);
            }

            // If not found by ID, try by rootDomain (platform domain name)
            if (!domain && openRoot) {
                domain = domains.find(d => d.domain === openRoot);
            }

            if (domain) {
                setDnsDomainId(domain._id);
                setDnsDomainName(domain.domain);
                setDnsOpen(true);
                // Clear the query params after opening
                searchParams.delete("openDns");
                searchParams.delete("openRoot");
                setSearchParams(searchParams, { replace: true });
            }
        }
    }, [searchParams, domains, setSearchParams]);

    const handleCreate = async () => {
        if (!newDomain) return;

        setCreateLoading(true);
        try {
            const result = await createDomainAction({ domain: newDomain, description });

            toast({
                title: "Success",
                description: `Domain ${newDomain} processed successfully.`,
            });

            if (result.nameservers && result.nameservers.length > 0) {
                setResultNameservers(result.nameservers);
            } else {
                setIsAddOpen(false);
                resetForm();
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to add domain",
                variant: "destructive",
            });
        } finally {
            setCreateLoading(false);
        }
    };

    const handleRefresh = async (id: any, zoneId: string | undefined, domain: string) => {
        if (!zoneId) {
            toast({
                title: "Cannot Refresh",
                description: "This domain has no Zone ID.",
                variant: "destructive"
            });
            return;
        }

        try {
            toast({ title: "Refreshing...", description: `checking status for ${domain}` });
            const result = await refreshStatusAction({ id, zoneId });
            toast({
                title: "Status Updated",
                description: `${domain} is now ${result.status}`,
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to refresh status",
                variant: "destructive",
            });
        }
    };

    const resetForm = () => {
        setNewDomain("");
        setDescription("");
        setResultNameservers(null);
    };

    const handleClose = () => {
        setIsAddOpen(false);
        resetForm();
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setDeleteLoading(true);
        try {
            await deleteDomain({ id: deleteId as any });
            toast({
                title: "Removed",
                description: "Domain removed successfully.",
            });
            setDeleteId(null);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to remove domain",
                variant: "destructive",
            });
        } finally {
            setDeleteLoading(false);
        }
    };

    const openEditDialog = (domain: any) => {
        setEditId(domain._id);
        setEditDescription(domain.description || "");
        setIsEditOpen(true);
    };

    const handleEdit = async () => {
        if (!editId) return;
        setEditLoading(true);
        try {
            await updateDomain({ id: editId as any, description: editDescription });
            toast({
                title: "Updated",
                description: "Description updated successfully.",
            });
            setIsEditOpen(false);
            setEditId(null);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update domain",
                variant: "destructive",
            });
        } finally {
            setEditLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Domain Management</h1>
                    <p className="text-muted-foreground">Manage platform domains available for subdomains.</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={(open) => !open && handleClose()}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setIsAddOpen(true)} size="sm" className="h-9">
                            <Plus className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Add Domain</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>
                                {resultNameservers ? "Setup Required" : "Add Platform Domain"}
                            </DialogTitle>
                            <DialogDescription>
                                {resultNameservers
                                    ? "Update your domain registrar with these nameservers to activate Cloudflare."
                                    : "Add a domain. We will automatically create the zone in Cloudflare."
                                }
                            </DialogDescription>
                        </DialogHeader>

                        {resultNameservers ? (
                            <div className="space-y-4 py-4">
                                <div className="p-4 bg-muted rounded-md border text-sm space-y-2">
                                    <p className="font-medium">Cloudflare Nameservers:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        {resultNameservers.map((ns, i) => (
                                            <li key={i} className="font-mono">{ns}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Go to Namecheap/GoDaddy/etc. and replace existing nameservers with these.
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="domain">Domain Name</Label>
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="domain"
                                            placeholder="example.com"
                                            value={newDomain}
                                            onChange={(e) => setNewDomain(e.target.value.toLowerCase())}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Input
                                        id="description"
                                        placeholder="e.g. Premium Domain"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            {resultNameservers ? (
                                <Button onClick={handleClose}>Done</Button>
                            ) : (
                                <>
                                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                                    <Button onClick={handleCreate} disabled={createLoading || !newDomain}>
                                        {createLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Add & Sync
                                    </Button>
                                </>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Platform Domains</CardTitle>
                            <CardDescription>Available root domains for user subdomains</CardDescription>
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
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Domain</TableHead>
                                    <TableHead className="hidden md:table-cell">Description</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="hidden lg:table-cell">CF Status</TableHead>
                                    <TableHead className="hidden xl:table-cell">Created</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!domains ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12">
                                            <LoadingSpinner />
                                        </TableCell>
                                    </TableRow>
                                ) : domains.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No platform domains found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    domains.map((domain: any) => (
                                        <TableRow key={domain._id}>
                                            <TableCell className="font-medium max-w-[150px] sm:max-w-[250px] truncate" title={domain.domain}>
                                                {domain.domain}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell truncate max-w-[200px]">{domain.description || "-"}</TableCell>
                                            <TableCell>
                                                <Badge variant={domain.isActive ? "default" : "secondary"}>
                                                    {domain.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                {domain.cloudflareStatus && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {domain.cloudflareStatus}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="hidden xl:table-cell">{new Date(domain.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            className="cursor-pointer"
                                                            onClick={() => handleRefresh(domain._id, domain.zoneId, domain.domain)}
                                                        >
                                                            <RefreshCw className="mr-2 h-4 w-4" />
                                                            Refresh Status
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="cursor-pointer"
                                                            onClick={() => openEditDialog(domain)}
                                                        >
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit Description
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="cursor-pointer"
                                                            onClick={() => {
                                                                setDnsDomainId(domain._id);
                                                                setDnsDomainName(domain.domain);
                                                                setDnsOpen(true);
                                                            }}
                                                        >
                                                            <Server className="mr-2 h-4 w-4" />
                                                            DNS Records
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="cursor-pointer text-destructive focus:text-destructive"
                                                            onClick={() => {
                                                                setDeleteId(domain._id);
                                                                setDeleteDomainName(domain.domain);
                                                            }}
                                                        >
                                                            Remove
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently remove the platform domain
                            <span className="font-semibold text-foreground"> {deleteDomainName}</span>
                            {" "}from the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive hover:bg-destructive/90"
                            disabled={deleteLoading}
                        >
                            {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Remove Domain
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Description Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Description</DialogTitle>
                        <DialogDescription>
                            Update the description for this platform domain.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Input
                                id="edit-description"
                                placeholder="e.g. Premium Domain"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleEdit} disabled={editLoading}>
                            {editLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* DNS Records Sheet */}
            <PlatformDnsRecords
                platformDomainId={dnsDomainId}
                domain={dnsDomainName}
                isOpen={dnsOpen}
                onClose={() => {
                    setDnsOpen(false);
                    setDnsDomainId(null);
                    setDnsDomainName("");
                }}
            />
        </div>
    );
}
