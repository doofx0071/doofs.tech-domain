import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { tutorials, tutorialCategories, TutorialCategory } from "@/data/tutorials";
import { Search, ExternalLink, Copy, Check, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Header as Navbar } from "@/components/layout/Header";
import { Footer } from "@/components/sections/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Tutorials() {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<TutorialCategory | 'all'>('all');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const { toast } = useToast();

    const filteredTutorials = useMemo(() => {
        return tutorials.filter((t) => {
            const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
            const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                t.description.toLowerCase().includes(search.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [search, activeCategory]);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast({
            title: "Copied!",
            description: "Value copied to clipboard",
        });
        setTimeout(() => setCopiedId(null), 2000);
    };

    const difficultyColor = {
        easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-5xl">
                {/* Header */}
                <div className="text-center mb-10 md:mb-16 space-y-4">
                    <Badge variant="outline" className="px-3 py-1 text-sm border-primary/20 text-primary bg-primary/5">
                        Integrations & Guides
                    </Badge>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-accent">
                        Connect Your Domain
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                        Step-by-step guides to connect your <span className="font-mono text-primary font-bold">doofs.tech</span> subdomain
                        to your favorite hosting, email, and gaming platforms.
                    </p>
                </div>

                {/* Search & Filter */}
                <div className="space-y-6 mb-12">
                    <div className="relative max-w-xl mx-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search guides (e.g., 'Vercel', 'Minecraft', 'Email')..."
                            className="pl-10 h-12 text-lg shadow-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap justify-center gap-2">
                        {tutorialCategories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <Button
                                    key={cat.id}
                                    variant={activeCategory === cat.id ? "default" : "outline"}
                                    onClick={() => setActiveCategory(cat.id as any)}
                                    className="rounded-full"
                                    size="sm"
                                >
                                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                                    {cat.label}
                                </Button>
                            );
                        })}
                    </div>
                </div>

                {/* Tutorial List */}
                <div className="grid gap-6">
                    {filteredTutorials.length === 0 ? (
                        <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed">
                            <Search className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                            <h3 className="text-lg font-semibold text-muted-foreground">No guides found</h3>
                            <p className="text-sm text-muted-foreground/80">Try a different search term or category.</p>
                        </div>
                    ) : (
                        <Accordion type="single" collapsible className="w-full space-y-4">
                            {filteredTutorials.map((t) => (
                                <AccordionItem key={t.id} value={t.id} className="border rounded-xl px-4 md:px-6 bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <AccordionTrigger className="hover:no-underline py-5">
                                        <div className="flex items-center gap-4 w-full text-left">
                                            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                                                <t.icon className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-lg">{t.title}</span>
                                                    <Badge variant="secondary" className={`text-xs capitalize font-normal ${difficultyColor[t.difficulty]}`}>
                                                        {t.difficulty}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground font-normal line-clamp-1 md:line-clamp-none pr-4">
                                                    {t.description}
                                                </p>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-6 pt-2">
                                        <div className="space-y-6">
                                            {/* DNS Configuration Card */}
                                            <Card className="bg-muted/50 border-primary/20">
                                                <CardHeader className="py-4">
                                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                                        <Info className="h-4 w-4 text-primary" />
                                                        DNS Configuration
                                                    </CardTitle>
                                                    <CardDescription>
                                                        Add {t.dnsRecords.length > 1 ? "these records" : "this record"} in your User Dashboard.
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-3 pb-4">
                                                    {t.dnsRecords.map((record, i) => (
                                                        <div key={i} className="flex flex-col md:flex-row md:items-center gap-3 bg-background p-3 rounded-md border text-sm font-mono relative group">
                                                            <div className="flex items-center gap-3 flex-1">
                                                                <Badge variant="outline" className="font-bold border-primary/30 text-primary w-16 justify-center shrink-0">
                                                                    {record.type}
                                                                </Badge>
                                                                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 overflow-hidden">
                                                                    <span className="text-muted-foreground">Name: <span className="text-foreground">{record.name}</span></span>
                                                                    <span className="md:hidden border-t my-1"></span>
                                                                    <span className="text-muted-foreground truncate">
                                                                        Value: <span className="text-foreground">{record.value}</span>
                                                                    </span>
                                                                    {record.priority !== undefined && (
                                                                        <span className="text-muted-foreground">Pri: <span className="text-foreground">{record.priority}</span></span>
                                                                    )}
                                                                    {record.port !== undefined && (
                                                                        <span className="text-muted-foreground">Port: <span className="text-foreground">{record.port}</span></span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8 absolute right-2 top-2 md:relative md:top-auto md:right-auto opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={() => copyToClipboard(record.value, `${t.id}-${i}`)}
                                                            >
                                                                {copiedId === `${t.id}-${i}` ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </CardContent>
                                            </Card>

                                            {/* Setup Steps */}
                                            <div className="space-y-4">
                                                <h4 className="font-semibold text-base flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-primary" /> Setup Instructions
                                                </h4>
                                                <ol className="relative border-l border-muted ml-3 space-y-6">
                                                    {t.steps.map((step, i) => (
                                                        <li key={i} className="mb-2 ml-6">
                                                            <span className="absolute flex items-center justify-center w-6 h-6 bg-background rounded-full -left-3 ring-4 ring-background border text-xs font-bold text-muted-foreground">
                                                                {i + 1}
                                                            </span>
                                                            <h5 className="font-medium text-sm leading-tight mb-1">{step.title}</h5>
                                                            <p className="text-sm text-muted-foreground">{step.description}</p>
                                                        </li>
                                                    ))}
                                                </ol>
                                            </div>

                                            {/* Official Docs Link */}
                                            {t.officialDocsUrl && (
                                                <div className="pt-2">
                                                    <a
                                                        href={t.officialDocsUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center text-sm font-medium text-primary hover:underline hover:text-primary/80 transition-colors"
                                                    >
                                                        Read official documentation
                                                        <ExternalLink className="ml-1 h-3 w-3" />
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
