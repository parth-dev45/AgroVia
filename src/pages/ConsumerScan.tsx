import { useParams, Link, useNavigate } from 'react-router-dom';
import { getBatchById } from '@/lib/mockData';
import { calculateDaysSinceHarvest } from '@/lib/freshness';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, XCircle, Leaf, ArrowLeft, Calendar, Clock, MapPin, Truck, ChevronRight, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProductById } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

export default function ConsumerScan() {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const batch = batchId ? getBatchById(batchId) : null;

  if (!batch) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 animate-in fade-in duration-500">
        <Card className="w-full max-w-md glass-card shadow-xl border-destructive/20">
          <CardContent className="pt-8 text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center animate-pulse">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold">Product Not Found</h1>
            <p className="text-muted-foreground">
              We couldn't find information for this product. The QR code may be invalid or expired.
            </p>
            <Link to="/">
              <Button variant="outline" className="mt-4 w-full rounded-xl">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Homepage
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
      bg: 'bg-fresh',
      lightBg: 'bg-fresh/10',
      border: 'border-fresh/30',
      label: 'Guaranteed Fresh',
      message: 'Verified safe & fresh from farm to you.',
      gradient: 'from-fresh/20 to-transparent'
    },
    'Consume Soon': {
      icon: AlertTriangle,
      color: 'text-warning',
      bg: 'bg-warning',
      lightBg: 'bg-warning/10',
      border: 'border-warning/30',
      label: 'Consume Soon',
      message: 'Best quality if consumed within days.',
      gradient: 'from-warning/20 to-transparent'
    },
    Expired: {
      icon: XCircle,
      color: 'text-expired',
      bg: 'bg-expired',
      lightBg: 'bg-expired/10',
      border: 'border-expired/30',
      label: 'Expired',
      message: 'This product has passed its shelf life.',
      gradient: 'from-expired/20 to-transparent'
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Fresh;
  const StatusIcon = config.icon;

  const steps = [
    {
      icon: MapPin,
      title: 'Harvested',
      date: new Date(batch.harvestDate),
      detail: batch.farmer?.name || 'Partner Farm',
      active: true
    },
    {
      icon: ShieldCheck,
      title: 'Quality Tested',
      date: batch.qualityTest?.testDate || new Date(batch.harvestDate),
      detail: batch.qualityGrade ? `Grade ${batch.qualityGrade} Verified` : 'Pending',
      active: !!batch.qualityGrade
    },
    {
      icon: Truck,
      title: 'In Transit/Storage',
      date: batch.storage?.entryDate || new Date(),
      detail: batch.storage?.storageType === 'Cold' ? 'Cold Chain Preserved' : 'Standard Storage',
      active: true
    },
    {
      icon: Leaf,
      title: 'Ready for You',
      date: new Date(),
      detail: config.label,
      active: true
    }
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Mobile-first Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3 pb-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Leaf className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold leading-tight">AgroVia</h1>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Trust Verified</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-full hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6 animate-in slide-in-from-bottom-4 duration-700">

        {/* Hero Product Card */}
        <div className="relative">
          <div className={cn("absolute inset-0 bg-gradient-to-b rounded-3xl blur-xl opacity-50", config.gradient)} />
          <Card className="relative overflow-hidden border-2 shadow-xl rounded-3xl">
            <div className={cn("absolute top-0 left-0 w-full h-2", config.bg)} />
            <CardContent className="pt-8 pb-6 text-center space-y-4">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-secondary to-background rounded-full flex items-center justify-center shadow-inner border border-border/50 text-5xl">
                {product?.emoji || '🥬'}
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight">{productName}</h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-secondary/50 border")}>
                    Batch {batch.batchId}
                  </span>
                </div>
              </div>

              <div className={cn("inline-flex items-center gap-2 px-5 py-2.5 rounded-full border shadow-sm", config.lightBg, config.border)}>
                <StatusIcon className={cn("h-5 w-5", config.color)} />
                <span className={cn("font-bold", config.color)}>{config.label}</span>
              </div>

              <p className="text-muted-foreground text-sm max-w-[280px] mx-auto">
                {config.message}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Journey Timeline */}
        <Card className="glass-card shadow-lg rounded-3xl overflow-hidden">
          <CardHeader className="bg-secondary/30 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Farm to Fork Journey
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 relative">
            <div className="absolute left-8 top-6 bottom-6 w-0.5 bg-border z-0" />
            <div className="space-y-8 relative z-10">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className={cn(
                    "flex-none h-8 w-8 rounded-full flex items-center justify-center border-2 border-background shadow-sm",
                    step.active ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                  )}>
                    <step.icon className="h-4 w-4" />
                  </div>
                  <div className="pt-1">
                    <p className="font-semibold leading-none mb-1">{step.title}</p>
                    <p className="text-xs text-muted-foreground mb-1">{step.detail}</p>
                    <p className="text-[10px] text-muted-foreground/70 font-mono">
                      {step.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-secondary/20 border-0 shadow-none">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <Calendar className="h-6 w-6 text-primary/60" />
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase">Harvest Age</p>
                <p className="text-xl font-bold text-primary">{daysSinceHarvest} <span className="text-sm font-normal">days</span></p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-secondary/20 border-0 shadow-none">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <Clock className="h-6 w-6 text-primary/60" />
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase">Remaining</p>
                <p className={cn("text-xl font-bold", remainingDays <= 2 ? "text-warning" : "text-primary")}>
                  {remainingDays} <span className="text-sm font-normal">days</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Provenance Cert */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 rounded-2xl border border-primary/10 flex items-center gap-4">
          <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-primary">Authenticity Verified</h3>
            <p className="text-xs text-muted-foreground">Blockchain-backed traceability via AgroVia.</p>
          </div>
        </div>

      </main>
    </div>
  );
}