import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Key, Copy, Trash2, Plus, RefreshCw, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export function DeveloperSettings() {
    const keys = useQuery(api.apiKeys.list);
    const generateKey = useMutation(api.apiKeys.generate);
    const revokeKey = useMutation(api.apiKeys.revoke);
    const { toast } = useToast();

    const [isGenerateOpen, setIsGenerateOpen] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!newKeyName.trim()) return;

        try {
            const key = await generateKey({
                name: newKeyName,
                scopes: ["domains:read", "domains:write"] // Default scopes for now
            });
            setGeneratedKey(key);
            setNewKeyName("");
            toast({
                title: "API Key Generated",
                description: "Make sure to copy your key now. You won't be able to see it again!",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to generate API key.",
                variant: "destructive",
            });
        }
    };

    const handleRevoke = async (id: any) => {
        try {
            await revokeKey({ id });
            toast({
                title: "API Key Revoked",
                description: "The key is no longer active.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to revoke API key.",
                variant: "destructive",
            });
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied!",
            description: "API key copied to clipboard.",
        });
    };

    if (keys === undefined) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Developer Settings</CardTitle>
                    <CardDescription>Loading API keys...</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Developer Settings</CardTitle>
                    <CardDescription>Manage your API Access Keys</CardDescription>
                </div>
                <Dialog open={isGenerateOpen} onOpenChange={(open) => {
                    setIsGenerateOpen(open);
                    if (!open) setGeneratedKey(null); // Reset when closing
                }}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                            <Plus className="h-4 w-4" /> Generate New Key
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Generate API Key</DialogTitle>
                            <DialogDescription>
                                Create a new key to access the API programmatically.
                            </DialogDescription>
                        </DialogHeader>

                        {!generatedKey ? (
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="key-name">Key Name</Label>
                                    <Input
                                        id="key-name"
                                        placeholder="e.g., Vercel Integration"
                                        value={newKeyName}
                                        onChange={(e) => setNewKeyName(e.target.value)}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 py-4">
                                <div className="rounded-md bg-muted p-4 border border-yellow-500/50 bg-yellow-500/10">
                                    <div className="flex items-start gap-3">
                                        <EyeOff className="h-5 w-5 text-yellow-500 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="font-medium text-yellow-500">Copy this key now</p>
                                            <p className="text-sm text-muted-foreground">This is the only time the full key will be displayed.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="grid flex-1 gap-2">
                                        <Label htmlFor="link" className="sr-only">
                                            Link
                                        </Label>
                                        <Input
                                            id="link"
                                            defaultValue={generatedKey}
                                            readOnly
                                            className="font-mono text-sm"
                                        />
                                    </div>
                                    <Button type="submit" size="sm" className="px-3" onClick={() => copyToClipboard(generatedKey)}>
                                        <span className="sr-only">Copy</span>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="sm:justify-end">
                            {!generatedKey ? (
                                <Button type="button" onClick={handleGenerate} disabled={!newKeyName}>
                                    Generate
                                </Button>
                            ) : (
                                <Button type="button" variant="secondary" onClick={() => setIsGenerateOpen(false)}>
                                    Done
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
                {keys.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
                        <Key className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No API keys generated yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {keys.map((key) => (
                            <div key={key._id} className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{key.name}</span>
                                        <Badge variant="outline" className="text-xs font-mono">
                                            {key.prefix}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span>Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                                        <span>Last Used: {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : "Never"}</span>
                                    </div>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Any applications using this key will immediately lose access. This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleRevoke(key._id)} className="bg-destructive hover:bg-destructive/90">
                                                Revoke Key
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
