import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getBillByUniqueCode } from '@/lib/orderData';
import { getBatchById } from '@/lib/mockData';
import { CheckCircle2, AlertTriangle, XCircle, Leaf, Search, ShoppingBag, ArrowLeft, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { getProductById } from '@/lib/types';

export default function CustomerLookup() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [result, setResult] = useState<'idle' | 'not_found' | 'found'>('idle');
  const [billData, setBillData] = useState<any>(null);

  const handleSearch = () => {
    if (!code.trim()) return;

    const bill = getBillByUniqueCode(code.trim());
    if (bill) {
      // Get batch details for each item
      const itemsWithDetails = bill.items.map((item: any) => {
        const batch = getBatchById(item.batchId);
        return {
          ...item,
          batch
        };
      });
      setBillData({ ...bill, items: itemsWithDetails });
      setResult('found');
    } else {
      setResult('not_found');
      setBillData(null);
    }
  };

  const getGradeInfo = (grade: string) => {
    switch (grade) {
      case 'A':
        return { label: 'Premium Quality', color: 'text-fresh', bg: 'bg-fresh/10' };
      case 'B':
        return { label: 'Good Quality', color: 'text-warning', bg: 'bg-warning/10' };
      case 'C':
        return { label: 'Standard Quality', color: 'text-muted-foreground', bg: 'bg-muted' };
      default:
        return { label: 'Unknown', color: 'text-muted-foreground', bg: 'bg-muted' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="h-10 w-10 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold">Agrovia</h1>
            <p className="text-xs opacity-80">Check Your Purchase Quality</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* Search Card */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="text-center mb-6">
              <ShoppingBag className="h-12 w-12 text-primary mx-auto mb-2" />
              <h2 className="text-xl font-bold">Verify Your Purchase</h2>
              <p className="text-sm text-muted-foreground">
                Enter the code from your bill to check product quality
              </p>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Enter bill code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="font-mono text-center text-lg tracking-widest"
                maxLength={8}
              />
              <Button onClick={handleSearch} size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Not Found */}
        {result === 'not_found' && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6 text-center">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="font-semibold text-destructive">Code Not Found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Please check the code and try again
              </p>
            </CardContent>
          </Card>
        )}

        {/* Found - Show Items */}
        {result === 'found' && billData && (
          <div className="space-y-4">
            <Card className="border-fresh/50 bg-fresh/5">
              <CardContent className="pt-6 text-center">
                <CheckCircle2 className="h-12 w-12 text-fresh mx-auto mb-2" />
                <h3 className="font-semibold text-fresh">Purchase Verified</h3>
                <p className="text-xs text-muted-foreground">
                  Bill from {format(new Date(billData.createdAt), 'PPP')}
                </p>
              </CardContent>
            </Card>

            {billData.items.map((item: any, index: number) => {
              const gradeInfo = getGradeInfo(item.grade);
              const batch = item.batch;
              const remainingDays = batch?.retailStatus?.remainingDays || 0;
              const status = batch?.retailStatus?.status || 'Unknown';
              const product = batch ? getProductById(batch.cropType) : null;
              const productName = product?.name || 'Produce';

              return (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Leaf className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{productName}</h3>
                        <p className="text-sm text-muted-foreground">{item.quantity} kg</p>
                      </div>
                      <div className={cn('px-3 py-1 rounded-full text-sm font-medium', gradeInfo.bg, gradeInfo.color)}>
                        Grade {item.grade}
                      </div>
                    </div>

                    <div className={cn('p-4 rounded-lg text-center', gradeInfo.bg)}>
                      <p className={cn('font-semibold', gradeInfo.color)}>{gradeInfo.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.grade === 'A' && 'Top tier produce, excellent freshness'}
                        {item.grade === 'B' && 'Good quality, slight cosmetic variations'}
                        {item.grade === 'C' && 'Suitable for immediate use or cooking'}
                      </p>
                    </div>

                    {batch && (
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="p-3 bg-secondary rounded-lg text-center">
                          <p className="text-xs text-muted-foreground">Freshness</p>
                          <p className={cn(
                            'font-semibold',
                            status === 'Fresh' ? 'text-fresh' :
                            status === 'Consume Soon' ? 'text-warning' :
                            'text-expired'
                          )}>
                            {status === 'Fresh' && 'Fresh'}
                            {status === 'Consume Soon' && 'Consume Soon'}
                            {status === 'Expired' && 'Expired'}
                          </p>
                        </div>
                        <div className="p-3 bg-secondary rounded-lg text-center">
                          <p className="text-xs text-muted-foreground">Good For</p>
                          <p className={cn(
                            'font-semibold',
                            remainingDays > 3 ? 'text-fresh' :
                            remainingDays > 0 ? 'text-warning' :
                            'text-expired'
                          )}>
                            {remainingDays > 0 ? `${remainingDays} days` : 'Expired'}
                          </p>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground text-center mt-4 font-mono">
                      Batch: {item.batchId}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Instructions */}
        {result === 'idle' && (
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Where to find your code?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Look for the 8-character code at the bottom of your receipt, 
                    near the barcode.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trust Badge */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Quality You Can Trust</p>
                <p className="text-xs text-muted-foreground">
                  Every product is tracked from farm to your table.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="max-w-md mx-auto p-4 text-center text-xs text-muted-foreground">
        <p>Powered by Agrovia - Reducing Food Waste Together</p>
      </footer>
    </div>
  );
}
