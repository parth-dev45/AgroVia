import { useState, useRef, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { getAllBatches, getBatchById } from '@/lib/mockData';
import {
  Order,
  Bill,
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
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  Receipt,
  Plus,
  Trash2,
  Printer,
  Package,
  Search,
  Leaf,
  CreditCard,
  ArrowRight,
  Store
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import JsBarcode from 'jsbarcode';

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
            body { font-family: 'Courier New', Courier, monospace; margin: 20px; max-width: 400px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; }
            .info { margin: 15px 0; font-size: 14px; }
            table { width: 100%; margin: 15px 0; font-size: 14px; }
            th { text-align: left; border-bottom: 1px solid #000; }
            td { padding: 4px 0; }
            .total { font-size: 18px; font-weight: bold; text-align: right; margin: 20px 0; border-top: 2px dashed #000; padding-top: 10px; }
            .barcode { text-align: center; margin: 30px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">AGROVIA</div>
            <div>Premium Fresh Produce</div>
            <div>Retail Partner: RET-001</div>
          </div>
          <div class="info">
            <div><strong>Bill ID:</strong> ${generatedBill.billId}</div>
            <div><strong>Date:</strong> ${format(generatedBill.createdAt, 'PPpp')}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th style="text-align:right">Amt</th>
              </tr>
            </thead>
            <tbody>
              ${generatedBill.items.map(item => `
                <tr>
                  <td>
                    ${item.productName}<br/>
                    <small>Batch ${item.batchId} (Gr ${item.grade})</small>
                  </td>
                  <td>${item.quantity}kg x ${item.pricePerKg}</td>
                  <td style="text-align:right">${item.amount}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">TOTAL: Rs.${generatedBill.totalAmount}</div>
          <div class="barcode">
            <svg id="barcode"></svg>
          </div>
          <div class="footer">
            <p>Scan for Quality Verification</p>
            <p><strong>agrovia.app</strong></p>
            <p>Thank you for shopping fresh!</p>
          </div>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <script>
            JsBarcode("#barcode", "${generatedBill.uniqueCode}", { format: "CODE128", width: 1.5, height: 40, displayValue: true });
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
      <div className="space-y-6 animate-in fade-in duration-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Retailer Portal</h1>
              <p className="text-muted-foreground">POS & Order Management</p>
            </div>
          </div>

          <div className="bg-secondary/50 px-4 py-2 rounded-xl flex items-center gap-3 border border-border/50">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-fresh animate-pulse" />
              <span className="text-sm font-medium">System Online</span>
            </div>
            <span className="text-border/50">|</span>
            <span className="text-sm text-muted-foreground font-mono">{format(new Date(), 'HH:mm')}</span>
          </div>
        </div>

        <Tabs defaultValue="billing" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-secondary/50 p-1 rounded-xl">
            <TabsTrigger value="billing" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Receipt className="h-4 w-4" />
              Customer Billing (POS)
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <ShoppingCart className="h-4 w-4" />
              Inventory Procurement
            </TabsTrigger>
          </TabsList>

          {/* Billing Tab (POS) */}
          <TabsContent value="billing" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
            {!generatedBill ? (
              <div className="grid gap-6 lg:grid-cols-3 h-[600px]">
                {/* Left: Product Entry */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="glass-card shadow-lg border-primary/20">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        Add Items
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-3 space-y-2">
                          <Label>Scan Batch ID / Select Product</Label>
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Scan Barcode or Type Code..."
                              value={billBatchId}
                              onChange={(e) => setBillBatchId(e.target.value.toUpperCase())}
                              className="pl-9 h-12 text-lg font-mono tracking-wide"
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Quantity (kg)</Label>
                          <Input
                            type="number"
                            value={billQuantity}
                            onChange={(e) => setBillQuantity(e.target.value)}
                            className="h-12 text-lg"
                          />
                        </div>
                      </div>
                      <Button onClick={handleAddToBill} className="w-full h-12 text-lg shadow-lg shadow-primary/10">
                        <Plus className="h-5 w-5 mr-2" /> Add to Cart
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Quick Keypad (Visual Only) */}
                  <div className="grid grid-cols-3 gap-3">
                    {PRODUCTS.map(product => {
                      const available = batches
                        .filter(b => b.cropType === product.id && b.retailStatus?.saleAllowed)
                        .reduce((sum, b) => sum + getAvailableQuantity(b.batchId, b.quantity), 0);

                      return (
                        <button
                          key={product.id}
                          className={cn(
                            "p-4 rounded-xl border flex flex-col items-center gap-2 transition-all hover:scale-105 active:scale-95 bg-white shadow-sm",
                            available > 0 ? "border-border" : "opacity-50 border-dashed"
                          )}
                          onClick={() => toast.info(`Please scan a specific batch of ${product.name}`)}
                        >
                          <span className="text-2xl">{product.emoji}</span>
                          <span className="font-medium text-sm">{product.name}</span>
                          <span className={cn("text-xs font-bold", available > 0 ? "text-fresh" : "text-destructive")}>
                            {available > 0 ? `${available}kg` : 'Out of Stock'}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Right: Cart & Totals */}
                <Card className="flex flex-col h-full shadow-xl border-2">
                  <CardHeader className="bg-secondary/30 pb-4 border-b">
                    <CardTitle className="flex justify-between items-center">
                      <span>Current Bill</span>
                      <Badge variant="outline" className="font-mono">{billItems.length} items</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-0">
                    {billItems.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-2">
                        <ShoppingCart className="h-12 w-12" />
                        <p>Cart is empty</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {billItems.map((item, index) => (
                          <div key={index} className="p-4 flex justify-between items-start group hover:bg-secondary/20 transition-colors">
                            <div>
                              <p className="font-medium">{item.productName} <span className="text-xs font-normal text-muted-foreground">({item.grade})</span></p>
                              <p className="text-xs font-mono text-muted-foreground">{item.batchId}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">Rs.{item.quantity * item.pricePerKg}</p>
                              <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                                <span>{item.quantity}kg x {item.pricePerKg}</span>
                                <button onClick={() => handleRemoveFromBill(index)} className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <div className="p-4 bg-secondary/50 border-t space-y-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total to Pay</span>
                      <span className="text-2xl text-primary">Rs.{calculateTotal()}</span>
                    </div>
                    <Button
                      onClick={handleGenerateBill}
                      className="w-full h-14 text-lg font-bold shadow-xl rounded-xl"
                      size="lg"
                      disabled={billItems.length === 0}
                    >
                      <CreditCard className="mr-2 h-5 w-5" /> Checkout
                    </Button>
                  </div>
                </Card>
              </div>
            ) : (
              /* Generated Bill View */
              <div className="flex justify-center py-8 animate-in zoom-in-95 duration-300">
                <Card className="w-full max-w-md shadow-2xl border-2">
                  <div className="bg-primary h-2 w-full" />
                  <CardHeader className="text-center pb-2">
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 text-primary">
                      <Store className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl uppercase tracking-widest">AgroVia</CardTitle>
                    <CardDescription>Official Receipt</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 px-8 pb-8">
                    <div className="border-y border-dashed py-4 space-y-1 text-sm text-center">
                      <p>Bill ID: <span className="font-mono font-bold">{generatedBill.billId}</span></p>
                      <p className="text-muted-foreground">{format(generatedBill.createdAt, 'PPpp')}</p>
                    </div>

                    <div className="space-y-2 text-sm">
                      {generatedBill.items.map((item, i) => (
                        <div key={i} className="flex justify-between">
                          <span>{item.productName} <span className="text-muted-foreground text-xs">x{item.quantity}</span></span>
                          <span className="font-medium">Rs.{item.amount}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-dashed pt-4 flex justify-between items-end">
                      <span className="text-sm font-bold uppercase text-muted-foreground">Total</span>
                      <span className="text-2xl font-black">Rs.{generatedBill.totalAmount}</span>
                    </div>

                    <div className="bg-secondary/50 p-4 rounded-xl text-center space-y-2">
                      <svg ref={barcodeRef} className="w-full h-12" />
                      <p className="font-mono font-bold tracking-[0.2em] text-lg">{generatedBill.uniqueCode}</p>
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={handlePrintBill} variant="outline" className="flex-1">
                        <Printer className="mr-2 h-4 w-4" /> Print
                      </Button>
                      <Button onClick={handleNewBill} className="flex-1">
                        <Plus className="mr-2 h-4 w-4" /> New Customer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Procurement Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Place Warehouse Order</CardTitle>
                  <CardDescription>Restock your inventory</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Product Batch</Label>
                    <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                      <SelectTrigger className="h-12 bg-white/50">
                        <SelectValue placeholder="Choose available stock..." />
                      </SelectTrigger>
                      <SelectContent>
                        {batches.map(batch => {
                          const product = getProductById(batch.cropType);
                          const available = getAvailableQuantity(batch.batchId, batch.quantity);
                          if (available <= 0) return null;
                          return (
                            <SelectItem key={batch.batchId} value={batch.batchId}>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{product?.emoji}</span>
                                <span>{product?.name}</span>
                                <Badge variant="outline" className="ml-2 font-mono text-xs">{batch.batchId}</Badge>
                                <span className="text-muted-foreground text-xs ml-2">Grade {batch.qualityGrade} • {available}kg left</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity Needed (kg)</Label>
                    <Input
                      type="number"
                      value={orderQuantity}
                      onChange={(e) => setOrderQuantity(e.target.value)}
                      className="h-12 bg-white/50"
                    />
                  </div>
                  <Button onClick={handleAddToOrder} className="w-full h-12 text-lg">
                    <Package className="mr-2 h-5 w-5" /> Submit Order
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader className="px-0">
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                  <div className="space-y-3">
                    {orders.slice(-5).reverse().map(order => (
                      <div key={order.orderId} className="bg-white/60 border p-4 rounded-xl flex items-center justify-between shadow-sm">
                        <div>
                          <p className="font-mono font-bold text-sm">{order.orderId}</p>
                          <div className="text-xs text-muted-foreground mt-1">
                            <span className="font-medium text-foreground">{order.quantity}kg</span> from {order.batchId}
                          </div>
                        </div>
                        <Badge variant={order.status === 'Fulfilled' ? 'default' : 'secondary'} className={order.status === 'Fulfilled' ? 'bg-fresh hover:bg-fresh/90' : ''}>
                          {order.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
