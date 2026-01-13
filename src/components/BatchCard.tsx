import { BatchWithDetails, PRICE_PER_KG } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Calendar, Scale, Thermometer, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

interface BatchCardProps {
  batch: BatchWithDetails;
  showQR?: boolean;
  showDetails?: boolean;
}

export function BatchCard({ batch, showQR = false, showDetails = true }: BatchCardProps) {
  const gradeColors = {
    A: 'bg-fresh text-fresh-foreground',
    B: 'bg-warning text-warning-foreground',
    C: 'bg-muted text-muted-foreground',
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-mono">{batch.batchId}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              🍅 {batch.cropType}
            </p>
          </div>
          {batch.qualityGrade && (
            <Badge className={gradeColors[batch.qualityGrade]}>
              Grade {batch.qualityGrade}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {batch.retailStatus && (
          <div className="flex items-center justify-between">
            <StatusBadge status={batch.retailStatus.status} />
            <span className="text-sm text-muted-foreground">
              {batch.retailStatus.remainingDays > 0 
                ? `${batch.retailStatus.remainingDays} days left`
                : 'Expired'}
            </span>
          </div>
        )}

        {showDetails && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Harvested: {format(new Date(batch.harvestDate), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Scale className="h-4 w-4" />
              <span>{batch.quantity} kg</span>
            </div>
            {batch.storage && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Thermometer className="h-4 w-4" />
                <span>{batch.storage.storageType} Storage</span>
              </div>
            )}
            {batch.qualityGrade && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>₹{PRICE_PER_KG[batch.qualityGrade]}/kg</span>
              </div>
            )}
          </div>
        )}

        {showQR && batch.qrMapping && (
          <div className="flex flex-col items-center gap-3 pt-4 border-t border-border">
            <QRCodeSVG 
              value={`${window.location.origin}/scan/${batch.batchId}`}
              size={120}
              level="M"
              includeMargin
              className="rounded-lg"
            />
            <Link to={`/scan/${batch.batchId}`}>
              <Button variant="outline" size="sm">
                View Public Page
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
