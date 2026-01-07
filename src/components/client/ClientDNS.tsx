import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit } from "lucide-react";

const dnsRecords = [
  { id: 1, domain: "portfolio.doofs.tech", type: "A", name: "@", value: "192.168.1.1", ttl: 3600 },
  { id: 2, domain: "portfolio.doofs.tech", type: "CNAME", name: "www", value: "portfolio.doofs.tech", ttl: 3600 },
  { id: 3, domain: "api.doofs.tech", type: "A", name: "@", value: "10.0.0.1", ttl: 3600 },
  { id: 4, domain: "api.doofs.tech", type: "TXT", name: "_verify", value: "verification=abc123", ttl: 3600 },
];

export function ClientDNS() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">DNS Records</h1>
        <p className="text-muted-foreground">Configure DNS records for your domains.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Records</CardTitle>
              <CardDescription>All DNS records across your domains</CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Record
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>TTL</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dnsRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.domain}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{record.type}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{record.name}</TableCell>
                  <TableCell className="font-mono text-sm max-w-48 truncate">{record.value}</TableCell>
                  <TableCell>{record.ttl}</TableCell>
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