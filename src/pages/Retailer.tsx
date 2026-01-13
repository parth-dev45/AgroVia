import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getBatchById } from '@/lib/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { PRICE_PER_KG, BatchWithDetails } from '@/lib/types';
import { Store, QrCode, Search, CheckCircle2, XCircle, AlertTriangle, Calendar, Thermometer, Scale } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Retailer() {
  const [batchId, setBatchId] = useState('');
  const [searchedBatch, setSearchedBatch] = useState<BatchWithDetails | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = () => {
    if (!batchId.trim()) return;
    
    const batch = getBatchById(batchId.trim().toUpperCase());
    if (batch) {
      setSearchedBatch(batch);
      setNotFound(false);
    } else {
      setSearchedBatch(null);
      setNotFound(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const gradeColors = {
    A: 'bg-fresh text-fresh-foreground',
    B: 'bg-warning text-warning-foreground',
    C: 'bg-muted text-muted-foreground',
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Retailer View</h1>
          <p className="text-muted-foreground mt-1">
            Scan or enter Batch ID to check selling eligibility
          </p>
        </div>

        {/* Search Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <QrCode className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Batch Lookup</CardTitle>
                <CardDescription>
                  Enter the Batch ID from the QR code or label
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter Batch ID (e.g., TOM-XXX-XXXX)"
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value.toUpperCase())}
                  onKeyPress={handleKeyPress}
                  className="pl-10 font-mono"
                />
              </div>
              <Button onClick={handleSearch} size="lg">
                <Store className="h-4 w-4 mr-2" />
                Check Status
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Not Found */}
        {notFound && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-destructive">Batch Not Found</h3>
                  <p className="text-sm text-muted-foreground">
                    No batch found with ID "{batchId}". Please check the ID and try again.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Batch Result */}
        {searchedBatch && (
          <div className="space-y-4">
            {/* Sale Status Banner */}
            <Card className={cn(
              'border-2',
              searchedBatch.retailStatus?.saleAllowed 
                ? 'border-fresh bg-fresh/5' 
                : 'border-expired bg-expired/5'
            )}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'h-16 w-16 rounded-full flex items-center justify-center',
                      searchedBatch.retailStatus?.saleAllowed 
                        ? 'bg-fresh/20' 
                        : 'bg-expired/20'
                    )}>
                      {searchedBatch.retailStatus?.saleAllowed ? (
                        <CheckCircle2 className="h-8 w-8 text-fresh" />
                      ) : (
                        <XCircle className="h-8 w-8 text-expired" />
                      )}
                    </div>
                    <div>
                      <h3 className={cn(
                        'text-2xl font-bold',
                        searchedBatch.retailStatus?.saleAllowed 
                          ? 'text-fresh' 
                          : 'text-expired'
                      )}>
                        {searchedBatch.retailStatus?.saleAllowed 
                          ? 'SALE ALLOWED' 
                          : 'SALE BLOCKED'}
                      </h3>
                      <p className="text-muted-foreground">
                        {searchedBatch.retailStatus?.saleAllowed 
                          ? 'This batch is safe to sell to consumers' 
                          : 'This batch has expired and cannot be sold'}
                      </p>
                    </div>
                  </div>
                  {searchedBatch.retailStatus && (
                    <StatusBadge status={searchedBatch.retailStatus.status} size="lg" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Batch Details */}
            <Card>
              <CardHeader>
                <CardTitle className="font-mono">{searchedBatch.batchId}</CardTitle>
                <CardDescription>🍅 {searchedBatch.cropType}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                      {searchedBatch.qualityGrade && (
                        <>
                          <Badge className={`text-lg py-1 px-3 ${gradeColors[searchedBatch.qualityGrade]}`}>
                            Grade {searchedBatch.qualityGrade}
                          </Badge>
                          <span className="text-lg font-bold">
                            ₹{PRICE_PER_KG[searchedBatch.qualityGrade]}/kg
                          </span>
                        </>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Harvested</p>
                          <p className="text-sm font-medium">
                            {format(new Date(searchedBatch.harvestDate), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Sell By</p>
                          <p className="text-sm font-medium">
                            {searchedBatch.retailStatus && format(new Date(searchedBatch.retailStatus.sellByDate), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                      <Thermometer className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Storage</p>
                        <p className="text-sm font-medium">{searchedBatch.storage?.storageType} Storage</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                      <Scale className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Quantity</p>
                        <p className="text-sm font-medium">{searchedBatch.quantity} kg</p>
                      </div>
                    </div>
                    <div className="p-3 bg-secondary rounded-lg">
                      <p className="text-xs text-muted-foreground">Remaining Shelf Life</p>
                      <p className={cn(
                        'text-2xl font-bold',
                        searchedBatch.retailStatus && searchedBatch.retailStatus.remainingDays <= 0 
                          ? 'text-expired' 
                          : searchedBatch.retailStatus && searchedBatch.retailStatus.remainingDays <= 3 
                            ? 'text-warning' 
                            : 'text-fresh'
                      )}>
                        {searchedBatch.retailStatus && searchedBatch.retailStatus.remainingDays > 0 
                          ? `${searchedBatch.retailStatus.remainingDays} days`
                          : 'Expired'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Warning for Consume Soon */}
                {searchedBatch.retailStatus?.status === 'Consume Soon' && (
                  <div className="mt-4 p-4 bg-warning/10 rounded-lg border border-warning/30 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                    <div>
                      <p className="font-medium text-warning-foreground">Priority Sale Recommended</p>
                      <p className="text-sm text-muted-foreground">
                        This batch should be sold within the next {searchedBatch.retailStatus.remainingDays} days. 
                        Consider promotional pricing to reduce waste.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Instructions */}
        {!searchedBatch && !notFound && (
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <QrCode className="h-16 w-16 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="font-semibold">How to Use</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                    1. Scan the QR code on the product packaging or <br />
                    2. Enter the Batch ID manually (found on labels)
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-fresh" />
                  <span className="text-fresh">Green = OK to sell</span>
                  <span className="text-muted-foreground mx-2">•</span>
                  <XCircle className="h-4 w-4 text-expired" />
                  <span className="text-expired">Red = Do not sell</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
