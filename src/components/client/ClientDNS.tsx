import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Globe, ShieldCheck, Loader2, MoreVertical, Edit, Copy, BookOpen, ChevronDown } from 'lucide-react';
import { useQuery, useMutation, useAction } from "convex/react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { api } from "../../../convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GroupedRecords {
  domainId: string;
  subdomain: string;
  rootDomain: string;
  fullDomain: string;
  records: any[];
}

export function ClientDNS() {
  const records = useQuery(api.dns.listAllMyRecords, {});
  const domains = useQuery(api.domains.listMine, {});
  const createRecord = useMutation(api.dns.createRecord);
  const deleteRecord = useMutation(api.dns.deleteRecord);
  const updateRecord = useMutation(api.dns.updateRecord);
  const verifyPropagation = useAction(api.dns.verifyPropagation);
  const { toast } = useToast();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Form State
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [type, setType] = useState<"A" | "AAAA" | "CNAME" | "TXT" | "MX">("A");
  const [name, setName] = useState("@");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("");
  const [ttl, setTtl] = useState("");

  // Group records by domain
  const groupedRecords = useMemo((): GroupedRecords[] => {
    if (!domains || !records) return [];

    // Create a map of all domains
    const domainMap = new Map<string, GroupedRecords>();

    // Initialize with all domains (even those without records)
    domains.forEach((domain: any) => {
      domainMap.set(domain._id, {
        domainId: domain._id,
        subdomain: domain.subdomain,
        rootDomain: domain.rootDomain,
        fullDomain: `${domain.subdomain}.${domain.rootDomain}`,
        records: [],
      });
    });

    // Add records to their respective domains
    records.forEach((record: any) => {
      const group = domainMap.get(record.domainId);
      if (group) {
        group.records.push(record);
      }
    });

    return Array.from(domainMap.values());
  }, [domains, records]);

  // Pre-select domain when opening add dialog for specific domain
  const openAddForDomain = (domainId: string) => {
    setSelectedDomain(domainId);
    setIsAddOpen(true);
  };

  const handleCreate = async () => {
    if (!selectedDomain || !name || !content) return;

    setCreateLoading(true);
    try {
      await createRecord({
        domainId: selectedDomain as any,
        type,
        name,
        content,
        priority: type === "MX" ? parseInt(priority) || 10 : undefined,
        ttl: ttl ? parseInt(ttl) : undefined,
      });
      toast({ title: "Record created", description: "Propagation may take a few minutes." });
      setIsAddOpen(false);
      resetForm();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingRecord || !name || !content) return;

    setCreateLoading(true);
    try {
      await updateRecord({
        recordId: editingRecord._id,
        type,
        name,
        content,
        priority: type === "MX" ? parseInt(priority) || 10 : undefined,
        ttl: ttl ? parseInt(ttl) : undefined,
      });
      toast({ title: "Record updated", description: "Changes syncing to Cloudflare." });
      setIsEditOpen(false);
      setEditingRecord(null);
      resetForm();
    } catch (e: any) {
      toast({ title: "Update Failed", description: e.message, variant: "destructive" });
    } finally {
      setCreateLoading(false);
    }
  };

  const openEdit = (record: any) => {
    setEditingRecord(record);
    setSelectedDomain(record.domainId);
    setType(record.type);
    setName(record.name);
    setContent(record.content);
    setPriority(record.priority ? record.priority.toString() : "");
    setTtl(record.ttl ? record.ttl.toString() : "");
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setSelectedDomain("");
    setType("A");
    setName("@");
    setContent("");
    setPriority("");
    setTtl("");
    setEditingRecord(null);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteRecord({ recordId: deleteId as any });
      toast({ title: "Record deletion queued" });
      setDeleteId(null);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleVerify = async (record: any) => {
    toast({ title: "Verifying propagation...", description: "Checking Cloudflare Public DNS..." });
    try {
      const result = await verifyPropagation({ recordId: record._id });
      if (result.propagated) {
        toast({
          title: "✅ Propagated",
          description: "Record is visible on public DNS.",
        });
      } else {
        toast({
          title: "⏳ Not yet propagated",
          description: "Cloudflare DoH does not see this value yet.",
          variant: "destructive"
        });
      }
    } catch (e: any) {
      toast({ title: "Verification Error", description: e.message, variant: "destructive" });
    }
  };

  // Loading state
  if (!records || !domains) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">DNS Records</h1>
          <p className="text-muted-foreground">Configure DNS records for your domains.</p>
        </div>
        <Card className="w-full">
          <CardContent className="py-16">
            <LoadingSpinner />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">DNS Records</h1>
          <p className="text-muted-foreground">Configure DNS records for your domains.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsHelpOpen(true)} data-tour="dns-guide-btn">
            <BookOpen className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">DNS Guide</span>
          </Button>
          <Button size="sm" onClick={() => setIsAddOpen(true)} data-tour="add-dns-btn">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Record</span>
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {groupedRecords.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Domains Found</h3>
            <p className="text-muted-foreground mb-4">
              Claim a subdomain first to start managing DNS records.
            </p>
            <Button variant="outline" asChild>
              <a href="/dashboard/domains">Go to Domains</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Accordion for each domain */}
      {groupedRecords.length > 0 && (
        <Accordion type="multiple" defaultValue={groupedRecords.map(g => g.domainId)} className="space-y-3">
          {groupedRecords.map((group) => (
            <AccordionItem
              key={group.domainId}
              value={group.domainId}
              className="border rounded-lg bg-card px-4 data-[state=open]:pb-4"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex flex-1 items-center justify-between pr-4">
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium text-left break-all">{group.fullDomain}</span>
                  </div>
                  <Badge variant="secondary" className="shrink-0 ml-2">
                    {group.records.length} {group.records.length === 1 ? 'record' : 'records'}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-2">
                  {/* Records table or empty state */}
                  {group.records.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border rounded-md bg-muted/30">
                      <p className="text-sm">No DNS records yet.</p>
                      <p className="text-xs mt-1">Add a record to get started.</p>
                    </div>
                  ) : (
                    <div className="border rounded-md overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[70px]">Type</TableHead>
                            <TableHead className="min-w-[80px]">Name</TableHead>
                            <TableHead className="min-w-[120px]">Value</TableHead>
                            <TableHead className="w-[60px] hidden sm:table-cell">TTL</TableHead>
                            <TableHead className="w-[60px] hidden sm:table-cell">Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.records.map((record: any) => (
                            <TableRow key={record._id}>
                              <TableCell>
                                <Badge variant="outline" className="text-[10px]">{record.type}</Badge>
                              </TableCell>
                              <TableCell className="font-mono text-sm">{record.name}</TableCell>
                              <TableCell className="font-mono text-xs max-w-[150px] truncate" title={record.content}>
                                {record.content}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell text-xs">
                                {record.ttl === 1 || !record.ttl ? "Auto" : record.ttl}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                <Badge
                                  variant={record.status === "active" ? "default" : record.status === "error" ? "destructive" : "secondary"}
                                  className="text-[10px]"
                                >
                                  {record.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <span className="sr-only">Open menu</span>
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem
                                      className="cursor-pointer"
                                      onClick={() => handleVerify(record)}
                                    >
                                      <ShieldCheck className="mr-2 h-4 w-4" />
                                      Verify Propagation
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="cursor-pointer"
                                      onClick={() => {
                                        navigator.clipboard.writeText(record.content);
                                        toast({ title: "Copied value to clipboard" });
                                      }}>
                                      <Copy className="mr-2 h-4 w-4" />
                                      Copy Value
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="cursor-pointer"
                                      onClick={() => openEdit(record)}
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Record
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive cursor-pointer"
                                      onClick={() => setDeleteId(record._id)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Add Record Dialog */}
      <Dialog open={isAddOpen} onOpenChange={(open) => {
        setIsAddOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add DNS Record</DialogTitle>
            <DialogDescription>
              Add a new DNS record. It will be synced to Cloudflare automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Domain</Label>
              <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a domain" />
                </SelectTrigger>
                <SelectContent>
                  {domains.map((d: any) => (
                    <SelectItem key={d._id} value={d._id}>
                      {d.subdomain}.{d.rootDomain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1 space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v: any) => setType(v as any)}>
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
              <div className="col-span-3 space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="@, www, api"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <p className="text-[0.8rem] text-muted-foreground">
                  Use @ for root, or sub-label (e.g. 'api')
                </p>
              </div>
            </div>

            {type === "MX" && (
              <div className="space-y-2">
                <Label>Priority</Label>
                <Input
                  type="number"
                  placeholder="10"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Content</Label>
              <Input
                placeholder={type === "A" ? "1.2.3.4" : "example.com"}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>TTL (Optional)</Label>
              <Input
                type="number"
                placeholder="Auto"
                value={ttl}
                onChange={(e) => setTtl(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createLoading || !selectedDomain || !content}>
              {createLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => {
        setIsEditOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit DNS Record</DialogTitle>
            <DialogDescription>
              Modify this DNS record. Updates will be synced to Cloudflare.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Domain</Label>
              <Input
                disabled
                value={editingRecord ? `${editingRecord.subdomain}.${editingRecord.rootDomain}` : ''}
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1 space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v: any) => setType(v as any)}>
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
              <div className="col-span-3 space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="@, www, api"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <p className="text-[0.8rem] text-muted-foreground">
                  Use @ for root, or sub-label (e.g. 'api')
                </p>
              </div>
            </div>

            {type === "MX" && (
              <div className="space-y-2">
                <Label>Priority</Label>
                <Input
                  type="number"
                  placeholder="10"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Content</Label>
              <Input
                placeholder={type === "A" ? "1.2.3.4" : "example.com"}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>TTL (Optional)</Label>
              <Input
                type="number"
                placeholder="Auto"
                value={ttl}
                onChange={(e) => setTtl(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={createLoading || !content}>
              {createLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DNS Guide Dialog */}
      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>DNS Configuration Guide</DialogTitle>
            <DialogDescription>
              Learn how to correctly configure your DNS records for common services.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-500" />
                Understanding the "Name" Field
              </h3>
              <div className="bg-muted p-3 rounded-md text-sm text-foreground space-y-2">
                <p>The <strong>Name</strong> field determines the prefix of your subdomain.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Use <strong>@</strong> to refer to your main subdomain.</li>
                  <li>Use <strong>www</strong> to create www prefix.</li>
                  <li>Use <strong>api</strong> to create api prefix.</li>
                </ul>
                <p className="text-red-500 font-medium text-xs mt-2">
                  ⚠️ Common Mistake: Do NOT type your subdomain name again.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Common Configurations</h3>
              <div className="border rounded-md overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Value / Content</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Vercel</TableCell>
                      <TableCell>CNAME</TableCell>
                      <TableCell>@</TableCell>
                      <TableCell className="font-mono text-xs">cname.vercel-dns.com</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Netlify</TableCell>
                      <TableCell>CNAME</TableCell>
                      <TableCell>@</TableCell>
                      <TableCell className="font-mono text-xs">[your-site].netlify.app</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">GitHub Pages</TableCell>
                      <TableCell>CNAME</TableCell>
                      <TableCell>@</TableCell>
                      <TableCell className="font-mono text-xs">[username].github.io</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Google Workspace</TableCell>
                      <TableCell>MX</TableCell>
                      <TableCell>@</TableCell>
                      <TableCell className="font-mono text-xs">aspmx.l.google.com</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsHelpOpen(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this DNS record. It may take a few minutes to propagate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete Record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}