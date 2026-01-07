import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit } from "lucide-react";

const userDomains = [
  { id: 1, subdomain: "portfolio", status: "active", created: "2024-12-01", dnsRecords: 3 },
  { id: 2, subdomain: "api", status: "active", created: "2024-12-15", dnsRecords: 2 },
  { id: 3, subdomain: "staging", status: "inactive", created: "2025-01-02", dnsRecords: 1 },
];

export function ClientDomains() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Domains</h1>
        <p className="text-muted-foreground">Manage your registered domains.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Domains</CardTitle>
              <CardDescription>All your registered domains</CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Claim Domain
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>DNS Records</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userDomains.map((domain) => (
                <TableRow key={domain.id}>
                  <TableCell className="font-medium">{domain.subdomain}.doofs.tech</TableCell>
                  <TableCell>
                    <Badge variant={domain.status === "active" ? "default" : "secondary"}>
                      {domain.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{domain.dnsRecords}</TableCell>
                  <TableCell>{domain.created}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}