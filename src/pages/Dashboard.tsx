import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAnalytics, getAllBatches } from '@/lib/mockData';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Scale,
  TrendingDown,
  ShieldCheck,
  BarChart3
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

export default function Dashboard() {
  const analytics = getAnalytics();
  const batches = getAllBatches();

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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time insights into your supply chain freshness
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Batches
              </CardTitle>
              <Package className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.totalBatches}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.totalQuantity} kg tracked
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Fresh Batches
              </CardTitle>
              <CheckCircle2 className="h-5 w-5 text-fresh" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-fresh">{analytics.freshBatches}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Ready for distribution
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Consume Soon
              </CardTitle>
              <AlertTriangle className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">{analytics.consumeSoonBatches}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Needs priority sale
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sales Blocked
              </CardTitle>
              <ShieldCheck className="h-5 w-5 text-expired" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-expired">{analytics.preventedSalesCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Expired items prevented
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Impact Metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Waste Prevention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{analytics.potentialWastePrevented} kg</div>
              <p className="text-sm opacity-90 mt-2">
                Estimated food waste reduced through early warning system
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-fresh/20 bg-fresh/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-fresh" />
                Shelf Life Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-fresh">+40%</div>
              <p className="text-sm text-muted-foreground mt-2">
                Average improvement with cold storage tracking
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Consumer Trust
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">100%</div>
              <p className="text-sm text-muted-foreground mt-2">
                Batch transparency via QR codes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Freshness Distribution</CardTitle>
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
              <CardTitle>Quality Grades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" className="text-muted-foreground" />
                    <YAxis className="text-muted-foreground" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)'
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
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
