import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAnalytics, getAllBatches } from '@/lib/mockData';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  TrendingDown,
  BarChart3,
  ArrowRight
} from 'lucide-react';
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
  Legend
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const analytics = getAnalytics();

  const statusData = [
    { name: 'Fresh', value: analytics.freshBatches, color: 'hsl(142, 70%, 45%)' },
    { name: 'Consume Soon', value: analytics.consumeSoonBatches, color: 'hsl(35, 90%, 55%)' },
    { name: 'Expired', value: analytics.expiredBatches, color: 'hsl(0, 72%, 50%)' },
  ];

  const gradeData = [
    { name: 'Grade A', count: analytics.gradeStats.A },
    { name: 'Grade B', count: analytics.gradeStats.B },
    { name: 'Grade C', count: analytics.gradeStats.C },
  ];

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white shadow-xl p-8 md:p-12">
          <div className="relative z-10 max-w-2xl space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
              Welcome back to Agrovia
            </h1>
            <p className="text-primary-foreground/90 text-lg md:text-xl max-w-lg leading-relaxed">
              Your supply chain is currently tracking <span className="font-semibold text-white">{analytics.totalQuantity} kg</span> of produce with <span className="font-semibold text-white">{analytics.freshBatches} active fresh batches</span>.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 border-0 rounded-xl font-semibold shadow-lg shadow-black/10">
                <Link to="/farmer">
                  New Intake
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-primary/20 hover:bg-primary/30 text-white border-white/20 rounded-xl hover:text-white backdrop-blur-sm">
                <Link to="/reports">View Reports</Link>
              </Button>
            </div>
          </div>

          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-20 -mb-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

          {/* Dashboard Vector/Icon Decoration */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block opacity-20 rotate-12 pointer-events-none">
            <Package className="w-64 h-64" />
          </div>
        </section>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Batches
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{analytics.totalBatches}</div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                {analytics.totalQuantity} kg tracked total
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Fresh Batches
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-fresh/10 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-fresh" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-fresh">{analytics.freshBatches}</div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                Ready for distribution
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Consume Soon
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">{analytics.consumeSoonBatches}</div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                Needs priority sale
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sales Blocked
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-expired/10 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-expired" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-expired">{analytics.preventedSalesCount}</div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                Expired items prevented
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Impact Metrics */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10 p-6 transition-all hover:shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white dark:bg-black/20 rounded-2xl shadow-sm">
                <TrendingDown className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">Waste Prevention</h3>
            </div>
            <div className="text-4xl font-bold text-foreground tracking-tight mb-2">{analytics.potentialWastePrevented} kg</div>
            <p className="text-muted-foreground text-sm">
              Estimated food waste reduced through our early warning grading system
            </p>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/20 blur-3xl rounded-full group-hover:bg-primary/30 transition-colors" />
          </div>

          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-fresh/5 to-fresh/10 border border-fresh/10 p-6 transition-all hover:shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white dark:bg-black/20 rounded-2xl shadow-sm">
                <TrendingDown className="h-6 w-6 text-fresh" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">Shelf Life</h3>
            </div>
            <div className="text-4xl font-bold text-foreground tracking-tight mb-2">+40%</div>
            <p className="text-muted-foreground text-sm">
              Average improvement in shelf life utilization with cold storage tracking
            </p>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-fresh/20 blur-3xl rounded-full group-hover:bg-fresh/30 transition-colors" />
          </div>

          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/10 p-6 transition-all hover:shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white dark:bg-black/20 rounded-2xl shadow-sm">
                <BarChart3 className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">Consumer Trust</h3>
            </div>
            <div className="text-4xl font-bold text-foreground tracking-tight mb-2">100%</div>
            <p className="text-muted-foreground text-sm">
              Full transparency on every batch via end-to-end QR code tracking
            </p>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-accent/20 blur-3xl rounded-full group-hover:bg-accent/30 transition-colors" />
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2 pb-8">
          <Card className="glass-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Freshness Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '1rem',
                        boxShadow: 'var(--shadow-lg)'
                      }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Quality Grades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '1rem',
                        boxShadow: 'var(--shadow-lg)'
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="hsl(var(--primary))"
                      radius={[8, 8, 8, 8]}
                      barSize={50}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
