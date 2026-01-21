import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit, Loader2, Globe, Download, CheckCircle, Copy, AlertCircle, Lock, ShieldOff, RefreshCw, ArrowRightLeft } from "lucide-react";
import { useQuery, useMutation, useAction, useConvex } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAsyncFeedback } from "@/hooks/use-async-feedback";
import { formatError } from "@/lib/error-handling";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

  const claimDomainAction = useAction(api.domains.claim);
  const deleteDomainAction = useAction(api.domains.remove);
  const verifyDomainAction = useAction(api.domains.verifyDomain);
  const checkSSLAction = useAction(api.domains.checkSSLStatus);
  const initiateTransferAction = useMutation(api.transfers.initiateTransfer);
  const cancelTransferAction = useMutation(api.transfers.cancelTransfer);

  const [searchParams, setSearchParams] = useSearchParams();

  const { toast } = useToast();

  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [isAcceptOpen, setIsAcceptOpen] = useState(false);
  const [acceptCode, setAcceptCode] = useState("");

  useEffect(() => {
    const code = searchParams.get("transferCode");
    if (code) {
      setAcceptCode(code);
      setIsAcceptOpen(true);
      // Clean up URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("transferCode");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const claimTransferAction = useMutation(api.transfers.claimTransfer);
  const { execute: claimTransfer, isLoading: claimTransferLoading } = useAsyncFeedback(claimTransferAction, {
    successTitle: "Transfer Complete!",
    successMessage: "You are now the owner of this domain.",
    onSuccess: () => {
      setIsAcceptOpen(false);
      setAcceptCode("");
    },
    onError: (error) => {
      // keep modal open on error
    }
  });

  const handleAcceptTransfer = () => {
    if (!acceptCode || acceptCode.length !== 8) return;
    claimTransfer({ transferCode: acceptCode });
  };
  const [subdomain, setSubdomain] = useState("");
  const [selectedRoot, setSelectedRoot] = useState("");
  const [checkingSSL, setCheckingSSL] = useState<string | null>(null);

  const handleCheckSSL = async (domainId: any) => {
    setCheckingSSL(domainId);
    try {
      const result = await checkSSLAction({ domainId });
      toast({
        title: "SSL Status Checked",
        description: result.message,
        variant: result.sslStatus === "active" ? "default" : "default" // "info" equivalent
      });
    } catch (error: any) {
      toast({
        title: "Check Failed",
        description: error.message || "Could not check SSL status",
        variant: "destructive",
      });
    } finally {
      setCheckingSSL(null);
    }
  };

  const navigate = useNavigate();

  // Navigate to DNS page with prefilled verification record
  const handleProceedToAddRecord = () => {
    if (!verifyDomain) return;

    navigate('/dashboard/dns', {
      state: {
        prefillRecord: {
          domainId: verifyDomain._id,
          type: 'TXT',
          name: '_doofs-verify',
          content: verifyDomain.verificationCode
        }
      }
    });
    setVerifyDomain(null);
  };

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteSubdomain, setDeleteSubdomain] = useState("");
  const [token, setToken] = useState("");
  const [verifyDomain, setVerifyDomain] = useState<any>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Transfer State
  const [transferDomain, setTransferDomain] = useState<any>(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [transferResult, setTransferResult] = useState<any>(null);

  const existingTransfer = useQuery(api.transfers.getPendingForDomain, transferDomain ? { domainId: transferDomain._id } : "skip");
  const activeTransfer = transferResult || existingTransfer;

  const convex = useConvex();

  // --- Handlers using useAsyncFeedback ---

  const { execute: claimDomain, isLoading: claimLoading } = useAsyncFeedback(claimDomainAction, {
    successTitle: "Domain Claimed!",
    successMessage: `${subdomain}.${selectedRoot || "doofs.tech"} is now yours.`,
    onSuccess: () => {
      setIsClaimOpen(false);
      setSubdomain("");
      setToken("");
      localStorage.removeItem("claim_pending");
    }
  });

  const { execute: deleteDomain, isLoading: deleteLoading } = useAsyncFeedback(deleteDomainAction, {
    successTitle: "Domain Deleted",
    successMessage: "Domain and all DNS records have been removed.",
    onSuccess: () => setDeleteId(null)
  });

  const { execute: initiateTransfer, isLoading: transferLoading } = useAsyncFeedback(initiateTransferAction, {
    successTitle: "Transfer Initiated",
    successMessage: "Transfer code generated. Share it with the recipient.",
    onSuccess: (data) => {
      setTransferResult(data);
    }
  });

  const handleInitiateTransfer = async () => {
    if (!transferDomain || !recipientEmail) return;
    await initiateTransfer({
      domainId: transferDomain._id,
      toEmail: recipientEmail
    });
  };

  const { execute: cancelTransfer, isLoading: cancelLoading } = useAsyncFeedback(cancelTransferAction, {
    successTitle: "Transfer Cancelled",
    successMessage: "The pending transfer has been revoked.",
    onSuccess: () => {
      setTransferResult(null);
    }
  });

  const handleCancelTransfer = async () => {
    if (!activeTransfer) return;
    await cancelTransfer({ transferId: activeTransfer._id || activeTransfer.transferId });
  };

  // Export is a query call, not a mutation/action hook, so we wrap it manually or just use try/catch with formatError
  // But wait, useAsyncFeedback expects an async function. We can pass an inline async function.
  const handleExport = async (domainId: string, domainName: string) => {
    try {
      const zoneFileContent = await convex.query(api.dns.exportZoneFile, { domainId: domainId as any });
      // Create blob and download
      const blob = new Blob([zoneFileContent], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${domainName}.zone`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast({ title: "Exported", description: `Zone file for ${domainName} downloaded.`, variant: "success" });
    } catch (e: any) {
      // Manual formatting since we aren't using the hook here (it's a one-off query)
      toast({ title: "Error", description: formatError(e), variant: "destructive" });
    }
  };

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
    await deleteDomain({ id: deleteId as any });
  };

  const handleClaim = async () => {
    if (!subdomain) return;
    // Default to first active platform domain if not selected, or error
    const root = selectedRoot || (platformDomains && platformDomains[0]?.domain);
    if (!root) {
      toast({ title: "Error", description: "No platform domain selected", variant: "destructive" });
      return;
    }

    await claimDomain({ subdomain, rootDomain: root, token });
  };

  const handleVerify = async (domainId: string) => {
    setVerifyLoading(true);
    try {
      const result = await verifyDomainAction({ domainId: domainId as any });
      if (result.success) {
        toast({ title: "Verified!", description: result.message, variant: "success" });
        setVerifyDomain(null);
      } else {
        toast({ title: "Verification Failed", description: result.message, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: formatError(e), variant: "destructive" });
    } finally {
      setVerifyLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Copied to clipboard" });
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

            <div className="flex items-center gap-2">
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

              <Button
                variant="outline"
                size="sm"
                className="h-9 hidden md:flex"
                onClick={() => setIsAcceptOpen(true)}
              >
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Accept Transfer
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">SSL</TableHead>
                    <TableHead className="hidden sm:table-cell">Created</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!domains ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
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
                          <Badge
                            variant={domain.status === "active" ? "default" : domain.status === "pending_verification" ? "outline" : "secondary"}
                            className={domain.status === "pending_verification" ? "border-yellow-500 text-yellow-600" : ""}
                          >
                            {domain.status === "pending_verification" ? "Pending" : domain.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {domain.status === "active" && (
                            <div
                              className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => handleCheckSSL(domain._id)}
                              title="Click to refresh SSL status"
                            >
                              {checkingSSL === domain._id ? (
                                <Badge variant="outline" className="border-blue-400 text-blue-500">
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  Checking...
                                </Badge>
                              ) : domain.sslStatus === "active" ? (
                                <Badge variant="outline" className="border-green-500 text-green-600">
                                  <Lock className="h-3 w-3 mr-1" />
                                  Secure
                                </Badge>
                              ) : domain.sslStatus === "pending" ? (
                                <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                  Pending
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-gray-400 text-gray-500">
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                  Check
                                </Badge>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{new Date(domain.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  data-tour="delete-domain-btn"
                                  onClick={() => {
                                    setDeleteId(domain._id);
                                    setDeleteSubdomain(domain.subdomain);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete Domain</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleExport(domain._id, `${domain.subdomain}.${domain.rootDomain}`)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Export Zone File</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setTransferDomain(domain);
                                    setRecipientEmail("");
                                    setTransferResult(null);
                                  }}
                                >
                                  <ArrowRightLeft className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Transfer Ownership</TooltipContent>
                            </Tooltip>

                            {domain.status === "pending_verification" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                                    onClick={() => setVerifyDomain(domain)}
                                  >
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    Verify
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Verify Ownership</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card >

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

      {/* Verification Modal */}
      <Dialog open={!!verifyDomain} onOpenChange={(open) => !open && setVerifyDomain(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Verify Domain Ownership
            </DialogTitle>
            <DialogDescription>
              Add a TXT record to verify you own <strong>{verifyDomain?.subdomain}.{verifyDomain?.rootDomain}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>TXT Record Name</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-muted rounded text-sm break-all">
                  _doofs-verify.{verifyDomain?.subdomain}.{verifyDomain?.rootDomain}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(`_doofs-verify.${verifyDomain?.subdomain}.${verifyDomain?.rootDomain}`)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>TXT Record Value</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-muted rounded text-sm break-all">
                  {verifyDomain?.verificationCode}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(verifyDomain?.verificationCode || "")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Add this TXT record to your DNS provider. It may take a few minutes to propagate.
            </p>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              onClick={handleProceedToAddRecord}
              className="w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add TXT Record
            </Button>
            <Button
              onClick={() => handleVerify(verifyDomain?._id)}
              disabled={verifyLoading}
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
            >
              {verifyLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <CheckCircle className="mr-2 h-4 w-4" />
              Check Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Modal */}
      <Dialog open={!!transferDomain} onOpenChange={(open) => !open && setTransferDomain(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Domain Ownership</DialogTitle>
            <DialogDescription>
              Transfer <strong>{transferDomain?.subdomain}.{transferDomain?.rootDomain}</strong> to another user.
            </DialogDescription>
          </DialogHeader>

          {!activeTransfer ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Recipient Email</Label>
                <Input
                  placeholder="recipient@example.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  The recipient will receive a notification (if registered) and needs the transfer code to claim the domain.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <h4 className="font-semibold text-green-800 mb-1">Transfer Pending</h4>
                <p className="text-sm text-green-700">
                  Transfer initiated to <strong>{activeTransfer.toEmail}</strong>.
                  Share the code below. Expires in 24 hours.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Transfer Code</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-3 bg-muted rounded text-lg font-mono text-center tracking-widest border">
                    {activeTransfer.transferCode}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(activeTransfer.transferCode)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Claim Link</Label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={`${window.location.origin}/dashboard/domains?transferCode=${activeTransfer.transferCode}`}
                    className="text-xs text-muted-foreground"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(`${window.location.origin}/dashboard/domains?transferCode=${activeTransfer.transferCode}`)}
                    title="Copy Link"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            {!activeTransfer ? (
              <>
                <Button variant="outline" onClick={() => setTransferDomain(null)}>Close</Button>
                <Button
                  onClick={handleInitiateTransfer}
                  disabled={transferLoading || !recipientEmail || !recipientEmail.includes('@')}
                >
                  {transferLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Code
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="destructive"
                  onClick={handleCancelTransfer}
                  disabled={cancelLoading}
                  className="w-full sm:w-auto mr-auto"
                >
                  {cancelLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cancel Transfer
                </Button>
                <Button variant="outline" onClick={() => setTransferDomain(null)}>Close</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Accept Transfer Modal */}
      <Dialog open={isAcceptOpen} onOpenChange={setIsAcceptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Domain Transfer</DialogTitle>
            <DialogDescription>
              Enter the transfer code to claim ownership of a domain.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Transfer Code</Label>
              <Input
                value={acceptCode}
                onChange={(e) => setAcceptCode(e.target.value.toUpperCase())}
                placeholder="Enter 8-character code"
                maxLength={8}
                className="font-mono text-center tracking-widest text-lg uppercase"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAcceptOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAcceptTransfer}
              disabled={claimTransferLoading || !acceptCode || acceptCode.length !== 8}
            >
              {claimTransferLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Claim Domain
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}