import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getAllBatches } from '@/lib/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { BatchCard } from '@/components/BatchCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Warehouse as WarehouseIcon, Search, AlertTriangle, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Warehouse() {
  const batches = getAllBatches().filter(b => b.qualityGrade !== null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'Fresh' | 'Consume Soon' | 'Expired'>('all');

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

  // Notifications
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Warehouse Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Monitor all batches and their freshness status
            </p>
          </div>

          {/* Notifications Bell */}
          {notifications.length > 0 && (
            <div className="relative">
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-expired text-expired-foreground text-xs flex items-center justify-center">
                  {notifications.length}
                </span>
              </Button>
            </div>
          )}
        </div>

        {/* Notifications Panel */}
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

        {/* Status Summary */}
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

        {/* Search */}
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
          {/* Batch List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <WarehouseIcon className="h-5 w-5" />
                  Inventory ({filteredBatches.length} batches)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
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
                        <div>
                          <p className="font-mono font-medium">{batch.batchId}</p>
                          <p className="text-sm text-muted-foreground">
                            {batch.quantity} kg • Grade {batch.qualityGrade}
                          </p>
                        </div>
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
                  {filteredBatches.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No batches found matching your criteria
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Batch Details */}
          <div className="lg:col-span-1">
            {selected ? (
              <BatchCard batch={selected} showQR showDetails />
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <WarehouseIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Select a batch to view details
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
