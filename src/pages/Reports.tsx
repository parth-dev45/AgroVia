import { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAllBatches, getAllFarmers, getAnalytics } from '@/lib/mockData';
import { getAllBills, getAllOrders } from '@/lib/orderData';
import { getProductById, getProductPrice, QualityGrade } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar as CalendarIcon,
  TrendingDown,
  Users,
  DollarSign,
  Package,
  Leaf,
  Award,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpRight,
  TrendingUp,
  LineChart as LineChartIcon
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

      const revenue = farmerBatches.reduce((sum, b) => {
        if (!b.qualityGrade) return sum;
        const price = getProductPrice(b.cropType, b.qualityGrade as QualityGrade);
        return sum + (b.quantity * price);
      }, 0);

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
      { name: 'Grade A', value: gradeData.A, color: '#16a34a' },
      { name: 'Grade B', value: gradeData.B, color: '#f59e0b' },
      { name: 'Grade C', value: gradeData.C, color: '#64748b' },
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

  // Status distribution
  const statusData = [
    { name: 'Fresh', value: wasteMetrics.freshBatches, color: '#16a34a' },
    { name: 'Consume Soon', value: wasteMetrics.consumeSoonBatches, color: '#f59e0b' },
    { name: 'Expired', value: wasteMetrics.expiredBatches, color: '#ef4444' },
  ];

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
              <p className="text-muted-foreground">Performance & Insights</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-secondary/50 p-1.5 rounded-xl border">
            <Select value={quickRange} onValueChange={handleQuickRange}>
              <SelectTrigger className="w-[140px] border-0 bg-transparent shadow-none focus:ring-0">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <div className="h-6 w-px bg-border mx-1" />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
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
          <TabsList className="grid w-full grid-cols-3 bg-secondary/50 p-1 rounded-xl">
            <TabsTrigger value="waste" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Leaf className="h-4 w-4" /> Waste Metrics
            </TabsTrigger>
            <TabsTrigger value="farmers" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Users className="h-4 w-4" /> Farmer Quality
            </TabsTrigger>
            <TabsTrigger value="revenue" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <DollarSign className="h-4 w-4" /> Revenue Flow
            </TabsTrigger>
          </TabsList>

          <TabsContent value="waste" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{wasteMetrics.totalBatches}</span>
                    <span className="text-sm text-muted-foreground">batches</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card bg-expired/5 border-expired/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-expired uppercase tracking-wider">Waste Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-expired">{wasteMetrics.wasteRate}%</span>
                    <TrendingDown className="h-4 w-4 text-expired" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{wasteMetrics.expiredQuantity}kg Lost</p>
                </CardContent>
              </Card>
              <Card className="glass-card bg-fresh/5 border-fresh/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-fresh uppercase tracking-wider">Saved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-fresh">{wasteMetrics.wastePrevented}kg</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Via Early Warnings</p>
                </CardContent>
              </Card>
              <Card className="glass-card bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-primary uppercase tracking-wider">Active</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">{wasteMetrics.freshBatches}</span>
                    <span className="text-sm text-muted-foreground">fresh</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="glass-card p-4">
                <h3 className="font-semibold mb-6 flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4 text-primary" /> Stock Freshness
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', borderColor: 'rgba(0,0,0,0.1)' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card className="glass-card p-4">
                <h3 className="font-semibold mb-6 flex items-center gap-2">
                  <LineChartIcon className="h-4 w-4 text-primary" /> Daily Intake
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyTrend}>
                      <defs>
                        <linearGradient id="colorQty" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tickMargin={10} fontSize={12} />
                      <YAxis axisLine={false} tickLine={false} fontSize={12} />
                      <Tooltip contentStyle={{ borderRadius: '12px', borderColor: 'rgba(0,0,0,0.1)' }} />
                      <Area type="monotone" dataKey="quantity" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorQty)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="farmers" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
            <div className="grid gap-4 md:grid-cols-3">
              {farmerPerformance.slice(0, 3).map((farmer, index) => (
                <Card key={farmer.farmerId} className={cn(
                  "glass-card border-none relative overflow-hidden",
                  index === 0 ? "bg-gradient-to-br from-yellow-500/10 to-transparent ring-1 ring-yellow-500/50" : "bg-white/40"
                )}>
                  {index === 0 && (
                    <div className="absolute top-0 right-0 bg-yellow-500 text-white px-3 py-1 rounded-bl-xl text-xs font-bold shadow-sm">
                      TOP RATED
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg",
                        index === 0 ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/20" : "bg-secondary"
                      )}>
                        #{index + 1}
                      </div>
                      <div>
                        <div className="text-base">{farmer.name}</div>
                        <div className="text-xs font-normal text-muted-foreground">{farmer.farmerCode}</div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-muted-foreground text-sm">Quality Score</span>
                      <span className="text-2xl font-black text-foreground">{farmer.qualityScore}%</span>
                    </div>
                    <div className="w-full bg-secondary/50 h-2 rounded-full overflow-hidden flex">
                      <div style={{ width: `${(farmer.gradeA / farmer.totalBatches) * 100}%` }} className="bg-fresh" />
                      <div style={{ width: `${(farmer.gradeB / farmer.totalBatches) * 100}%` }} className="bg-warning" />
                      <div style={{ width: `${(farmer.gradeC / farmer.totalBatches) * 100}%` }} className="bg-muted-foreground" />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-fresh" /> Grade A</span>
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-warning" /> Grade B</span>
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-400" /> Grade C</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="glass-card p-6">
              <h3 className="font-semibold mb-6">Detailed Performance Metrics</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={farmerPerformance} barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={10} fontSize={12} />
                    <YAxis axisLine={false} tickLine={false} fontSize={12} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', borderColor: 'rgba(0,0,0,0.1)' }} />
                    <Legend />
                    <Bar dataKey="gradeA" name="Grade A" stackId="a" fill="#16a34a" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="gradeB" name="Grade B" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="gradeC" name="Grade C" stackId="a" fill="#64748b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-none shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">Rs.{totalRevenue.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{filteredBills.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Processed Bills</p>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">Rs.{filteredBills.length > 0 ? Math.round(totalRevenue / filteredBills.length).toLocaleString() : 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Per Bill</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="glass-card col-span-2 p-6">
                <h3 className="font-semibold mb-6">Revenue Trend</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tickMargin={10} fontSize={12} />
                      <YAxis axisLine={false} tickLine={false} fontSize={12} hide />
                      <Tooltip contentStyle={{ borderRadius: '12px', borderColor: 'rgba(0,0,0,0.1)' }} />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card className="glass-card p-6">
                <h3 className="font-semibold mb-6">Top Products</h3>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {revenueByProduct.slice(0, 5).map((product, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                      <div className="flex items-center gap-3">
                        <div className="font-bold text-muted-foreground w-4">{i + 1}</div>
                        <span className="font-medium">{product.name}</span>
                      </div>
                      <span className="font-semibold text-primary">Rs.{product.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}