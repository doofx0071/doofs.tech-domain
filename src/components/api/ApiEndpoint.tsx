import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Parameter {
    name: string;
    type: string;
    required?: boolean;
    description: string;
}

interface ApiEndpointProps {
    method: "GET" | "POST" | "PUT" | "DELETE";
    path: string;
    description: string;
    parameters?: Parameter[];
    bodySchema?: Record<string, any>;
    examples: {
        curl: string;
        javascript: string;
        python: string;
    };
    responseExample: Record<string, any>;
}

export function ApiEndpoint({
    method,
    path,
    description,
    parameters,
    bodySchema,
    examples,
    responseExample
}: ApiEndpointProps) {
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    const methodColor = {
        GET: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
        POST: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
        PUT: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
        DELETE: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
    }[method];

    return (
        <div className="grid lg:grid-cols-2 gap-8 mb-16 scroll-mt-24" id={`${method}-${path.replace(/[{}]/g, '').replace(/^\//, '').replace(/\//g, '-')}`}>
            {/* Documentation Column */}
            <div className="space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Badge variant="secondary" className={cn("font-mono font-bold px-2 py-1", methodColor)}>
                            {method}
                        </Badge>
                        <code className="font-mono text-sm font-medium">{path}</code>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                        {description}
                    </p>
                </div>

                {parameters && parameters.length > 0 && (
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Path Parameters</h4>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium">Name</th>
                                        <th className="px-4 py-2 text-left font-medium">Type</th>
                                        <th className="px-4 py-2 text-left font-medium">Description</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y relative">
                                    {parameters.map((param) => (
                                        <tr key={param.name}>
                                            <td className="px-4 py-3 font-mono text-primary">
                                                {param.name}
                                                {param.required && <span className="text-red-500 ml-1">*</span>}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{param.type}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{param.description}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {bodySchema && (
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Request Body</h4>
                        <Card className="p-4 bg-muted/30 border-dashed">
                            <pre className="text-xs font-mono overflow-x-auto text-muted-foreground">
                                {JSON.stringify(bodySchema, null, 2)}
                            </pre>
                        </Card>
                    </div>
                )}
            </div>

            {/* Code Column */}
            <div className="space-y-6 min-w-0">
                <Tabs defaultValue="curl" className="w-full">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Example Request</h4>
                        <TabsList className="h-8">
                            <TabsTrigger value="curl" className="h-6 text-xs px-2">cURL</TabsTrigger>
                            <TabsTrigger value="javascript" className="h-6 text-xs px-2">Node.js</TabsTrigger>
                            <TabsTrigger value="python" className="h-6 text-xs px-2">Python</TabsTrigger>
                        </TabsList>
                    </div>

                    {Object.entries(examples).map(([lang, code]) => (
                        <TabsContent key={lang} value={lang} className="mt-0">
                            <div className="relative group">
                                <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleCopy(code, lang)}
                                        className="h-8 w-8 bg-background/80 backdrop-blur border rounded-md flex items-center justify-center hover:bg-accent transition-colors"
                                    >
                                        {copied === lang ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                                    </button>
                                </div>
                                <Card className="bg-[#0D1117] text-gray-300 border-none shadow-xl overflow-hidden">
                                    <div className="p-4 overflow-x-auto">
                                        <pre className="font-mono text-xs leading-relaxed">
                                            {code}
                                        </pre>
                                    </div>
                                </Card>
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>

                <div className="space-y-2">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Response Example</h4>
                    <Card className="bg-[#0D1117] text-green-400 border-none shadow-xl overflow-hidden">
                        <div className="p-4 overflow-x-auto">
                            <pre className="font-mono text-xs leading-relaxed">
                                {JSON.stringify(responseExample, null, 2)}
                            </pre>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
