import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function MaintenanceBanner() {
    const isInMaintenance = useQuery(api.settings.isMaintenanceMode);
    const publicSettings = useQuery(api.settings.getPublicSettings);

    if (!isInMaintenance || !publicSettings?.maintenanceMode) {
        return null;
    }

    return (
        <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Maintenance Mode</AlertTitle>
            <AlertDescription>
                {publicSettings.maintenanceMessage || "We're currently performing maintenance. Please check back soon."}
            </AlertDescription>
        </Alert>
    );
}
