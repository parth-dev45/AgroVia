import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { BatchWithDetails, getProductById } from '@/lib/types';
import { format } from 'date-fns';
import { useRef } from 'react';

interface PrintLabelProps {
  batch: BatchWithDetails;
}

export function PrintLabel({ batch }: PrintLabelProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const product = getProductById(batch.cropType);
  const productName = product?.name || batch.cropType;
  const productUnit = product?.unit || 'kg';

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Batch Label - ${batch.batchId}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .label { border: 2px solid #000; padding: 16px; max-width: 300px; }
            .header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 8px; margin-bottom: 8px; }
            .product-name { font-size: 18px; font-weight: bold; text-align: center; margin: 8px 0; }
            .qr { text-align: center; margin: 12px 0; }
            .info { font-size: 12px; }
            .info-row { display: flex; justify-content: space-between; margin: 4px 0; }
            .grade { font-size: 24px; font-weight: bold; text-align: center; margin: 8px 0; }
            .batch-id { font-family: monospace; font-size: 14px; text-align: center; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div>
      <Button onClick={handlePrint} variant="outline" size="sm" className="gap-2 w-full">
        <Printer className="h-4 w-4" />
        Print Label
      </Button>

      <div ref={printRef} className="hidden">
        <div className="label">
          <div className="header">
            <strong>Agrovia</strong>
          </div>
          <div className="product-name">{productName}</div>
          <div className="qr">
            <QRCodeSVG
              value={`${window.location.origin}/scan/${batch.batchId}`}
              size={120}
            />
          </div>
          <div className="batch-id">{batch.batchId}</div>
          <div className="grade">Grade {batch.qualityGrade}</div>
          <div className="info">
            <div className="info-row">
              <span>Product:</span>
              <span>{productName}</span>
            </div>
            <div className="info-row">
              <span>Harvest Date:</span>
              <span>{format(new Date(batch.harvestDate), 'MMM d, yyyy')}</span>
            </div>
            <div className="info-row">
              <span>Quantity:</span>
              <span>{batch.quantity} {productUnit}</span>
            </div>
            <div className="info-row">
              <span>Storage:</span>
              <span>{batch.storage?.storageType}</span>
            </div>
            <div className="info-row">
              <span>Sell By:</span>
              <span>{batch.retailStatus && format(new Date(batch.retailStatus.sellByDate), 'MMM d, yyyy')}</span>
            </div>
            {batch.farmer && (
              <div className="info-row">
                <span>Farmer:</span>
                <span>{batch.farmer.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
