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
  BoxIcon
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
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Warehouse Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage inventory, crates, and fulfill orders
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => exportBatchesToCSV(batches)}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            {notifications.length > 0 && (
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-expired text-expired-foreground text-xs flex items-center justify-center">
                  {notifications.length}
                </span>
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="inventory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="crates">Crate Management</TabsTrigger>
            <TabsTrigger value="orders">
              Orders
              {pendingOrders.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">
                  {pendingOrders.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            {notifications.length > 0 && (
              <Card className="border-warning/50 bg-warning/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    Expiry Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.batch.batchId}
                        className={cn(
                          'flex items-center justify-between p-3 rounded-lg',
                          notif.type === 'urgent' ? 'bg-expired/10 text-expired' : 'bg-warning/10 text-warning-foreground'
                        )}
                      >
                        <span className="font-medium">{notif.message}</span>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setSelectedBatch(notif.batch.batchId)}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-3 gap-4">
              <Button
                variant={filter === 'Fresh' ? 'default' : 'outline'}
                className={cn(
                  'h-auto py-4 flex-col gap-1',
                  filter === 'Fresh' && 'bg-fresh hover:bg-fresh/90'
                )}
                onClick={() => setFilter(filter === 'Fresh' ? 'all' : 'Fresh')}
              >
                <span className="text-2xl font-bold">{freshCount}</span>
                <span className="text-sm opacity-80">Fresh</span>
              </Button>
              <Button
                variant={filter === 'Consume Soon' ? 'default' : 'outline'}
                className={cn(
                  'h-auto py-4 flex-col gap-1',
                  filter === 'Consume Soon' && 'bg-warning hover:bg-warning/90 text-warning-foreground'
                )}
                onClick={() => setFilter(filter === 'Consume Soon' ? 'all' : 'Consume Soon')}
              >
                <span className="text-2xl font-bold">{consumeSoonCount}</span>
                <span className="text-sm opacity-80">Consume Soon</span>
              </Button>
              <Button
                variant={filter === 'Expired' ? 'default' : 'outline'}
                className={cn(
                  'h-auto py-4 flex-col gap-1',
                  filter === 'Expired' && 'bg-expired hover:bg-expired/90'
                )}
                onClick={() => setFilter(filter === 'Expired' ? 'all' : 'Expired')}
              >
                <span className="text-2xl font-bold">{expiredCount}</span>
                <span className="text-sm opacity-80">Expired</span>
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Batch ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <WarehouseIcon className="h-5 w-5" />
                      Inventory ({filteredBatches.length} batches)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredBatches.map((batch) => (
                        <div
                          key={batch.batchId}
                          onClick={() => setSelectedBatch(batch.batchId)}
                          className={cn(
                            'flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors',
                            selectedBatch === batch.batchId 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:bg-secondary'
                          )}
                        >
                          <div className="flex items-center gap-4">
                            {(() => {
                              const product = getProductById(batch.cropType);
                              return (
                                <div>
                                  <p className="font-medium">{product?.name || batch.cropType}</p>
                                  <p className="font-mono text-xs text-muted-foreground">{batch.batchId}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {batch.quantity} {product?.unit || 'kg'} - Grade {batch.qualityGrade}
                                  </p>
                                </div>
                              );
                            })()}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {batch.retailStatus && batch.retailStatus.remainingDays > 0 
                                  ? `${batch.retailStatus.remainingDays}d left`
                                  : 'Expired'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {batch.storage?.storageType}
                              </p>
                            </div>
                            {batch.retailStatus && (
                              <StatusBadge status={batch.retailStatus.status} size="sm" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-1">
                {selected ? (
                  (() => {
                    const product = getProductById(selected.cropType);
                    const productName = product?.name || selected.cropType;
                    return (
                      <Card>
                        <CardHeader>
                          <CardTitle>{productName}</CardTitle>
                          <CardDescription className="font-mono">{selected.batchId}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                      <div className="flex justify-center">
                        <QRCodeSVG
                          value={`${window.location.origin}/scan/${selected.batchId}`}
                          size={120}
                        />
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Grade</span>
                          <Badge>{selected.qualityGrade}</Badge>
                        </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Quantity</span>
                            <span>{selected.quantity} {product?.unit || 'kg'}</span>
                        </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Storage</span>
                            <span>{selected.storage?.storageType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status</span>
                            {selected.retailStatus && <StatusBadge status={selected.retailStatus.status} size="sm" />}
                          </div>
                          {selected.farmer && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Farmer</span>
                              <span>{selected.farmer.name}</span>
                            </div>
                          )}
                        </div>
                        <PrintLabel batch={selected} />
                      </CardContent>
                    </Card>
                    );
                  })()
                ) : (
                  <Card className="h-full flex items-center justify-center">
                    <CardContent className="text-center py-12">
                      <WarehouseIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Select a batch to view details</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Crates Tab */}
          <TabsContent value="crates" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BoxIcon className="h-5 w-5" />
                    Create Crate ID
                  </CardTitle>
                  <CardDescription>
                    Assign unique IDs to crates for tracking
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Batch ID</Label>
                    <Input
                      placeholder="Enter batch ID"
                      value={crateBatchId}
                      onChange={(e) => setCrateBatchId(e.target.value.toUpperCase())}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity (kg)</Label>
                    <Input
                      type="number"
                      placeholder="Enter quantity"
                      value={crateQuantity}
                      onChange={(e) => setCrateQuantity(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleCreateCrate} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Crate
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Crates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {crates.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No crates created</p>
                    ) : (
                      crates.slice(-10).reverse().map(crate => (
                        <div key={crate.crateId} className="p-3 bg-secondary rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-mono font-medium">{crate.crateId}</p>
                              <p className="text-xs text-muted-foreground">
                                Batch: {crate.batchId} • {crate.quantity}kg
                              </p>
                            </div>
                            <div className="text-right text-xs text-muted-foreground">
                              {format(new Date(crate.createdAt), 'MMM d, HH:mm')}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Orders</CardTitle>
                <CardDescription>Orders from retailers awaiting fulfillment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingOrders.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No pending orders</p>
                  ) : (
                    pendingOrders.map(order => (
                      <div key={order.orderId} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-mono font-medium">{order.orderId}</p>
                          <p className="text-sm text-muted-foreground">
                            Batch: {order.batchId} • {order.quantity}kg
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(order.orderDate), 'PPpp')}
                          </p>
                        </div>
                        <Button onClick={() => handleFulfillOrder(order.orderId)}>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Fulfill
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fulfilled Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {orders.filter(o => o.status === 'Fulfilled').length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No fulfilled orders</p>
                  ) : (
                    orders.filter(o => o.status === 'Fulfilled').slice(-10).reverse().map(order => (
                      <div key={order.orderId} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div>
                          <p className="font-mono text-sm">{order.orderId}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.batchId} • {order.quantity}kg
                          </p>
                        </div>
                        <Badge variant="default" className="bg-fresh">Fulfilled</Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
