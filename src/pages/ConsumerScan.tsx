import { useParams, Link, useNavigate } from 'react-router-dom';
import { getBatchById } from '@/lib/mockData';
import { calculateDaysSinceHarvest } from '@/lib/freshness';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, XCircle, Leaf, ArrowLeft, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProductById } from '@/lib/types';

export default function ConsumerScan() {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const batch = batchId ? getBatchById(batchId) : null;

  if (!batch) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-16 w-16 text-expired mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">
              We couldn't find information for this product. The QR code may be invalid or expired.
            </p>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go to Homepage
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Resolve product from cropType (which stores productId)
  const product = getProductById(batch.cropType);
  const productName = product?.name || batch.cropType;
  const productUnit = product?.unit || 'kg';

  const daysSinceHarvest = calculateDaysSinceHarvest(new Date(batch.harvestDate));
  const remainingDays = batch.retailStatus?.remainingDays || 0;
  const status = batch.retailStatus?.status || 'Unknown';

  const statusConfig = {
    Fresh: {
      icon: CheckCircle2,
      color: 'text-fresh',
      bg: 'bg-fresh/10',
      border: 'border-fresh/30',
      label: 'Fresh',
      message: 'This product is fresh and safe to consume.',
    },
    'Consume Soon': {
      icon: AlertTriangle,
      color: 'text-warning',
      bg: 'bg-warning/10',
      border: 'border-warning/30',
      label: 'Consume Soon',
      message: 'Best consumed within the next few days.',
    },
    Expired: {
      icon: XCircle,
      color: 'text-expired',
      bg: 'bg-expired/10',
      border: 'border-expired/30',
      label: 'Expired',
      message: 'This product has passed its recommended consumption date.',
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Fresh;
  const StatusIcon = config.icon;

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
            <p className="text-xs opacity-80">Farm-to-Fork Transparency</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* Product Card */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-fresh/10 p-6 text-center">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Leaf className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">{productName}</h2>
            <p className="text-sm text-muted-foreground">Premium Quality Produce</p>
          </div>
          <CardContent className="p-0">
            {/* Status Banner */}
            <div className={cn('p-4 border-b', config.bg, config.border)}>
              <div className="flex items-center justify-center gap-3">
                <StatusIcon className={cn('h-8 w-8', config.color)} />
                <span className={cn('text-2xl font-bold', config.color)}>
                  {config.label}
                </span>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-2">
                {config.message}
              </p>
            </div>

            {/* Info Grid */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Harvested</span>
                </div>
                <span className="font-semibold">{daysSinceHarvest} days ago</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Good for</span>
                </div>
                <span className={cn(
                  'font-semibold',
                  remainingDays <= 0 ? 'text-expired' : remainingDays <= 3 ? 'text-warning' : 'text-fresh'
                )}>
                  {remainingDays > 0 ? `${remainingDays} more days` : 'Expired'}
                </span>
              </div>

              {batch.qualityGrade && (
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <span className="text-muted-foreground">Quality Grade</span>
                  <span className={cn(
                    'font-bold px-3 py-1 rounded-full text-sm',
                    batch.qualityGrade === 'A' ? 'bg-fresh/20 text-fresh' :
                    batch.qualityGrade === 'B' ? 'bg-warning/20 text-warning-foreground' :
                    'bg-muted text-muted-foreground'
                  )}>
                    Grade {batch.qualityGrade}
                  </span>
                </div>
              )}

              {batch.farmer && (
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <span className="text-muted-foreground">Farmer</span>
                  <span className="font-semibold">{batch.farmer.name}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Trust Badge */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Tracked from Farm to You</p>
                <p className="text-xs text-muted-foreground">
                  This product's journey is fully traceable for your safety.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Batch ID - Small */}
        <p className="text-center text-xs text-muted-foreground font-mono">
          Batch: {batch.batchId}
        </p>
      </main>

      {/* Footer */}
      <footer className="max-w-md mx-auto p-4 text-center text-xs text-muted-foreground">
        <p>Powered by Agrovia - Reducing Food Waste Together</p>
      </footer>
    </div>
  );
}