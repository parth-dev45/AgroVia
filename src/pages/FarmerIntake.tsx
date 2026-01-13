import { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { getAllFarmers, addBatch, addFarmer } from '@/lib/mockData';
import { generateBatchId, generateQRId, calculateExpiryDate, calculateRemainingDays, determineFreshnessStatus, isSaleAllowed } from '@/lib/freshness';
import { Farmer, BatchWithDetails, StorageType, QualityGrade, PRODUCTS, getProductById } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Leaf, Plus, CheckCircle2, Search } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router-dom';

export default function FarmerIntake() {
  const { toast } = useToast();
  const farmers = getAllFarmers();
  
  const [formData, setFormData] = useState({
    farmerId: '',
    productId: '',
    quantity: '',
    storageType: 'Normal' as StorageType,
  });
  
  const [newFarmerName, setNewFarmerName] = useState('');
  const [showNewFarmer, setShowNewFarmer] = useState(false);
  const [createdBatch, setCreatedBatch] = useState<BatchWithDetails | null>(null);
  const [productSearch, setProductSearch] = useState('');

  const selectedProduct = useMemo(() => 
    getProductById(formData.productId), 
    [formData.productId]
  );

  const filteredProducts = useMemo(() => {
    if (!productSearch) return PRODUCTS;
    return PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [productSearch]);

  const productsByCategory = useMemo(() => {
    const categories: Record<string, typeof PRODUCTS> = {};
    filteredProducts.forEach(product => {
      if (!categories[product.category]) {
        categories[product.category] = [];
      }
      categories[product.category].push(product);
    });
    return categories;
  }, [filteredProducts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.farmerId || !formData.quantity || !formData.productId) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const batchId = generateBatchId();
    const harvestDate = new Date();
    const product = getProductById(formData.productId);
    
    // Default to grade B until quality testing (will be updated in quality page)
    const defaultGrade: QualityGrade = 'B';
    const expiryDate = calculateExpiryDate(harvestDate, defaultGrade, formData.storageType, formData.productId);
    const remainingDays = calculateRemainingDays(expiryDate);
    const status = determineFreshnessStatus(remainingDays);

    const batch: BatchWithDetails = {
      batchId,
      cropType: formData.productId, // Store productId, not name
      harvestDate,
      farmerId: formData.farmerId,
      quantity: parseInt(formData.quantity),
      qualityGrade: null, // Will be set after quality testing
      createdAt: new Date(),
      farmer: farmers.find(f => f.farmerId === formData.farmerId),
      storage: {
        batchId,
        storageType: formData.storageType,
        entryDate: new Date(),
        expectedShelfLife: expiryDate.getTime() - harvestDate.getTime(),
        expiryDate,
      },
      retailStatus: {
        batchId,
        sellByDate: expiryDate,
        remainingDays,
        status,
        saleAllowed: isSaleAllowed(status),
      },
      qrMapping: {
        qrId: generateQRId(),
        batchId,
        publicUrl: `/scan/${batchId}`,
      },
    };

    addBatch(batch);
    setCreatedBatch(batch);
    
    toast({
      title: 'Batch Created Successfully!',
      description: `Batch ID: ${batchId}`,
    });
  };

  const handleAddFarmer = () => {
    if (!newFarmerName.trim()) return;
    
    const farmerId = `F${(farmers.length + 1).toString().padStart(3, '0')}`;
    const farmerCode = `FRM-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    
    const newFarmer: Farmer = {
      farmerId,
      farmerCode,
      name: newFarmerName.trim(),
    };
    
    addFarmer(newFarmer);
    setFormData({ ...formData, farmerId });
    setNewFarmerName('');
    setShowNewFarmer(false);
    
    toast({
      title: 'Farmer Added',
      description: `${newFarmerName} has been registered.`,
    });
  };

  const resetForm = () => {
    setFormData({ farmerId: '', productId: '', quantity: '', storageType: 'Normal' });
    setCreatedBatch(null);
  };

  if (createdBatch) {
    const product = getProductById(createdBatch.cropType) || 
      { id: createdBatch.cropType, name: createdBatch.cropType, emoji: '', category: 'Vegetable' as const, unit: 'kg' };
    
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-fresh">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-fresh/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-fresh" />
              </div>
              <CardTitle className="text-2xl">Batch Created Successfully!</CardTitle>
              <CardDescription>
                The batch has been registered and is ready for quality testing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Batch ID</p>
                <p className="text-2xl font-mono font-bold">{createdBatch.batchId}</p>
              </div>

              <div className="flex justify-center">
                <QRCodeSVG 
                  value={`${window.location.origin}/scan/${createdBatch.batchId}`}
                  size={160}
                  level="M"
                  includeMargin
                  className="rounded-lg border border-border p-2 bg-card"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-muted-foreground">Product</p>
                  <p className="font-medium">{product.name}</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-muted-foreground">Quantity</p>
                  <p className="font-medium">{createdBatch.quantity} {product.unit}</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-muted-foreground">Storage Type</p>
                  <p className="font-medium">{createdBatch.storage?.storageType}</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium text-warning">Pending Quality Test</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={resetForm} variant="outline" className="flex-1">
                  Register Another Batch
                </Button>
                <Link to="/quality" className="flex-1">
                  <Button className="w-full">
                    Proceed to Quality Testing
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Farmer Intake</h1>
          <p className="text-muted-foreground mt-1">
            Register new harvests and generate batch tracking
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>New Harvest Registration</CardTitle>
                <CardDescription>
                  Enter harvest details to create a new batch
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Selection */}
              <div className="space-y-2">
                <Label htmlFor="product">Product Type *</Label>
                <Select 
                  value={formData.productId} 
                  onValueChange={(value) => setFormData({ ...formData, productId: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a product">
                      {selectedProduct && (
                        <span className="flex items-center gap-2">
                          <span>{selectedProduct.name}</span>
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <div className="px-2 py-2 sticky top-0 bg-popover">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search products..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    {Object.entries(productsByCategory).map(([category, products]) => (
                      <SelectGroup key={category}>
                        <SelectLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {category}
                        </SelectLabel>
                        {products.map((product) => (
                          <SelectItem 
                            key={product.id} 
                            value={product.id}
                            className="cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <span>{product.name}</span>
                              <span className="text-xs text-muted-foreground ml-auto">
                                per {product.unit}
                              </span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProduct && (
                  <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg mt-2">
                    <div className="h-8 w-8 bg-primary/10 rounded flex items-center justify-center">
                      <Leaf className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium">{selectedProduct.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {selectedProduct.category}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Farmer Selection */}
              <div className="space-y-2">
                <Label htmlFor="farmer">Farmer *</Label>
                {!showNewFarmer ? (
                  <div className="flex gap-2">
                    <Select 
                      value={formData.farmerId} 
                      onValueChange={(value) => setFormData({ ...formData, farmerId: value })}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a farmer" />
                      </SelectTrigger>
                      <SelectContent>
                        {farmers.map((farmer) => (
                          <SelectItem key={farmer.farmerId} value={farmer.farmerId}>
                            {farmer.name} ({farmer.farmerCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowNewFarmer(true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter farmer name"
                      value={newFarmerName}
                      onChange={(e) => setNewFarmerName(e.target.value)}
                    />
                    <Button type="button" onClick={handleAddFarmer}>Add</Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowNewFarmer(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity">
                  Quantity ({selectedProduct?.unit || 'kg'}) *
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  step="0.1"
                  placeholder={`Enter quantity in ${selectedProduct?.unit || 'kg'}`}
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>

              {/* Storage Type */}
              <div className="space-y-2">
                <Label htmlFor="storage">Storage Type</Label>
                <Select 
                  value={formData.storageType} 
                  onValueChange={(value: StorageType) => setFormData({ ...formData, storageType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal">Normal Storage</SelectItem>
                    <SelectItem value="Cold">Cold Storage (+40% shelf life)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Cold storage extends shelf life significantly
                </p>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={!formData.productId}>
                Register Harvest & Generate Batch ID
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
