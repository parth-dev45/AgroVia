import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { getAllBatches, getBatchById } from '@/lib/mockData';
import {
  Crate,
  Order,
  getAllCrates,
  getAllOrders,
  addCrate,
  updateOrderStatus,
  generateCrateId
} from '@/lib/orderData';
import { StatusBadge } from '@/components/StatusBadge';
import { getProductById } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { PrintLabel } from '@/components/PrintLabel';
import { exportBatchesToCSV } from '@/lib/exportData';
import {
  Warehouse as WarehouseIcon,
  Search,
  AlertTriangle,
  Bell,
  Package,
  Plus,
  CheckCircle2,
  Download,
  BoxIcon,
  Filter,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QRCodeSVG } from 'qrcode.react';

export default function WarehouseDashboard() {
  const batches = getAllBatches().filter(b => b.qualityGrade !== null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'Fresh' | 'Consume Soon' | 'Expired'>('all');
  const [orders, setOrders] = useState<Order[]>(getAllOrders());
  const [crates, setCrates] = useState<Crate[]>(getAllCrates());

  // Create crate form
  const [crateBatchId, setCrateBatchId] = useState('');
  const [crateQuantity, setCrateQuantity] = useState('');

  const filteredBatches = batches
    .filter(b => {
      if (filter !== 'all' && b.retailStatus?.status !== filter) return false;
      if (searchQuery && !b.batchId.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => (a.retailStatus?.remainingDays || 0) - (b.retailStatus?.remainingDays || 0));

  const freshCount = batches.filter(b => b.retailStatus?.status === 'Fresh').length;
  const consumeSoonCount = batches.filter(b => b.retailStatus?.status === 'Consume Soon').length;
  const expiredCount = batches.filter(b => b.retailStatus?.status === 'Expired').length;
  const totalWeight = batches.reduce((sum, b) => sum + b.quantity, 0);

  const notifications = batches
    .filter(b => b.retailStatus && b.retailStatus.remainingDays <= 3 && b.retailStatus.remainingDays > 0)
    .map(b => ({
      batch: b,
      type: b.retailStatus!.remainingDays <= 1 ? 'urgent' : 'warning',
      message: b.retailStatus!.remainingDays <= 1
        ? `URGENT: ${b.batchId} expires tomorrow!`
        : `Warning: ${b.batchId} expires in ${b.retailStatus!.remainingDays} days`
    }));

  const selected = selectedBatch ? batches.find(b => b.batchId === selectedBatch) : null;
  const pendingOrders = orders.filter(o => o.status === 'Pending');

  const handleCreateCrate = () => {
    if (!crateBatchId || !crateQuantity) {
      toast.error('Please fill all fields');
      return;
    }

    const batch = getBatchById(crateBatchId.toUpperCase());
    if (!batch) {
      toast.error('Batch not found');
      return;
    }

    const crate: Crate = {
      crateId: generateCrateId(),
      batchId: crateBatchId.toUpperCase(),
      quantity: parseInt(crateQuantity),
      createdAt: new Date()
    };

    addCrate(crate);
    setCrates([...crates, crate]);
    toast.success(`Crate ${crate.crateId} created`);
    setCrateBatchId('');
    setCrateQuantity('');
  };

  const handleFulfillOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'Fulfilled');
    setOrders(orders.map(o => o.orderId === orderId ? { ...o, status: 'Fulfilled' as const } : o));
    toast.success('Order fulfilled');
  };

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <WarehouseIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Warehouse</h1>
              <p className="text-muted-foreground">Inventory & Fulfillment Center</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => exportBatchesToCSV(batches)} className="rounded-xl h-10">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            {notifications.length > 0 && (
              <Button variant="destructive" size="icon" className="rounded-xl h-10 w-10 shadow-lg shadow-destructive/20 animate-pulse">
                <Bell className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass-card p-4 flex flex-col items-center justify-center text-center space-y-1 hover:bg-white/50 transition-colors cursor-pointer">
            <span className="text-3xl font-bold">{batches.length}</span>
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Total Batches</span>
          </Card>
          <Card className="glass-card p-4 flex flex-col items-center justify-center text-center space-y-1 hover:bg-white/50 transition-colors cursor-pointer border-fresh/30 bg-fresh/5">
            <span className="text-3xl font-bold text-fresh">{freshCount}</span>
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Fresh Stock</span>
          </Card>
          <Card className="glass-card p-4 flex flex-col items-center justify-center text-center space-y-1 hover:bg-white/50 transition-colors cursor-pointer border-warning/30 bg-warning/5">
            <span className="text-3xl font-bold text-warning">{consumeSoonCount}</span>
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Low Shelf Life</span>
          </Card>
          <Card className="glass-card p-4 flex flex-col items-center justify-center text-center space-y-1 hover:bg-white/50 transition-colors cursor-pointer border-primary/20">
            <span className="text-3xl font-bold text-primary">{(totalWeight / 1000).toFixed(1)}t</span>
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Volume Held</span>
          </Card>
        </div>

        <Tabs defaultValue="inventory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-secondary/50 rounded-xl p-1">
            <TabsTrigger value="inventory" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Current Inventory</TabsTrigger>
            <TabsTrigger value="crates" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Crate Management</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm relative">
              Orders
              {pendingOrders.length > 0 && (
                <span className="ml-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] grid place-items-center">
                  {pendingOrders.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                {/* Filters */}
                <div className="flex gap-2 pb-2 overflow-x-auto">
                  {(['all', 'Fresh', 'Consume Soon', 'Expired'] as const).map((status) => (
                    <Button
                      key={status}
                      variant={filter === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter(status)}
                      className={cn("rounded-lg", filter === status && status === 'Fresh' ? "bg-fresh hover:bg-fresh/90" : "")}
                    >
                      {status === 'all' ? 'View All' : status}
                    </Button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search batches..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 rounded-xl bg-white/50 border-0 shadow-sm"
                  />
                </div>

                <Card className="overflow-hidden border-0 bg-transparent shadow-none">
                  <div className="space-y-3">
                    {filteredBatches.map((batch) => {
                      const product = getProductById(batch.cropType);
                      return (
                        <div
                          key={batch.batchId}
                          onClick={() => setSelectedBatch(batch.batchId)}
                          className={cn(
                            'group flex items-center justify-between p-4 rounded-xl border border-border/50 bg-white/40 hover:bg-white hover:scale-[1.01] transition-all cursor-pointer shadow-sm',
                            selectedBatch === batch.batchId ? 'ring-2 ring-primary border-transparent bg-white shadow-md' : ''
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-xl">
                              {product?.emoji}
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{product?.name || batch.cropType}</h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="font-mono bg-secondary/50 px-1.5 py-0.5 rounded text-[10px]">{batch.batchId}</span>
                                <span>•</span>
                                <span>{batch.quantity} {product?.unit}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="flex justify-end mb-1">
                              <StatusBadge status={batch.retailStatus?.status || 'Unknown'} size="sm" />
                            </div>
                            <p className="text-xs font-medium text-muted-foreground">
                              Expires {format(new Date(batch.retailStatus!.sellByDate), 'MMM d')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-1">
                {selected ? (
                  <Card className="glass-card sticky top-24 border-2 shadow-xl animate-in fade-in duration-500">
                    <CardHeader className="text-center pb-2">
                      <div className="mx-auto h-20 w-20 bg-gradient-to-br from-secondary to-background rounded-full flex items-center justify-center text-4xl mb-4 shadow-inner">
                        {getProductById(selected.cropType)?.emoji}
                      </div>
                      <CardTitle className="text-xl">{getProductById(selected.cropType)?.name}</CardTitle>
                      <CardDescription className="font-mono text-sm bg-secondary/50 inline-block px-2 py-1 rounded mx-auto">
                        {selected.batchId}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex justify-center p-4 bg-white rounded-xl shadow-sm border border-border/10">
                        <QRCodeSVG
                          value={`${window.location.origin}/scan/${selected.batchId}`}
                          size={120}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-secondary/30 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground uppercase">Grade</p>
                          <p className="text-lg font-bold">{selected.qualityGrade}</p>
                        </div>
                        <div className="p-3 bg-secondary/30 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground uppercase">Storage</p>
                          <p className="text-lg font-bold truncate">{selected.storage?.storageType}</p>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <div className="flex justify-between items-center text-sm p-2 bg-secondary/20 rounded-lg">
                          <span className="text-muted-foreground">Est. Shelf Life</span>
                          <span className="font-mono font-bold">{selected.retailStatus?.remainingDays} days</span>
                        </div>
                        {selected.farmer && (
                          <div className="flex justify-between items-center text-sm p-2 bg-secondary/20 rounded-lg">
                            <span className="text-muted-foreground">Origin</span>
                            <span className="font-medium">{selected.farmer.name}</span>
                          </div>
                        )}
                      </div>

                      <PrintLabel batch={selected} />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-border/50 rounded-xl bg-secondary/10 text-muted-foreground">
                    <Search className="h-10 w-10 mb-4 opacity-20" />
                    <p>Select a batch from the list to view full tracking details and labels</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Crates Tab */}
          <TabsContent value="crates" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Generate Crate ID</CardTitle>
                  <CardDescription>Assign traceable IDs to shipping crates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Source Batch ID</Label>
                    <div className="relative">
                      <Input
                        placeholder="e.g. B-1234..."
                        value={crateBatchId}
                        onChange={(e) => setCrateBatchId(e.target.value.toUpperCase())}
                        className="font-mono pl-9"
                      />
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity (kg)</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={crateQuantity}
                      onChange={(e) => setCrateQuantity(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleCreateCrate} className="w-full h-12 rounded-xl text-base shadow-lg shadow-primary/10">
                    <Plus className="mr-2 h-4 w-4" /> Generate Label
                  </Button>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-0 bg-transparent shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-lg">Recent Crates</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                  <div className="space-y-3">
                    {crates.slice(-5).reverse().map(crate => (
                      <div key={crate.crateId} className="flex items-center p-4 bg-white/60 border border-border/50 rounded-xl shadow-sm">
                        <div className="h-10 w-10 bg-secondary rounded-lg flex items-center justify-center mr-4">
                          <BoxIcon className="h-5 w-5 text-foreground/70" />
                        </div>
                        <div className="flex-1">
                          <p className="font-mono font-bold">{crate.crateId}</p>
                          <p className="text-xs text-muted-foreground">From {crate.batchId}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-lg">{crate.quantity}</span> <span className="text-xs text-muted-foreground">kg</span>
                        </div>
                      </div>
                    ))}
                    {crates.length === 0 && <p className="text-center text-muted-foreground py-10">No crates created yet.</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-l-4 border-l-primary shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Pending Fulfillment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingOrders.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground bg-secondary/20 rounded-xl border border-dashed">
                      All caught up! No pending orders.
                    </div>
                  ) : (
                    pendingOrders.map(order => (
                      <div key={order.orderId} className="p-4 bg-white rounded-xl border shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-mono font-bold text-lg">{order.orderId}</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(order.orderDate), 'MMM d, h:mm a')}</p>
                          </div>
                          <Badge variant="outline">Pending</Badge>
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="text-sm">
                            <p className="text-muted-foreground">Requesting:</p>
                            <p className="font-medium">{order.quantity}kg from {order.batchId}</p>
                          </div>
                          <Button size="sm" onClick={() => handleFulfillOrder(order.orderId)} className="rounded-lg">
                            Fulfill Order <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="bg-secondary/10 border-0">
                <CardHeader>
                  <CardTitle className="text-lg opacity-70">History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 opacity-80">
                    {orders.filter(o => o.status === 'Fulfilled').slice(0, 5).map(order => (
                      <div key={order.orderId} className="flex justify-between items-center p-3 bg-white/50 rounded-lg border border-border/50">
                        <div>
                          <p className="font-mono text-sm font-medium strike-through text-muted-foreground">{order.orderId}</p>
                          <span className="text-[10px] text-muted-foreground">Fulfilled on {format(new Date(), 'MMM d')}</span>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-fresh" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
