import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Save, RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AdminSettings() {
    const settings = useQuery(api.settings.getSettings);
    const updateSettings = useMutation(api.settings.updateSettings);
    const { toast } = useToast();

    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<any>(null);

    // Initialize form data when settings load
    if (settings && !formData) {
        setFormData(settings);
    }

    const handleSave = async () => {
        if (!formData) return;

        setIsSaving(true);
        try {
            // Strip system fields before sending
            const { _id, _creationTime, updatedAt, updatedBy, ...cleanData } = formData;

            await updateSettings(cleanData);
            toast({
                title: "Settings Updated",
                description: "Platform settings have been saved successfully.",
            });
        } catch (error: any) {
            console.error("Failed to update settings:", error);
            toast({
                title: "Error",
                description: error.data?.message || error.message || "Failed to update settings",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        if (settings) {
            setFormData({ ...settings });
            toast({
                title: "Reset",
                description: "Changes have been discarded.",
            });
        }
    };

    const updateField = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    if (!settings || !formData) {
        return (
            <div className="flex items-center justify-center p-8 min-h-[400px]">
                <LoadingSpinner showText text="Loading settings..." />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Platform Settings</h1>
                <p className="text-muted-foreground">Manage global application configurations.</p>
            </div>

            {formData.maintenanceMode && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Maintenance mode is currently <strong>ENABLED</strong>. Non-admin users cannot access the platform.
                    </AlertDescription>
                </Alert>
            )}

            {/* Platform Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle>Platform Configuration</CardTitle>
                    <CardDescription>Control core platform functionality and access</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="maintenance-mode" className="flex flex-col space-y-1">
                            <span>Maintenance Mode</span>
                            <span className="font-normal text-xs text-muted-foreground">
                                Temporarily disable user access (admins bypass)
                            </span>
                        </Label>
                        <Switch
                            id="maintenance-mode"
                            checked={formData.maintenanceMode}
                            onCheckedChange={(checked) => updateField("maintenanceMode", checked)}
                        />
                    </div>

                    {formData.maintenanceMode && (
                        <div className="space-y-2 pl-4 border-l-2 border-muted">
                            <Label htmlFor="maintenance-message">Maintenance Message</Label>
                            <Textarea
                                id="maintenance-message"
                                value={formData.maintenanceMessage || ""}
                                onChange={(e) => updateField("maintenanceMessage", e.target.value)}
                                placeholder="We're currently performing maintenance. Please check back soon."
                                rows={3}
                            />
                        </div>
                    )}

                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="allow-registrations" className="flex flex-col space-y-1">
                            <span>Allow Registrations</span>
                            <span className="font-normal text-xs text-muted-foreground">
                                Enable new user signups
                            </span>
                        </Label>
                        <Switch
                            id="allow-registrations"
                            checked={formData.allowRegistrations}
                            onCheckedChange={(checked) => updateField("allowRegistrations", checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="allow-domain-creation" className="flex flex-col space-y-1">
                            <span>Allow Domain Creation</span>
                            <span className="font-normal text-xs text-muted-foreground">
                                Enable users to create new subdomains
                            </span>
                        </Label>
                        <Switch
                            id="allow-domain-creation"
                            checked={formData.allowDomainCreation}
                            onCheckedChange={(checked) => updateField("allowDomainCreation", checked)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="max-total-users">Max Total Users (Optional)</Label>
                        <Input
                            id="max-total-users"
                            type="number"
                            min="1"
                            value={formData.maxTotalUsers || ""}
                            onChange={(e) => updateField("maxTotalUsers", e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="No limit"
                        />
                        <p className="text-xs text-muted-foreground">
                            Leave empty for unlimited users
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Rate Limiting */}
            <Card>
                <CardHeader>
                    <CardTitle>Rate Limiting</CardTitle>
                    <CardDescription>Configure limits to prevent abuse and ensure fair usage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="max-domains-per-user">Max Domains Per User</Label>
                            <Input
                                id="max-domains-per-user"
                                type="number"
                                min="1"
                                max="1000"
                                value={formData.maxDomainsPerUser}
                                onChange={(e) => updateField("maxDomainsPerUser", parseInt(e.target.value))}
                            />
                            <p className="text-xs text-muted-foreground">Range: 1-1000</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="max-dns-records">Max DNS Records Per Domain</Label>
                            <Input
                                id="max-dns-records"
                                type="number"
                                min="1"
                                max="500"
                                value={formData.maxDnsRecordsPerDomain}
                                onChange={(e) => updateField("maxDnsRecordsPerDomain", parseInt(e.target.value))}
                            />
                            <p className="text-xs text-muted-foreground">Range: 1-500</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="max-dns-operations">DNS Operations Per Minute</Label>
                            <Input
                                id="max-dns-operations"
                                type="number"
                                min="1"
                                max="1000"
                                value={formData.maxDnsOperationsPerMinute}
                                onChange={(e) => updateField("maxDnsOperationsPerMinute", parseInt(e.target.value))}
                            />
                            <p className="text-xs text-muted-foreground">Range: 1-1000</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="max-api-requests">API Requests Per Minute</Label>
                            <Input
                                id="max-api-requests"
                                type="number"
                                min="10"
                                max="10000"
                                value={formData.maxApiRequestsPerMinute}
                                onChange={(e) => updateField("maxApiRequestsPerMinute", parseInt(e.target.value))}
                            />
                            <p className="text-xs text-muted-foreground">Range: 10-10000</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Email & Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle>Email & Notifications</CardTitle>
                    <CardDescription>Configure email settings and admin notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Mailgun Domain</Label>
                        <Input
                            value={formData.mailgunDomain || "Not configured"}
                            readOnly
                            className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                            Configured via environment variables
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="from-email">From Email</Label>
                            <Input
                                id="from-email"
                                value={formData.mailgunFromEmail || ""}
                                onChange={(e) => updateField("mailgunFromEmail", e.target.value)}
                                placeholder="noreply@yourdomain.com"
                            />
                            <p className="text-xs text-muted-foreground">
                                Default sender email address
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="from-name">From Name</Label>
                            <Input
                                id="from-name"
                                value={formData.mailgunFromName || ""}
                                onChange={(e) => updateField("mailgunFromName", e.target.value)}
                                placeholder="Doofs Tech"
                            />
                            <p className="text-xs text-muted-foreground">
                                Default sender name
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="mailgun-enabled" className="flex flex-col space-y-1">
                            <span>Mailgun Enabled</span>
                            <span className="font-normal text-xs text-muted-foreground">
                                Enable email notifications
                            </span>
                        </Label>
                        <Switch
                            id="mailgun-enabled"
                            checked={formData.mailgunEnabled}
                            onCheckedChange={(checked) => updateField("mailgunEnabled", checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="notify-new-user" className="flex flex-col space-y-1">
                            <span>Notify on New User</span>
                            <span className="font-normal text-xs text-muted-foreground">
                                Send email when new users register
                            </span>
                        </Label>
                        <Switch
                            id="notify-new-user"
                            checked={formData.notifyAdminOnNewUser}
                            onCheckedChange={(checked) => updateField("notifyAdminOnNewUser", checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="notify-new-domain" className="flex flex-col space-y-1">
                            <span>Notify on New Domain</span>
                            <span className="font-normal text-xs text-muted-foreground">
                                Send email when domains are created
                            </span>
                        </Label>
                        <Switch
                            id="notify-new-domain"
                            checked={formData.notifyAdminOnNewDomain}
                            onCheckedChange={(checked) => updateField("notifyAdminOnNewDomain", checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Security & Authentication */}
            <Card>
                <CardHeader>
                    <CardTitle>Security & Authentication</CardTitle>
                    <CardDescription>Manage security and session settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="require-turnstile" className="flex flex-col space-y-1">
                            <span>Require Turnstile Verification</span>
                            <span className="font-normal text-xs text-muted-foreground">
                                Enforce Cloudflare Turnstile for domain creation
                            </span>
                        </Label>
                        <Switch
                            id="require-turnstile"
                            checked={formData.requireTurnstile}
                            onCheckedChange={(checked) => updateField("requireTurnstile", checked)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="session-timeout">Session Timeout (Minutes)</Label>
                            <Input
                                id="session-timeout"
                                type="number"
                                min="5"
                                max="43200"
                                value={formData.sessionTimeoutMinutes}
                                onChange={(e) => updateField("sessionTimeoutMinutes", parseInt(e.target.value))}
                            />
                            <p className="text-xs text-muted-foreground">Range: 5-43200 (30 days)</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                            <Input
                                id="max-login-attempts"
                                type="number"
                                min="3"
                                max="20"
                                value={formData.maxLoginAttempts}
                                onChange={(e) => updateField("maxLoginAttempts", parseInt(e.target.value))}
                            />
                            <p className="text-xs text-muted-foreground">Range: 3-20</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* User Management */}
            <Card>
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Configure default user settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="default-role">Default User Role</Label>
                        <Select
                            value={formData.defaultUserRole}
                            onValueChange={(value) => updateField("defaultUserRole", value)}
                        >
                            <SelectTrigger id="default-role">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Role assigned to new users upon registration
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={handleReset} disabled={isSaving}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset Changes
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </div>
    );
}
