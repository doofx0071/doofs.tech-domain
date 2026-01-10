import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit, Loader2, Globe } from "lucide-react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
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

import { Turnstile } from '@marsidev/react-turnstile';

export function ClientDomains() {
  const domains = useQuery(api.domains.listMine, {});
  const platformDomains = useQuery(api.platformDomains.list, { search: "" });
  const claimDomain = useAction(api.domains.claim);
  const deleteDomain = useAction(api.domains.remove);
  const { toast } = useToast();

  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [subdomain, setSubdomain] = useState("");
  const [selectedRoot, setSelectedRoot] = useState("");
  const [claimLoading, setClaimLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteSubdomain, setDeleteSubdomain] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const pending = localStorage.getItem("claim_pending");
    if (pending) {
      try {
        const { subdomain, rootDomain } = JSON.parse(pending);
        if (subdomain) {
          setSubdomain(subdomain);
          if (rootDomain) setSelectedRoot(rootDomain);
          setIsClaimOpen(true);
        }
      } catch (e) {
        console.error("Failed to parse pending claim", e);
        localStorage.removeItem("claim_pending");
      }
    }
  }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await deleteDomain({ id: deleteId as any });
      toast({ title: "Domain deleted", description: "Domain and all DNS records have been removed." });
      setDeleteId(null);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!subdomain) return;
    // Default to first active platform domain if not selected, or error
    const root = selectedRoot || (platformDomains && platformDomains[0]?.domain);
    if (!root) {
      toast({ title: "Error", description: "No platform domain selected", variant: "destructive" });
      return;
    }

    setClaimLoading(true);
    try {
      await claimDomain({ subdomain, rootDomain: root, token });
      toast({ title: "Success", description: `${subdomain}.${root} claimed!` });
      setIsClaimOpen(false);
      setSubdomain("");
      setToken(""); // Reset token
      localStorage.removeItem("claim_pending");
    } catch (e: any) {
      toast({
        title: "Claim Failed",
        description: e.message.includes("Token is not valid") ? "Please refresh the page content" : e.message,
        variant: "destructive"
      });
    } finally {
      setClaimLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Domains</h1>
        <p className="text-muted-foreground">Manage your registered domains.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Domains</CardTitle>
              <CardDescription className="hidden sm:block">All your registered domains</CardDescription>
            </div>

            <Dialog open={isClaimOpen} onOpenChange={setIsClaimOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-9" data-tour="add-domain-button">
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Claim New Domain</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Claim a Subdomain</DialogTitle>
                  <DialogDescription>
                    Choose a platform domain and claim your unique subdomain.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Subdomain</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="my-project"
                        value={subdomain}
                        onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                        className="text-right"
                      />
                      <span className="text-muted-foreground">.</span>
                      {platformDomains ? (
                        <Select
                          value={selectedRoot || (platformDomains[0]?.domain || "")}
                          onValueChange={setSelectedRoot}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select domain" />
                          </SelectTrigger>
                          <SelectContent>
                            {platformDomains
                              .filter((pd: any) => pd.isActive)
                              .map((pd: any) => (
                                <SelectItem key={pd._id} value={pd.domain}>
                                  {pd.domain}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="w-[180px] h-10 bg-muted animate-pulse rounded-md" />
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center pt-2">
                    <Turnstile
                      siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || ""}
                      onSuccess={(token) => setToken(token)}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsClaimOpen(false)}>Cancel</Button>
                  <Button onClick={handleClaim} disabled={claimLoading || !subdomain || !platformDomains?.length || !token}>
                    {claimLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Claim Domain
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
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Created</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!domains ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <LoadingSpinner />
                    </TableCell>
                  </TableRow>
                ) : domains.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No domains found.</TableCell></TableRow>
                ) : (
                  domains.map((domain: any) => (
                    <TableRow key={domain._id}>
                      <TableCell className="font-medium">{domain.subdomain}.{domain.rootDomain}</TableCell>
                      <TableCell>
                        <Badge variant={domain.status === "active" ? "default" : "secondary"}>
                          {domain.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{new Date(domain.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setDeleteId(domain._id);
                              setDeleteSubdomain(domain.subdomain);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
              This action cannot be undone. This will permanently delete the domain
              <span className="font-semibold text-foreground"> {deleteSubdomain}.doofs.tech </span>
              and all its DNS records.
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
              Delete Domain
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}