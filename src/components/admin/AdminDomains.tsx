import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, MoreHorizontal } from "lucide-react";

const mockDomains = [
  { id: 1, subdomain: "portfolio", owner: "dev@example.com", status: "active", created: "2024-12-01" },
  { id: 2, subdomain: "api", owner: "startup@gmail.com", status: "active", created: "2024-12-15" },
  { id: 3, subdomain: "demo", owner: "builder@yahoo.com", status: "inactive", created: "2025-01-02" },
  { id: 4, subdomain: "app", owner: "creator@outlook.com", status: "active", created: "2025-01-05" },
];

export function AdminDomains() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Domain Management</h1>
        <p className="text-muted-foreground">Manage all registered domains.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Domains</CardTitle>
              <CardDescription>All registered platform domains</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search domains..." className="pl-8 w-64" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subdomain</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDomains.map((domain) => (
                <TableRow key={domain.id}>
                  <TableCell className="font-medium">{domain.subdomain}.doofs.tech</TableCell>
                  <TableCell>{domain.owner}</TableCell>
                  <TableCell>
                    <Badge variant={domain.status === "active" ? "default" : "secondary"}>
                      {domain.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{domain.created}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
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