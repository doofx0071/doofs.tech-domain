import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

export function AdminSettings() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate loading settings
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
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

            <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Configure basic platform behavior.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="maintenance-mode" className="flex flex-col space-y-1">
                            <span>Maintenance Mode</span>
                            <span className="font-normal text-xs text-muted-foreground">Disable user access temporarily</span>
                        </Label>
                        <Switch id="maintenance-mode" />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="registrations" className="flex flex-col space-y-1">
                            <span>Allow Registrations</span>
                            <span className="font-normal text-xs text-muted-foreground">Enable new user signups</span>
                        </Label>
                        <Switch id="registrations" defaultChecked />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
            </div>
        </div>
    );
}
