import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Link as LinkIcon, ShieldCheck, Database, CheckCircle2, ArrowRight, Hash, Clock, User } from 'lucide-react';
import { getAllBatches } from '@/lib/mockData';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface Block {
    id: string;
    hash: string;
    previousHash: string;
    timestamp: string;
    type: 'Harvest' | 'Quality' | 'Storage' | 'Sale';
    actor: string;
    data: any;
    verified: boolean;
}

export default function TraceabilityExplorer() {
    const [searchQuery, setSearchQuery] = useState('');
    const [chain, setChain] = useState<Block[] | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    const simulateBlockchain = (batchId: string) => {
        setIsSearching(true);
        setChain(null);

        const batch = getAllBatches().find(b => b.batchId.toUpperCase() === batchId.toUpperCase());

        if (!batch) {
            setTimeout(() => {
                setIsSearching(false);
                setChain([]); // Empty chain indicates not found
            }, 1500);
            return;
        }

        // Mock Blockchain Generation
        setTimeout(() => {
            const newChain: Block[] = [
                {
                    id: 'BLK-001',
                    hash: '0x8f43...9a21',
                    previousHash: '0x0000...0000',
                    timestamp: format(new Date(batch.harvestDate), 'PPpp'),
                    type: 'Harvest',
                    actor: batch.farmer?.name || 'Farmer',
                    data: { crop: batch.cropType, qty: `${batch.quantity}kg` },
                    verified: true
                },
                {
                    id: 'BLK-002',
                    hash: '0x7e21...b455',
                    previousHash: '0x8f43...9a21',
                    timestamp: format(batch.qualityTest?.testDate || new Date(), 'PPpp'),
                    type: 'Quality',
                    actor: 'AI Grading System / QA',
                    data: { grade: batch.qualityGrade, score: `${batch.qualityTest?.visualQuality || 4}/5` },
                    verified: true
                },
                {
                    id: 'BLK-003',
                    hash: '0x3a11...c992',
                    previousHash: '0x7e21...b455',
                    timestamp: format(new Date(), 'PPpp'), // Current simulation
                    type: 'Storage',
                    actor: 'Central Warehouse',
                    data: { status: 'Stored', temp: '4°C' },
                    verified: true
                }
            ];

            if (batch.retailStatus?.status === 'Expired' || batch.retailStatus?.status === 'Consume Soon') {
                // Add retail block if applicable (simulated logic)
            }

            setChain(newChain);
            setIsSearching(false);
        }, 2000);
    };

    return (
        <Layout>
            <div className="space-y-8 animate-in fade-in duration-700">
                <div className="text-center space-y-4 mb-8">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-primary/20">
                        <Database className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">Immutable Traceability Ledger</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Explore the secure blockchain records of every batch. Verify authenticity, origins, and quality data backed by cryptographic proof.
                    </p>
                </div>

                <div className="max-w-xl mx-auto">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Enter Batch ID (e.g. B-001)"
                                className="pl-10 h-12 text-lg font-mono bg-white/50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                                onKeyDown={(e) => e.key === 'Enter' && simulateBlockchain(searchQuery)}
                            />
                        </div>
                        <Button onClick={() => simulateBlockchain(searchQuery)} disabled={isSearching} className="h-12 px-6 rounded-xl shadow-lg shadow-primary/20">
                            {isSearching ? 'Verifying...' : 'Search Ledger'}
                        </Button>
                    </div>
                </div>

                {chain && chain.length === 0 && (
                    <div className="text-center py-12 animate-in fade-in zoom-in-95">
                        <p className="text-destructive font-bold text-lg">Batch ID Not Found</p>
                        <p className="text-muted-foreground">This ID does not exist in the Immutable Ledger.</p>
                    </div>
                )}

                {chain && chain.length > 0 && (
                    <div className="max-w-4xl mx-auto pt-8 space-y-0 relative">
                        {/* Connecting Line */}
                        <div className="absolute left-8 top-8 bottom-8 w-1 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 rounded-full" />

                        {chain.map((block, index) => (
                            <div key={block.id} className="relative pl-24 pb-12 group last:pb-0 perspective-1000">
                                {/* Node Icon */}
                                <div className="absolute left-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-white to-secondary border-2 border-primary shadow-xl flex items-center justify-center z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                                    {block.type === 'Harvest' && <User className="h-8 w-8 text-primary" />}
                                    {block.type === 'Quality' && <ShieldCheck className="h-8 w-8 text-primary" />}
                                    {block.type === 'Storage' && <Database className="h-8 w-8 text-primary" />}
                                </div>

                                {/* Block Card */}
                                <Card className="glass-card transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border-l-4 border-l-primary overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Hash className="h-32 w-32 -rotate-12" />
                                    </div>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant="outline" className="font-mono bg-primary/5 text-primary border-primary/20">
                                                        Block #{index + 1}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground font-mono">{block.id}</span>
                                                </div>
                                                <CardTitle className="text-xl flex items-center gap-2">
                                                    {block.type} Verified
                                                    <CheckCircle2 className="h-5 w-5 text-fresh fill-fresh/10" />
                                                </CardTitle>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground font-mono bg-black/5 px-2 py-1 rounded">
                                                    <Clock className="h-3 w-3" /> {block.timestamp}
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-muted-foreground uppercase">Data Payload</p>
                                                <div className="bg-secondary/50 p-3 rounded-lg font-mono text-sm space-y-1">
                                                    {Object.entries(block.data).map(([k, v]) => (
                                                        <div key={k} className="flex justify-between">
                                                            <span className="text-muted-foreground">{k}:</span>
                                                            <span className="font-bold">{String(v)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-muted-foreground uppercase">Cryptographic Integrity</p>
                                                <div className="bg-slate-900 text-slate-400 p-3 rounded-lg font-mono text-[10px] space-y-2">
                                                    <div>
                                                        <p className="text-slate-600">PREV HASH</p>
                                                        <p className="truncate">{block.previousHash}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-fresh/80">CURRENT HASH</p>
                                                        <p className="truncate text-white">{block.hash}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-dashed flex items-center gap-2">
                                            <LinkIcon className="h-4 w-4 text-primary" />
                                            <span className="text-sm font-medium">Actor Signature: <span className="text-primary">{block.actor}</span></span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
