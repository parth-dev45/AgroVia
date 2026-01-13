import { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAllBatches, getAllFarmers, getAnalytics } from '@/lib/mockData';
import { getAllBills, getAllOrders } from '@/lib/orderData';
import { getProductById, PRODUCTS, getProductPrice, QualityGrade } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar as CalendarIcon,
  TrendingDown,
  Users,
  DollarSign,
  Package,
  FileDown,
  Leaf,
  Award,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type DateRange = {
  from: Date;
  to: Date;
};

export default function Reports() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [quickRange, setQuickRange] = useState('30');

  const batches = getAllBatches();
  const farmers = getAllFarmers();
  const bills = getAllBills();
  const orders = getAllOrders();
  const analytics = getAnalytics();

  // Filter batches by date range
  const filteredBatches = useMemo(() => {
    return batches.filter(batch => 
      isWithinInterval(new Date(batch.harvestDate), {
        start: startOfDay(dateRange.from),
        end: endOfDay(dateRange.to)
      })
    );
  }, [batches, dateRange]);

  // Filter bills by date range
  const filteredBills = useMemo(() => {
    return bills.filter(bill => 
      isWithinInterval(new Date(bill.createdAt), {
        start: startOfDay(dateRange.from),
        end: endOfDay(dateRange.to)
      })
    );
  }, [bills, dateRange]);

  // Quick range handler
  const handleQuickRange = (days: string) => {
    setQuickRange(days);
    const daysNum = parseInt(days);
    setDateRange({
      from: subDays(new Date(), daysNum),
      to: new Date()
    });
  };

  // Waste Reduction Metrics
  const wasteMetrics = useMemo(() => {
    const expired = filteredBatches.filter(b => b.retailStatus?.status === 'Expired');
    const consumeSoon = filteredBatches.filter(b => b.retailStatus?.status === 'Consume Soon');
    const fresh = filteredBatches.filter(b => b.retailStatus?.status === 'Fresh');
    
    const expiredQty = expired.reduce((sum, b) => sum + b.quantity, 0);
    const totalQty = filteredBatches.reduce((sum, b) => sum + b.quantity, 0);
    const wasteRate = totalQty > 0 ? ((expiredQty / totalQty) * 100).toFixed(1) : '0';
    
    // Estimate waste prevented (items sold before expiry through early warning)
    const wastePrevented = consumeSoon.reduce((sum, b) => sum + Math.round(b.quantity * 0.3), 0);
    
    return {
      totalBatches: filteredBatches.length,
      expiredBatches: expired.length,
      expiredQuantity: expiredQty,
      wasteRate,
      wastePrevented,
      freshBatches: fresh.length,
      consumeSoonBatches: consumeSoon.length
    };
  }, [filteredBatches]);

  // Farmer Performance
  const farmerPerformance = useMemo(() => {
    return farmers.map(farmer => {
      const farmerBatches = filteredBatches.filter(b => b.farmerId === farmer.farmerId);
      const gradeA = farmerBatches.filter(b => b.qualityGrade === 'A').length;
      const gradeB = farmerBatches.filter(b => b.qualityGrade === 'B').length;
      const gradeC = farmerBatches.filter(b => b.qualityGrade === 'C').length;
      const totalQty = farmerBatches.reduce((sum, b) => sum + b.quantity, 0);
      
      // Calculate revenue
      const revenue = farmerBatches.reduce((sum, b) => {
        if (!b.qualityGrade) return sum;
        const price = getProductPrice(b.cropType, b.qualityGrade as QualityGrade);
        return sum + (b.quantity * price);
      }, 0);
      
      // Quality score (weighted average)
      const qualityScore = farmerBatches.length > 0 
        ? Math.round(((gradeA * 100) + (gradeB * 70) + (gradeC * 40)) / farmerBatches.length)
        : 0;
      
      return {
        ...farmer,
        totalBatches: farmerBatches.length,
        gradeA,
        gradeB,
        gradeC,
        totalQuantity: totalQty,
        revenue,
        qualityScore
      };
    }).sort((a, b) => b.qualityScore - a.qualityScore);
  }, [farmers, filteredBatches]);

  // Revenue by Product
  const revenueByProduct = useMemo(() => {
    const productRevenue: Record<string, { revenue: number; quantity: number; gradeA: number; gradeB: number; gradeC: number }> = {};
    
    filteredBatches.forEach(batch => {
      if (!batch.qualityGrade) return;
      const product = getProductById(batch.cropType);
      if (!product) return;
      
      const price = getProductPrice(batch.cropType, batch.qualityGrade as QualityGrade);
      const revenue = batch.quantity * price;
      
      if (!productRevenue[product.name]) {
        productRevenue[product.name] = { revenue: 0, quantity: 0, gradeA: 0, gradeB: 0, gradeC: 0 };
      }
      
      productRevenue[product.name].revenue += revenue;
      productRevenue[product.name].quantity += batch.quantity;
      productRevenue[product.name][`grade${batch.qualityGrade}` as 'gradeA' | 'gradeB' | 'gradeC']++;
    });
    
    return Object.entries(productRevenue)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredBatches]);

  // Revenue by Grade
  const revenueByGrade = useMemo(() => {
    const gradeData: Record<QualityGrade, number> = { A: 0, B: 0, C: 0 };
    
    filteredBatches.forEach(batch => {
      if (!batch.qualityGrade) return;
      const price = getProductPrice(batch.cropType, batch.qualityGrade as QualityGrade);
      gradeData[batch.qualityGrade as QualityGrade] += batch.quantity * price;
    });
    
    return [
      { name: 'Grade A (Premium)', value: gradeData.A, color: 'hsl(142, 70%, 45%)' },
      { name: 'Grade B (Standard)', value: gradeData.B, color: 'hsl(35, 90%, 55%)' },
      { name: 'Grade C (Economy)', value: gradeData.C, color: 'hsl(0, 72%, 50%)' },
    ];
  }, [filteredBatches]);

  // Daily trend data
  const dailyTrend = useMemo(() => {
    const days = Math.min(parseInt(quickRange), 14);
    const trend = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayBatches = batches.filter(b => 
        format(new Date(b.harvestDate), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      const dayBills = bills.filter(b => 
        format(new Date(b.createdAt), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      
      trend.push({
        date: format(date, 'MMM d'),
        batches: dayBatches.length,
        quantity: dayBatches.reduce((sum, b) => sum + b.quantity, 0),
        revenue: dayBills.reduce((sum, b) => sum + b.totalAmount, 0)
      });
    }
    
    return trend;
  }, [batches, bills, quickRange]);

  // Total revenue
  const totalRevenue = useMemo(() => {
    return filteredBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  }, [filteredBills]);

  // Status distribution for pie chart
  const statusData = [
    { name: 'Fresh', value: wasteMetrics.freshBatches, color: 'hsl(142, 70%, 45%)' },
    { name: 'Consume Soon', value: wasteMetrics.consumeSoonBatches, color: 'hsl(35, 90%, 55%)' },
    { name: 'Expired', value: wasteMetrics.expiredBatches, color: 'hsl(0, 72%, 50%)' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Detailed insights into waste reduction, farmer performance, and revenue
            </p>
          </div>
          
          {/* Date Range Filter */}
          <div className="flex items-center gap-2">
            <Select value={quickRange} onValueChange={handleQuickRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange({ from: range.from, to: range.to });
                      setQuickRange('custom');
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Tabs defaultValue="waste" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="waste" className="gap-2">
              <TrendingDown className="h-4 w-4" />
              Waste Reduction
            </TabsTrigger>
            <TabsTrigger value="farmers" className="gap-2">
              <Users className="h-4 w-4" />
              Farmer Performance
            </TabsTrigger>
            <TabsTrigger value="revenue" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Revenue Analytics
            </TabsTrigger>
          </TabsList>

          {/* Waste Reduction Tab */}
          <TabsContent value="waste" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Batches
                  </CardTitle>
                  <Package className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{wasteMetrics.totalBatches}</div>
                  <p className="text-xs text-muted-foreground mt-1">In selected period</p>
                </CardContent>
              </Card>
              
              <Card className="border-expired/30 bg-expired/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Waste Rate
                  </CardTitle>
                  <TrendingDown className="h-5 w-5 text-expired" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-expired">{wasteMetrics.wasteRate}%</div>
                  <p className="text-xs text-muted-foreground mt-1">{wasteMetrics.expiredQuantity} kg expired</p>
                </CardContent>
              </Card>
              
              <Card className="border-fresh/30 bg-fresh/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Waste Prevented
                  </CardTitle>
                  <Leaf className="h-5 w-5 text-fresh" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-fresh">{wasteMetrics.wastePrevented} kg</div>
                  <p className="text-xs text-muted-foreground mt-1">Early warning saves</p>
                </CardContent>
              </Card>
              
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Fresh Batches
                  </CardTitle>
                  <Package className="h-5 w-5 text-fresh" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-fresh">{wasteMetrics.freshBatches}</div>
                  <p className="text-xs text-muted-foreground mt-1">Ready for sale</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Freshness Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Daily Harvest Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailyTrend}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" className="text-muted-foreground" fontSize={12} />
                        <YAxis className="text-muted-foreground" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 'var(--radius)'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="quantity" 
                          stroke="hsl(var(--primary))" 
                          fill="hsl(var(--primary) / 0.2)"
                          name="Quantity (kg)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Farmer Performance Tab */}
          <TabsContent value="farmers" className="space-y-6">
            {/* Top Farmers */}
            <div className="grid gap-4 md:grid-cols-3">
              {farmerPerformance.slice(0, 3).map((farmer, index) => (
                <Card key={farmer.farmerId} className={cn(
                  index === 0 && "border-yellow-500/50 bg-yellow-500/5"
                )}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {index === 0 && <Award className="h-5 w-5 text-yellow-500" />}
                        #{index + 1} {farmer.name}
                      </CardTitle>
                      <span className="text-2xl font-bold text-primary">{farmer.qualityScore}%</span>
                    </div>
                    <CardDescription>Quality Score</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Batches</span>
                        <span className="font-medium">{farmer.totalBatches}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Quantity</span>
                        <span className="font-medium">{farmer.totalQuantity} kg</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Revenue Generated</span>
                        <span className="font-medium text-fresh">Rs.{farmer.revenue.toLocaleString()}</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <span className="px-2 py-1 bg-fresh/10 text-fresh text-xs rounded-full">
                          A: {farmer.gradeA}
                        </span>
                        <span className="px-2 py-1 bg-warning/10 text-warning text-xs rounded-full">
                          B: {farmer.gradeB}
                        </span>
                        <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                          C: {farmer.gradeC}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Farmer Comparison Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Farmer Quality Comparison</CardTitle>
                <CardDescription>Grade distribution by farmer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={farmerPerformance}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" className="text-muted-foreground" fontSize={12} />
                      <YAxis className="text-muted-foreground" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 'var(--radius)'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="gradeA" name="Grade A" fill="hsl(142, 70%, 45%)" stackId="a" />
                      <Bar dataKey="gradeB" name="Grade B" fill="hsl(35, 90%, 55%)" stackId="a" />
                      <Bar dataKey="gradeC" name="Grade C" fill="hsl(0, 72%, 50%)" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Full Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle>Complete Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {farmerPerformance.map((farmer, index) => (
                    <div 
                      key={farmer.farmerId} 
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                          index === 0 ? "bg-yellow-500 text-yellow-950" :
                          index === 1 ? "bg-gray-400 text-gray-950" :
                          index === 2 ? "bg-amber-600 text-amber-950" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{farmer.name}</p>
                          <p className="text-xs text-muted-foreground">{farmer.farmerCode}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{farmer.qualityScore}%</p>
                        <p className="text-xs text-muted-foreground">{farmer.totalBatches} batches</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            {/* Revenue Summary */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-primary text-primary-foreground">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">Rs.{totalRevenue.toLocaleString()}</div>
                  <p className="text-sm opacity-90 mt-2">
                    From {filteredBills.length} bills in selected period
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg Bill Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    Rs.{filteredBills.length > 0 ? Math.round(totalRevenue / filteredBills.length).toLocaleString() : 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{orders.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Warehouse orders placed</p>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Grade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={revenueByGrade}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `Rs.${value.toLocaleString()}`}
                        >
                          {revenueByGrade.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `Rs.${value.toLocaleString()}`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Daily Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyTrend}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" className="text-muted-foreground" fontSize={12} />
                        <YAxis className="text-muted-foreground" fontSize={12} />
                        <Tooltip 
                          formatter={(value: number) => `Rs.${value.toLocaleString()}`}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 'var(--radius)'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--primary))' }}
                          name="Revenue"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue by Product */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Product</CardTitle>
                <CardDescription>Top performing products by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueByProduct.slice(0, 8)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" className="text-muted-foreground" fontSize={12} />
                      <YAxis dataKey="name" type="category" className="text-muted-foreground" fontSize={12} width={80} />
                      <Tooltip 
                        formatter={(value: number) => `Rs.${value.toLocaleString()}`}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 'var(--radius)'
                        }}
                      />
                      <Bar 
                        dataKey="revenue" 
                        fill="hsl(var(--primary))" 
                        radius={[0, 4, 4, 0]}
                        name="Revenue"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Product Details Table */}
            <Card>
              <CardHeader>
                <CardTitle>Product Performance Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 font-medium">Product</th>
                        <th className="text-right py-3 font-medium">Quantity</th>
                        <th className="text-center py-3 font-medium">Grade A</th>
                        <th className="text-center py-3 font-medium">Grade B</th>
                        <th className="text-center py-3 font-medium">Grade C</th>
                        <th className="text-right py-3 font-medium">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueByProduct.map((product, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-3 font-medium">{product.name}</td>
                          <td className="text-right py-3">{product.quantity} kg</td>
                          <td className="text-center py-3">
                            <span className="px-2 py-1 bg-fresh/10 text-fresh rounded-full text-xs">
                              {product.gradeA}
                            </span>
                          </td>
                          <td className="text-center py-3">
                            <span className="px-2 py-1 bg-warning/10 text-warning rounded-full text-xs">
                              {product.gradeB}
                            </span>
                          </td>
                          <td className="text-center py-3">
                            <span className="px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs">
                              {product.gradeC}
                            </span>
                          </td>
                          <td className="text-right py-3 font-semibold text-primary">
                            Rs.{product.revenue.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}