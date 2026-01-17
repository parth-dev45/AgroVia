import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Layout } from '@/components/Layout';
import { Leaf, Droplets, Recycle, Wind, Trees, Sprout, ArrowUpRight, Factory } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const carbonData = [
    { month: 'Jan', co2: 120 },
    { month: 'Feb', co2: 110 },
    { month: 'Mar', co2: 95 },
    { month: 'Apr', co2: 85 },
    { month: 'May', co2: 70 },
    { month: 'Jun', co2: 60 },
    { month: 'Jul', co2: 90 }, // Harvest season spike
    { month: 'Aug', co2: 55 },
    { month: 'Sep', co2: 45 },
];

export default function Sustainability() {
    return (
        <Layout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-emerald-400 bg-clip-text text-transparent">
                            Eco-Impact Tracker
                        </h1>
                        <p className="text-muted-foreground text-lg mt-2">
                            Visualizing our journey towards Net Zero 2030
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="font-medium">Live Impact Metrics</span>
                    </div>
                </div>

                {/* Hero Cards Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* Trees Planted */}
                    <Card className="glass-card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200/50">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-green-500/10 rounded-xl">
                                    <Trees className="h-6 w-6 text-green-600" />
                                </div>
                                <span className="flex items-center text-xs font-semibold text-green-600 bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded-lg">
                                    +12% <ArrowUpRight className="h-3 w-3 ml-1" />
                                </span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-3xl font-bold text-foreground">1,240</h3>
                                <p className="text-sm text-muted-foreground font-medium">Trees Planted Equivalent</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Water Saved */}
                    <Card className="glass-card bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200/50">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl">
                                    <Droplets className="h-6 w-6 text-blue-600" />
                                </div>
                                <span className="flex items-center text-xs font-semibold text-blue-600 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded-lg">
                                    +8% <ArrowUpRight className="h-3 w-3 ml-1" />
                                </span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-3xl font-bold text-foreground">45k L</h3>
                                <p className="text-sm text-muted-foreground font-medium">Water Conserved</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Carbon Offset */}
                    <Card className="glass-card bg-gradient-to-br from-teal-50 to-green-50 dark:from-teal-950/30 dark:to-green-950/30 border-teal-200/50">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-teal-500/10 rounded-xl">
                                    <Wind className="h-6 w-6 text-teal-600" />
                                </div>
                                <span className="flex items-center text-xs font-semibold text-teal-600 bg-teal-100 dark:bg-teal-900/50 px-2 py-1 rounded-lg">
                                    -25% <Factory className="h-3 w-3 ml-1" />
                                </span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-3xl font-bold text-foreground">8.5 T</h3>
                                <p className="text-sm text-muted-foreground font-medium">CO₂ Emissions Diverted</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Plastic Saved */}
                    <Card className="glass-card bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200/50">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-orange-500/10 rounded-xl">
                                    <Recycle className="h-6 w-6 text-orange-600" />
                                </div>
                                <span className="flex items-center text-xs font-semibold text-orange-600 bg-orange-100 dark:bg-orange-900/50 px-2 py-1 rounded-lg">
                                    +15% <ArrowUpRight className="h-3 w-3 ml-1" />
                                </span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-3xl font-bold text-foreground">500 kg</h3>
                                <p className="text-sm text-muted-foreground font-medium">Plastic Waste Eliminated</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Chart */}
                    <Card className="md:col-span-2 glass-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sprout className="h-5 w-5 text-green-600" /> Carbon Footprint Reduction
                            </CardTitle>
                            <CardDescription>
                                Monthly CO₂ emissions per ton of produce (2025-2026)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={carbonData}>
                                        <defs>
                                            <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}kg`} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }}
                                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                                        />
                                        <Area type="monotone" dataKey="co2" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCo2)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Water Tank Visualization (Custom CSS Animation) */}
                    <Card className="glass-card overflow-hidden relative">
                        <CardHeader className="relative z-10">
                            <CardTitle className="text-white flex items-center gap-2">
                                <Droplets className="h-5 w-5" /> Water Conservation
                            </CardTitle>
                            <CardDescription className="text-blue-100">
                                Real-time efficiency tracking
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="relative z-10 flex flex-col items-center justify-center h-[300px]">
                            <div className="text-6xl font-bold text-white mb-2">78%</div>
                            <p className="text-blue-100 text-lg text-center">Efficiency Rating</p>
                            <div className="mt-8 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white text-sm">
                                <p>💧 1500L saved this week</p>
                            </div>
                        </CardContent>

                        {/* Background Liquid Animation */}
                        <div className="absolute inset-0 bg-blue-600 z-0">
                            <div className="absolute top-0 left-0 right-0 bottom-0 bg-blue-500 opacity-50 z-0 animate-pulse"></div>
                            {/* Waves */}
                            <div className="absolute top-[30%] left-[-50%] w-[200%] h-[200%] rounded-[40%] bg-white/10 animate-[spin_10s_linear_infinite]"></div>
                            <div className="absolute top-[35%] left-[-50%] w-[200%] h-[200%] rounded-[45%] bg-white/20 animate-[spin_15s_linear_infinite]"></div>
                        </div>
                    </Card>
                </div>

                {/* Action Banner */}
                <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-none shadow-xl">
                    <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold">Join the Green Revolution</h3>
                            <p className="text-green-100 max-w-xl">
                                AgroVia dedicates 1% of every transaction to global reforestation projects.
                                Partner with us to amplify your impact.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <button className="px-6 py-3 bg-white text-green-700 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
                                View Impact Report
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
