import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AvatarPicker } from "@/components/ui/AvatarPicker";
import Avatar from "boring-avatars";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DeveloperSettings } from "./settings/DeveloperSettings";

export function ClientSettings() {
  const user = useQuery(api.users.currentUser);
  const updateAvatar = useMutation(api.profile.updateAvatar);
  const updateProfile = useMutation(api.profile.updateProfile);
  const { toast } = useToast();
  const { signOut } = useAuthActions();
  const deleteAccount = useMutation(api.profile.deleteAccount);
  const [fullName, setFullName] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  if (!user) {
    return <div>Loading...</div>;
  }

  // Extract GitHub account information
  const githubAccount = user.accounts?.find((acc: any) => acc.provider === "github");
  const displayName = user.name || "User";
  const email = user.email || "No email";
  const hasGitHub = !!githubAccount;

  // Parse avatar config
  const avatarVariant = user.avatarVariant || "marble";
  const avatarSeed = user.avatar || displayName;

  // Determine avatar colors based on stored palette
  const getAvatarColors = () => {
    const palettes: Record<string, string[]> = {
      "0": ["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"],
      "1": ["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"],
      "2": ["#f94144", "#f3722c", "#f8961e", "#f9844a", "#f9c74f"],
      "3": ["#606c38", "#283618", "#fefae0", "#dda15e", "#bc6c25"],
      "4": ["#7209b7", "#560bad", "#b5179e", "#f72585", "#4361ee"],
      "5": ["#e0b0ff", "#b4e4ff", "#ffe4e1", "#f0e68c", "#d8bfd8"],
    };
    const paletteIndex = avatarSeed.split("-")[1] || "0";
    return palettes[paletteIndex] || palettes["0"];
  };

  const handleAvatarSave = async (avatar: string, variant: string) => {
    try {
      await updateAvatar({ avatar, avatarVariant: variant });
      toast({
        title: "Avatar Updated",
        description: "Your avatar has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update avatar. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleProfileSave = async () => {
    try {
      await updateProfile({ name: fullName || displayName });
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Manage your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b">
            <div className="flex items-center gap-4">
              {hasGitHub && user.image ? (
                <img
                  src={user.image}
                  alt={displayName}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <Avatar
                  size={80}
                  name={displayName}
                  variant={avatarVariant as any}
                  colors={getAvatarColors()}
                />
              )}
              <div>
                <Label className="text-base font-medium">Profile Picture</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {hasGitHub ? "Synced from GitHub" : "Choose your avatar style"}
                </p>
              </div>
            </div>
            {!hasGitHub && (
              <AvatarPicker
                currentAvatar={avatarSeed}
                currentVariant={avatarVariant}
                userName={displayName}
                onSave={handleAvatarSave}
              />
            )}
          </div>

          {/* Profile Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                data-tour="settings-name-input"
                defaultValue={displayName}
                placeholder="Enter your full name"
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={email} readOnly />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
          </div>
          <Button onClick={handleProfileSave} data-tour="settings-save-btn">Save Changes</Button>
        </CardContent>
      </Card>

      {/* Developer Settings */}
      <DeveloperSettings />

      {/* Only show Connected Accounts if user has GitHub */}
      {hasGitHub && (
        <Card>
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
            <CardDescription>Manage your connected services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
                  <Github className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">GitHub</p>
                  <p className="text-xs text-muted-foreground">
                    Connected as {displayName}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                Disconnect
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions for your account</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog onOpenChange={(open) => !open && setDeleteConfirmation("")}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" data-tour="delete-account-btn">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[90%] sm:w-full sm:max-w-lg">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  account and remove your data from our servers.
                  <br /><br />
                  To confirm, please type <strong>delete</strong> below:
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-2">
                <Input
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Type 'delete' to confirm"
                  className="w-full"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={deleteConfirmation !== "delete"}
                  onClick={async (e) => {
                    // Prevent closing if disabled (though button is disabled, just safety)
                    if (deleteConfirmation !== "delete") {
                      e.preventDefault();
                      return;
                    }
                    await deleteAccount();
                    await signOut();
                    window.location.href = "/";
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}