import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { getAllBatches, getBatchById } from '@/lib/mockData';
import { 
  Order, 
  Bill, 
  BillItem, 
  getAllOrders, 
  addOrder, 
  addBill, 
  generateOrderId, 
  generateBillId, 
  generateUniqueCode,
  getAvailableQuantity,
  reduceInventory
} from '@/lib/orderData';
import { PRODUCTS, getProductById, getProductPrice, QualityGrade } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { 
  Store, 
  ShoppingCart, 
  Receipt, 
  Plus, 
  Trash2, 
  Printer,
  Package,
  Search,
  Leaf
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QRCodeSVG } from 'qrcode.react';
import JsBarcode from 'jsbarcode';
import { useRef, useEffect } from 'react';

interface CartItem {
  batchId: string;
  productName: string;
  quantity: number;
  grade: string;
  pricePerKg: number;
}

export default function RetailerDashboard() {
  const batches = getAllBatches().filter(b => b.qualityGrade !== null && b.retailStatus?.saleAllowed);
  const [orders, setOrders] = useState<Order[]>(getAllOrders());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [orderQuantity, setOrderQuantity] = useState('');
  const [billItems, setBillItems] = useState<CartItem[]>([]);
  const [generatedBill, setGeneratedBill] = useState<Bill | null>(null);
  const [billQuantity, setBillQuantity] = useState('');
  const [billBatchId, setBillBatchId] = useState('');
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (generatedBill && barcodeRef.current) {
      JsBarcode(barcodeRef.current, generatedBill.uniqueCode, {
        format: 'CODE128',
        width: 2,
        height: 50,
        displayValue: true
      });
    }
  }, [generatedBill]);

  const handleAddToOrder = () => {
    if (!selectedBatch || !orderQuantity) {
      toast.error('Please select a batch and quantity');
      return;
    }

    const batch = getBatchById(selectedBatch);
    if (!batch || !batch.qualityGrade) return;

    const requestedQty = parseInt(orderQuantity);
    const availableQty = getAvailableQuantity(selectedBatch, batch.quantity);
    
    if (requestedQty > availableQty) {
      toast.error(`Only ${availableQty} ${getProductById(batch.cropType)?.unit || 'kg'} available in stock`);
      return;
    }

    const order: Order = {
      orderId: generateOrderId(),
      retailerId: 'RET-001',
      batchId: selectedBatch,
      quantity: requestedQty,
      orderDate: new Date(),
      status: 'Pending'
    };

    addOrder(order);
    setOrders([...orders, order]);
    toast.success(`Order ${order.orderId} placed successfully`);
    setSelectedBatch('');
    setOrderQuantity('');
  };

  const handleAddToBill = () => {
    const batch = getBatchById(billBatchId.toUpperCase());
    if (!batch) {
      toast.error('Batch not found');
      return;
    }
    if (!batch.retailStatus?.saleAllowed) {
      toast.error('This batch is expired and cannot be sold');
      return;
    }
    if (!billQuantity || parseInt(billQuantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    const requestedQty = parseInt(billQuantity);
    const availableQty = getAvailableQuantity(batch.batchId, batch.quantity);
    
    // Check if already in bill items
    const alreadyInBill = billItems.filter(item => item.batchId === batch.batchId)
      .reduce((sum, item) => sum + item.quantity, 0);
    
    if (requestedQty > (availableQty - alreadyInBill)) {
      toast.error(`Only ${availableQty - alreadyInBill} ${getProductById(batch.cropType)?.unit || 'kg'} available`);
      return;
    }

    const product = getProductById(batch.cropType);
    const productName = product?.name || 'Produce';
    const pricePerKg = batch.qualityGrade 
      ? getProductPrice(batch.cropType, batch.qualityGrade as QualityGrade) 
      : 50;

    const newItem: CartItem = {
      batchId: batch.batchId,
      productName,
      quantity: requestedQty,
      grade: batch.qualityGrade || 'C',
      pricePerKg
    };

    setBillItems([...billItems, newItem]);
    setBillBatchId('');
    setBillQuantity('');
    toast.success('Item added to bill');
  };

  const handleRemoveFromBill = (index: number) => {
    setBillItems(billItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return billItems.reduce((sum, item) => sum + (item.quantity * item.pricePerKg), 0);
  };

  const handleGenerateBill = () => {
    if (billItems.length === 0) {
      toast.error('Add items to the bill first');
      return;
    }

    const uniqueCode = generateUniqueCode();
    const bill: Bill = {
      billId: generateBillId(),
      retailerId: 'RET-001',
      items: billItems.map(item => ({
        batchId: item.batchId,
        quantity: item.quantity,
        grade: item.grade,
        pricePerKg: item.pricePerKg,
        amount: item.quantity * item.pricePerKg,
        productName: item.productName
      })),
      totalAmount: calculateTotal(),
      createdAt: new Date(),
      uniqueCode
    };

    // Reduce inventory for each item
    billItems.forEach(item => {
      reduceInventory(item.batchId, item.quantity);
    });

    addBill(bill);
    setGeneratedBill(bill);
    setBillItems([]);
    toast.success(`Bill generated with code: ${uniqueCode}`);
  };

  const handlePrintBill = () => {
    if (!generatedBill) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Bill - ${generatedBill.billId}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .info { margin: 15px 0; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background: #f0f0f0; }
            .total { font-size: 20px; font-weight: bold; text-align: right; margin: 15px 0; }
            .barcode { text-align: center; margin: 20px 0; }
            .code { font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 4px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Agrovia</h1>
            <p>Farm-to-Fork Quality Assurance</p>
          </div>
          <div class="info">
            <p><strong>Bill ID:</strong> ${generatedBill.billId}</p>
            <p><strong>Date:</strong> ${format(generatedBill.createdAt, 'PPpp')}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Grade</th>
                <th>Qty (kg)</th>
                <th>Price/kg</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${generatedBill.items.map(item => `
                <tr>
                  <td>${item.batchId}</td>
                  <td>Grade ${item.grade}</td>
                  <td>${item.quantity}</td>
                  <td>Rs.${item.pricePerKg}</td>
                  <td>Rs.${item.amount}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">Total: Rs.${generatedBill.totalAmount}</div>
          <div class="barcode">
            <svg id="barcode"></svg>
          </div>
          <div class="code">Lookup Code: ${generatedBill.uniqueCode}</div>
          <div class="footer">
            <p>Scan the code at agrovia.app to verify product quality</p>
            <p>Thank you for choosing quality produce!</p>
          </div>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <script>
            JsBarcode("#barcode", "${generatedBill.uniqueCode}", { format: "CODE128", width: 2, height: 60 });
            window.print();
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleNewBill = () => {
    setBillItems([]);
    setGeneratedBill(null);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Retailer Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Order from warehouse and create customer bills
          </p>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Order from Warehouse
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2">
              <Receipt className="h-4 w-4" />
              Customer Billing
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            {/* Available Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5" />
                  Available Products
                </CardTitle>
                <CardDescription>
                  Browse all products available for ordering
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {PRODUCTS.map(product => {
                    const productBatches = batches.filter(b => b.cropType === product.id);
                    const totalQuantity = productBatches.reduce((sum, b) => sum + b.quantity, 0);
                    const soldQuantity = productBatches.reduce((sum, b) => sum + (b.quantity - getAvailableQuantity(b.batchId, b.quantity)), 0);
                    const availableQuantity = totalQuantity - soldQuantity;
                    return (
                      <div 
                        key={product.id} 
                        className={cn(
                          "p-3 rounded-lg border text-center transition-colors",
                          availableQuantity > 0 
                            ? "bg-fresh/5 border-fresh/20 hover:bg-fresh/10" 
                            : "bg-muted/30 border-border/50 opacity-60"
                        )}
                      >
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                        <p className={cn(
                          "text-sm font-semibold mt-1",
                          availableQuantity > 0 ? "text-fresh" : "text-muted-foreground"
                        )}>
                          {availableQuantity > 0 ? `${availableQuantity} ${product.unit}` : 'Out of stock'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* New Order */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Place New Order
                  </CardTitle>
                  <CardDescription>
                    Order produce from the warehouse
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Batch</Label>
                    <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose available batch" />
                      </SelectTrigger>
                      <SelectContent>
                        {batches.map(batch => {
                          const product = getProductById(batch.cropType);
                          const available = getAvailableQuantity(batch.batchId, batch.quantity);
                          if (available <= 0) return null;
                          return (
                            <SelectItem key={batch.batchId} value={batch.batchId}>
                              {product?.name || batch.cropType} - {batch.batchId} - Grade {batch.qualityGrade} ({available} {product?.unit || 'kg'} available)
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity (kg)</Label>
                    <Input
                      type="number"
                      placeholder="Enter quantity"
                      value={orderQuantity}
                      onChange={(e) => setOrderQuantity(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddToOrder} className="w-full">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Place Order
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {orders.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No orders yet</p>
                    ) : (
                      orders.slice(-5).reverse().map(order => (
                        <div key={order.orderId} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                          <div>
                            <p className="font-mono text-sm">{order.orderId}</p>
                            <p className="text-xs text-muted-foreground">
                              {order.batchId} - {order.quantity}kg
                            </p>
                          </div>
                          <Badge variant={order.status === 'Fulfilled' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            {!generatedBill ? (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Add Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="h-5 w-5" />
                      Create Bill
                    </CardTitle>
                    <CardDescription>
                      Add items to customer bill
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label>Batch ID</Label>
                        <Input
                          placeholder="Enter batch ID"
                          value={billBatchId}
                          onChange={(e) => setBillBatchId(e.target.value.toUpperCase())}
                          className="font-mono"
                        />
                      </div>
                      <div className="w-24">
                        <Label>Qty (kg)</Label>
                        <Input
                          type="number"
                          value={billQuantity}
                          onChange={(e) => setBillQuantity(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button onClick={handleAddToBill} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Bill
                    </Button>
                  </CardContent>
                </Card>

                {/* Bill Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Bill Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {billItems.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No items added</p>
                    ) : (
                      <div className="space-y-3">
                        {billItems.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="font-mono text-xs text-muted-foreground">{item.batchId}</p>
                              <p className="text-xs text-muted-foreground">
                                Grade {item.grade} - {item.quantity}kg x Rs.{item.pricePerKg}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold">Rs.{item.quantity * item.pricePerKg}</span>
                              <Button size="icon" variant="ghost" onClick={() => handleRemoveFromBill(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <div className="border-t pt-3 mt-3">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Total</span>
                            <span className="text-xl font-bold">Rs.{calculateTotal()}</span>
                          </div>
                        </div>
                        <Button onClick={handleGenerateBill} className="w-full mt-4" size="lg">
                          <Receipt className="h-4 w-4 mr-2" />
                          Generate Bill
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Generated Bill */
              <Card className="max-w-2xl mx-auto">
                <CardHeader className="text-center border-b">
                  <CardTitle className="text-2xl">Agrovia Bill</CardTitle>
                  <CardDescription>Bill ID: {generatedBill.billId}</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="text-sm text-muted-foreground">
                    Date: {format(generatedBill.createdAt, 'PPpp')}
                  </div>

                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Item</th>
                        <th className="text-left py-2">Grade</th>
                        <th className="text-right py-2">Qty</th>
                        <th className="text-right py-2">Rate</th>
                        <th className="text-right py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generatedBill.items.map((item, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-2">{item.productName || item.batchId}</td>
                          <td className="py-2">Grade {item.grade}</td>
                          <td className="text-right py-2">{item.quantity}kg</td>
                          <td className="text-right py-2">Rs.{item.pricePerKg}</td>
                          <td className="text-right py-2 font-medium">Rs.{item.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex justify-between items-center text-xl font-bold border-t pt-4">
                    <span>Total</span>
                    <span>Rs.{generatedBill.totalAmount}</span>
                  </div>

                  <div className="text-center space-y-2 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">Customer Lookup Code</p>
                    <svg ref={barcodeRef} className="mx-auto"></svg>
                    <p className="text-2xl font-bold font-mono tracking-widest">{generatedBill.uniqueCode}</p>
                    <p className="text-xs text-muted-foreground">
                      Enter this code at the app to check product quality
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={handlePrintBill} className="flex-1">
                      <Printer className="h-4 w-4 mr-2" />
                      Print Bill
                    </Button>
                    <Button onClick={handleNewBill} variant="outline" className="flex-1">
                      New Bill
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
