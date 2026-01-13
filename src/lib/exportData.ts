import { BatchWithDetails } from './types';
import { format } from 'date-fns';

export function exportBatchesToCSV(batches: BatchWithDetails[]): void {
  const headers = [
    'Batch ID',
    'Crop Type',
    'Harvest Date',
    'Farmer ID',
    'Quantity (kg)',
    'Quality Grade',
    'Storage Type',
    'Expiry Date',
    'Remaining Days',
    'Status',
    'Sale Allowed'
  ];

  const rows = batches.map(batch => [
    batch.batchId,
    batch.cropType,
    format(new Date(batch.harvestDate), 'yyyy-MM-dd'),
    batch.farmerId,
    batch.quantity,
    batch.qualityGrade || 'N/A',
    batch.storage?.storageType || 'N/A',
    batch.storage ? format(new Date(batch.storage.expiryDate), 'yyyy-MM-dd') : 'N/A',
    batch.retailStatus?.remainingDays ?? 'N/A',
    batch.retailStatus?.status || 'N/A',
    batch.retailStatus?.saleAllowed ? 'Yes' : 'No'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `agrovia_batches_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportOrdersToCSV(orders: any[]): void {
  const headers = ['Order ID', 'Date', 'Batch ID', 'Quantity', 'Status'];
  
  const rows = orders.map(order => [
    order.orderId,
    format(new Date(order.orderDate), 'yyyy-MM-dd HH:mm'),
    order.batchId,
    order.quantity,
    order.status
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `agrovia_orders_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
