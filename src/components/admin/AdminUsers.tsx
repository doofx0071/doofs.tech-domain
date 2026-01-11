import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, MoreHorizontal, Shield, ShieldOff, UserX, UserCheck, Ban, Trash2, Loader2, AlertTriangle, Calendar, Clock, User, Pencil } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useQuery, useMutation, usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

type ActionType = "suspend" | "ban" | "delete" | "promote" | "demote" | "unsuspend" | "unban" | null;

export function AdminUsers() {
  const [search, setSearch] = useState("");
  const [actionType, setActionType] = useState<ActionType>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewUser, setViewUser] = useState<any>(null);
  const [isEditingReason, setIsEditingReason] = useState(false);
  const [editReason, setEditReason] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const { results: users, status, loadMore, isLoading } = usePaginatedQuery(
    api.admin.getAllUsers,
    {},
    { initialNumItems: 50 }
  );
  const { toast } = useToast();

  // Mutations
  const suspendUser = useMutation(api.admin.suspendUser);
  const unsuspendUser = useMutation(api.admin.unsuspendUser);
  const banUser = useMutation(api.admin.banUser);
  const unbanUser = useMutation(api.admin.unbanUser);
  const deleteUser = useMutation(api.admin.deleteUser);
  const makeUserAdmin = useMutation(api.admin.makeUserAdmin);
  const removeAdmin = useMutation(api.admin.removeAdmin);
  const updateStatusReason = useMutation(api.admin.updateStatusReason);

  const filteredUsers = users?.filter(user =>
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.name?.toLowerCase().includes(search.toLowerCase())
  );

  const openAction = (type: ActionType, user: any) => {
    setActionType(type);
    setSelectedUser(user);
    setReason("");
    setViewUser(null); // Close details sheet when action opens
  };

  const closeAction = () => {
    setActionType(null);
    setSelectedUser(null);
    setReason("");
  };

  const handleAction = async () => {
    if (!selectedUser || !actionType) return;
    setLoading(true);

    try {
      switch (actionType) {
        case "suspend":
          await suspendUser({ userId: selectedUser._id, reason: reason || undefined });
          toast({ title: "User Suspended", description: `${selectedUser.email} has been suspended.` });
          break;
        case "unsuspend":
          await unsuspendUser({ userId: selectedUser._id });
          toast({ title: "User Unsuspended", description: `${selectedUser.email} is now active.` });
          break;
        case "ban":
          await banUser({ userId: selectedUser._id, reason: reason || undefined });
          toast({ title: "User Banned", description: `${selectedUser.email} has been banned.` });
          break;
        case "unban":
          await unbanUser({ userId: selectedUser._id });
          toast({ title: "User Unbanned", description: `${selectedUser.email} is now active.` });
          break;
        case "delete":
          await deleteUser({ userId: selectedUser._id });
          toast({ title: "User Deleted", description: `${selectedUser.email} has been archived.` });
          break;
        case "promote":
          await makeUserAdmin({ userId: selectedUser._id });
          toast({ title: "User Promoted", description: `${selectedUser.email} is now an admin.` });
          break;
        case "demote":
          await removeAdmin({ userId: selectedUser._id });
          toast({ title: "User Demoted", description: `${selectedUser.email} is no longer an admin.` });
          break;
      }
      closeAction();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEditReason = async () => {
    if (!viewUser) return;
    setEditLoading(true);
    try {
      await updateStatusReason({ userId: viewUser._id, reason: editReason });
      toast({ title: "Reason Updated", description: "Status reason has been updated." });
      setIsEditingReason(false);
      setViewUser({ ...viewUser, statusReason: editReason });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setEditLoading(false);
    }
  };

  const getStatusBadge = (user: any, large = false) => {
    const size = large ? "text-sm px-3 py-1" : "";
    if (user.status === "banned") return <Badge variant="destructive" className={size}>Banned</Badge>;
    if (user.status === "suspended") return <Badge variant="secondary" className={`bg-yellow-100 text-yellow-800 ${size}`}>Suspended</Badge>;
    return <Badge variant="outline" className={`border-green-500 text-green-700 ${size}`}>Active</Badge>;
  };

  const needsReason = actionType === "suspend" || actionType === "ban";
  const isDestructive = actionType === "ban" || actionType === "delete";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage all registered users.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>All registered platform users</CardDescription>
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
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
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Joined</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!users ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <LoadingSpinner />
                    </TableCell>
                  </TableRow>
                ) : filteredUsers?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No users found</TableCell>
                  </TableRow>
                ) : (
                  filteredUsers?.map((user: any) => (
                    <TableRow
                      key={user._id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setViewUser(user)}
                    >
                      <TableCell className="font-medium max-w-[150px] sm:max-w-[250px]">
                        <div className="truncate" title={user.email}>{user.email || "No email"}</div>
                        {user.name && <div className="text-xs text-muted-foreground truncate">{user.name}</div>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "outline"}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {getStatusBadge(user)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{new Date(user.joined || 0).toLocaleDateString()}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {/* Role actions */}
                            {user.role !== "admin" ? (
                              <DropdownMenuItem className="cursor-pointer" onClick={() => openAction("promote", user)}>
                                <Shield className="mr-2 h-4 w-4" />
                                Promote to Admin
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="cursor-pointer" onClick={() => openAction("demote", user)}>
                                <ShieldOff className="mr-2 h-4 w-4" />
                                Demote to User
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            {/* Status actions */}
                            {user.status === "suspended" ? (
                              <DropdownMenuItem className="cursor-pointer" onClick={() => openAction("unsuspend", user)}>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Unsuspend
                              </DropdownMenuItem>
                            ) : user.status === "banned" ? (
                              <DropdownMenuItem className="cursor-pointer" onClick={() => openAction("unban", user)}>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Unban
                              </DropdownMenuItem>
                            ) : user.role !== "admin" && (
                              <>
                                <DropdownMenuItem className="cursor-pointer" onClick={() => openAction("suspend", user)}>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Suspend
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer text-destructive focus:text-destructive"
                                  onClick={() => openAction("ban", user)}
                                >
                                  <Ban className="mr-2 h-4 w-4" />
                                  Ban
                                </DropdownMenuItem>
                              </>
                            )}

                            {user.role !== "admin" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="cursor-pointer text-destructive focus:text-destructive"
                                  onClick={() => openAction("delete", user)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete User
                                </DropdownMenuItem>
                              </>
                            )}
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
        {status === "CanLoadMore" && (
          <div className="p-4 border-t flex justify-center">
            <Button variant="outline" onClick={() => loadMore(50)} disabled={isLoading}>
              Load More
            </Button>
          </div>
        )}
      </Card>

      {/* User Details Sheet */}
      <Sheet open={!!viewUser} onOpenChange={(open) => !open && setViewUser(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>User Details</SheetTitle>
            <SheetDescription>
              View and manage user account information.
            </SheetDescription>
          </SheetHeader>

          {viewUser && (
            <div className="mt-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{viewUser.name || "No name"}</p>
                    <p className="text-sm text-muted-foreground truncate">{viewUser.email}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Role & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Role</p>
                  <Badge variant={viewUser.role === "admin" ? "default" : "outline"} className="text-sm">
                    {viewUser.role === "admin" ? "Admin" : "User"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  {getStatusBadge(viewUser, true)}
                </div>
              </div>

              {/* Status Reason */}
              {(viewUser.status === "suspended" || viewUser.status === "banned") && (
                <>
                  <Separator />
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-destructive">
                            {viewUser.status === "banned" ? "Ban" : "Suspension"} Reason
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2"
                            onClick={() => {
                              setEditReason(viewUser.statusReason || "");
                              setIsEditingReason(true);
                            }}
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {viewUser.statusReason || "No reason provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Dates */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Joined</p>
                    <p className="font-medium">{new Date(viewUser.joined || 0).toLocaleDateString()}</p>
                  </div>
                </div>
                {viewUser.lastLoginAt && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Last Login</p>
                      <p className="font-medium">{new Date(viewUser.lastLoginAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Quick Actions */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-3">Quick Actions</p>
                <div className="flex flex-wrap gap-2">
                  {viewUser.role !== "admin" ? (
                    <Button size="sm" variant="outline" onClick={() => openAction("promote", viewUser)}>
                      <Shield className="mr-2 h-4 w-4" />
                      Promote
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => openAction("demote", viewUser)}>
                      <ShieldOff className="mr-2 h-4 w-4" />
                      Demote
                    </Button>
                  )}

                  {viewUser.status === "suspended" && (
                    <Button size="sm" variant="outline" onClick={() => openAction("unsuspend", viewUser)}>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Unsuspend
                    </Button>
                  )}

                  {viewUser.status === "banned" && (
                    <Button size="sm" variant="outline" onClick={() => openAction("unban", viewUser)}>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Unban
                    </Button>
                  )}

                  {viewUser.role !== "admin" && viewUser.status !== "suspended" && viewUser.status !== "banned" && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => openAction("suspend", viewUser)}>
                        <UserX className="mr-2 h-4 w-4" />
                        Suspend
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => openAction("ban", viewUser)}>
                        <Ban className="mr-2 h-4 w-4" />
                        Ban
                      </Button>
                    </>
                  )}

                  {viewUser.role !== "admin" && (
                    <Button size="sm" variant="destructive" onClick={() => openAction("delete", viewUser)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Confirmation Dialog for simple actions */}
      <AlertDialog open={actionType !== null && !needsReason} onOpenChange={(open) => !open && closeAction()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "promote" && "Promote to Admin?"}
              {actionType === "demote" && "Demote to User?"}
              {actionType === "unsuspend" && "Unsuspend User?"}
              {actionType === "unban" && "Unban User?"}
              {actionType === "delete" && "Delete User?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "promote" && `This will give ${selectedUser?.email} full admin access.`}
              {actionType === "demote" && `This will remove admin rights from ${selectedUser?.email}.`}
              {actionType === "unsuspend" && `This will restore access for ${selectedUser?.email}.`}
              {actionType === "unban" && `This will restore access for ${selectedUser?.email}.`}
              {actionType === "delete" && `This will permanently archive ${selectedUser?.email}. This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={loading}
              className={isDestructive ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog with reason input for suspend/ban */}
      <Dialog open={needsReason} onOpenChange={(open) => !open && closeAction()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {actionType === "suspend" ? "Suspend User" : "Ban User"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "suspend"
                ? `Temporarily disable access for ${selectedUser?.email}.`
                : `Permanently ban ${selectedUser?.email} from the platform.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for this action..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeAction}>Cancel</Button>
            <Button
              onClick={handleAction}
              disabled={loading}
              variant={actionType === "ban" ? "destructive" : "default"}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {actionType === "suspend" ? "Suspend" : "Ban"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Reason Dialog */}
      <Dialog open={isEditingReason} onOpenChange={(open) => !open && setIsEditingReason(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Reason</DialogTitle>
            <DialogDescription>
              Update the {viewUser?.status === "banned" ? "ban" : "suspension"} reason for this user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-reason">Reason</Label>
              <Textarea
                id="edit-reason"
                placeholder="Enter reason..."
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingReason(false)}>Cancel</Button>
            <Button onClick={handleEditReason} disabled={editLoading}>
              {editLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}