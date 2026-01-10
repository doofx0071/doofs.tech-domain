import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Globe, ShieldCheck, Loader2, MoreVertical, Edit, Copy, BookOpen } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { api } from "../../../convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ClientDNS() {
  const records = useQuery(api.dns.listAllMyRecords, {});
  const domains = useQuery(api.domains.listMine, {});
  const createRecord = useMutation(api.dns.createRecord);
  const deleteRecord = useMutation(api.dns.deleteRecord);
  const updateRecord = useMutation(api.dns.updateRecord);
  const { toast } = useToast();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Edit State
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Form State
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [type, setType] = useState<"A" | "AAAA" | "CNAME" | "TXT" | "MX">("A");
  const [name, setName] = useState("@");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("");
  const [ttl, setTtl] = useState("");

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">DNS Records</h1>
        <p className="text-muted-foreground">Configure DNS records for your domains.</p>
      </div>

      <Card className="w-full">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>DNS Records</CardTitle>
            <CardDescription>All DNS records across your domains</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsHelpOpen(true)}>
              <BookOpen className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">DNS Guide</span>
            </Button>
            <Dialog open={isAddOpen} onOpenChange={(open) => {
              setIsAddOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Add Record</span>
                </Button>
              </DialogTrigger>
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
                    {domains ? (
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
                    ) : (
                      <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-1 space-y-2">
                      <Label>Type</Label>
                      <Select value={type} onValueChange={(v: any) => setType(v)}>
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
                        Use @ for root, or sub-label (e.g. 'api' for api.sub.domain.com)
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>TTL</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!records ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <LoadingSpinner />
                    </TableCell>
                  </TableRow>
                ) : records.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No DNS records found.</TableCell></TableRow>
                ) : (
                  records.map((record: any) => (
                    <TableRow key={record._id}>
                      <TableCell className="font-medium">{record.subdomain}.{record.rootDomain}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.type}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{record.name}</TableCell>
                      <TableCell className="font-mono text-sm max-w-48 truncate">{record.content}</TableCell>
                      <TableCell>{record.ttl || "Auto"}</TableCell>
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
                <Select value={type} onValueChange={(v: any) => setType(v)}>
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
                  <li>Use <strong>@</strong> to refer to your main subdomain (e.g., <code>{domains?.[0]?.subdomain}.{domains?.[0]?.rootDomain}</code>).</li>
                  <li>Use <strong>www</strong> to create <code>www.{domains?.[0]?.subdomain}.{domains?.[0]?.rootDomain}</code>.</li>
                  <li>Use <strong>api</strong> to create <code>api.{domains?.[0]?.subdomain}.{domains?.[0]?.rootDomain}</code>.</li>
                </ul>
                <p className="text-red-500 font-medium text-xs mt-2">
                  ⚠️ Common Mistake: Do NOT type your subdomain name again. Typing "{domains?.[0]?.subdomain}" will create "{domains?.[0]?.subdomain}.{domains?.[0]?.subdomain}.{domains?.[0]?.rootDomain}".
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
                      <TableCell className="font-mono text-xs">1 aspmx.l.google.com</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Outlook 365</TableCell>
                      <TableCell>MX</TableCell>
                      <TableCell>@</TableCell>
                      <TableCell className="font-mono text-xs">[token]...outlook.com</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">SPF (Email)</TableCell>
                      <TableCell>TXT</TableCell>
                      <TableCell>@</TableCell>
                      <TableCell className="font-mono text-xs">v=spf1 include:_spf.google.com ~all</TableCell>
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