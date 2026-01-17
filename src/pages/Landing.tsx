import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Leaf, ShieldCheck, Zap, Globe, ChevronRight, BarChart3, Lock } from 'lucide-react';

export default function Landing() {
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20">

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center">
                            <Leaf className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">AgroVia</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                        <button onClick={() => scrollToSection('features')} className="hover:text-primary transition-colors">Features</button>
                        <button onClick={() => scrollToSection('how-it-works')} className="hover:text-primary transition-colors">Traceability</button>
                        <button onClick={() => scrollToSection('testimonials')} className="hover:text-primary transition-colors">Testimonials</button>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard">
                            <Button variant="ghost" className="hidden md:inline-flex">Sign In</Button>
                        </Link>
                        <Link to="/dashboard">
                            <Button className="rounded-full px-6 shadow-lg shadow-primary/20">
                                Get Started <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-fresh/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 text-sm font-medium text-muted-foreground mb-4">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fresh opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-fresh"></span>
                            </span>
                            v2.0 Now Available with Blockchain Traceability
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
                            The Future of <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-fresh via-primary to-fresh animate-gradient-x">Ethical Agriculture</span>
                        </h1>

                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            AgroVia brings farm-to-table transparency to the modern world.
                            Connect farmers, distributors, and consumers on a single immutable ledger.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link to="/dashboard">
                                <Button size="lg" className="h-14 px-8 rounded-full text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                                    Launch Platform
                                </Button>
                            </Link>
                            <Link to="/traceability">
                                <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-lg hover:bg-secondary/50">
                                    View Public Ledger
                                </Button>
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-border/50 mt-12">
                            {[
                                { label: 'Batches Tracked', value: '10k+' },
                                { label: 'Farm Partners', value: '500+' },
                                { label: 'Waste Reduced', value: '45%' },
                                { label: 'Data Uptime', value: '99.9%' },
                            ].map((stat, i) => (
                                <div key={i} className="text-center space-y-1">
                                    <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                                    <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-secondary/20 relative">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold mb-4">Enterprise-Grade Capabilities</h2>
                        <p className="text-muted-foreground text-lg">Everything you need to manage the supply chain, from harvest to retail.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Globe className="h-6 w-6 text-blue-500" />,
                                title: "Global Traceability",
                                desc: "Track produce journey effectively across borders with precise geolocation and timestamping."
                            },
                            {
                                icon: <ShieldCheck className="h-6 w-6 text-green-500" />,
                                title: "Quality Assurance",
                                desc: "AI-powered grading systems ensure only the best produce reaches the market."
                            },
                            {
                                icon: <Zap className="h-6 w-6 text-yellow-500" />,
                                title: "Instant settlements",
                                desc: "Smart contracts automate payments to farmers immediately upon quality verification."
                            },
                            {
                                icon: <BarChart3 className="h-6 w-6 text-purple-500" />,
                                title: "Advanced Analytics",
                                desc: "Real-time insights into waste reduction, inventory levels, and predicted demand."
                            },
                            {
                                icon: <Lock className="h-6 w-6 text-red-500" />,
                                title: "Immutable Security",
                                desc: "Blockchain-backed data integrity means records can never be tampered with."
                            },
                            {
                                icon: <CheckCircle2 className="h-6 w-6 text-teal-500" />,
                                title: "Retailer Integration",
                                desc: "Seamless POS systems for retailers to manage stock and verify freshness."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="group p-8 rounded-3xl bg-background border border-border/50 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300">
                                <div className="mb-6 inline-flex p-3 rounded-2xl bg-secondary group-hover:bg-white transition-colors">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Preview Section */}
            <section id="how-it-works" className="py-24 overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <h2 className="text-4xl font-bold leading-tight">
                                See the entire journey <br />
                                <span className="text-primary">in real-time.</span>
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                Our dashboard provides a command center for your entire operation. Monitor live logistics, verify batch quality with AI, and manage warehouse inventory with drag-and-drop simplicity.
                            </p>
                            <div className="space-y-4">
                                {[
                                    "Live Truck Tracking with IoT Sensors",
                                    "Blockchain Verification Explorer",
                                    "Automated Label & Invoice Generation"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-fresh" />
                                        <span className="font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                            <Link to="/dashboard">
                                <Button variant="outline" size="lg" className="rounded-full mt-4">
                                    Explore Dashboard <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary to-fresh opacity-20 blur-3xl rounded-full" />
                            <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl bg-background/50 backdrop-blur-sm p-4 rotate-3 hover:rotate-0 transition-transform duration-700">
                                <div className="aspect-video rounded-lg bg-secondary/50 flex items-center justify-center border border-border/50">
                                    <div className="text-center space-y-4">
                                        <div className="inline-flex p-4 rounded-full bg-background shadow-lg mb-4">
                                            <Leaf className="h-12 w-12 text-fresh" />
                                        </div>
                                        <p className="text-sm font-medium text-muted-foreground">Interactive Dashboard Preview</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-24 bg-secondary/30">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold mb-4">Trusted by Industry Leaders</h2>
                        <p className="text-muted-foreground text-lg">See how AgroVia is transforming supply chains worldwide.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                quote: "AgroVia's blockchain traceability has completely changed how we build trust with our customers. Sales are up 30%.",
                                author: "Kaustubh Jagade",
                                role: "Organic Farmer, India"
                            },
                            {
                                quote: "The AI grading system is a game changer. We save hours every day and dispute rates have dropped to near zero.",
                                author: "Anushka Talole",
                                role: "Wholesale Distributor, India"
                            },
                            {
                                quote: "Finally, a platform that actually connects the entire supply chain. The real-time logistics tracking is invaluable.",
                                author: "Anuj Pisal",
                                role: "Supply Chain Director, India"
                            }
                        ].map((testimonial, i) => (
                            <div key={i} className="bg-background/60 backdrop-blur-sm p-8 rounded-3xl border border-border/50 shadow-sm relative">
                                <div className="absolute top-8 right-8 text-primary/20">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M14.017 21L14.017 18C14.017 16.054 15.337 14.713 17.373 14.713H17.525C17.068 13.069 16.49 11.593 15.426 10.428C14.363 9.263 12.872 8.5 10.975 8.5V4.764C13.844 4.764 16.295 6.075 18.067 8.32C19.839 10.565 20.849 13.91 20.887 18.006L14.017 21ZM5.52901 21L5.52901 18C5.52901 16.054 6.84901 14.713 8.88501 14.713H9.03701C8.58001 13.069 8.00301 11.593 6.93801 10.428C5.87401 9.263 4.38301 8.5 2.48601 8.5V4.764C5.35501 4.764 7.80601 6.075 9.57801 8.32C11.35 10.565 12.36 13.91 12.399 18.006L5.52901 21Z" />
                                    </svg>
                                </div>
                                <p className="text-lg italic mb-6 leading-relaxed">"{testimonial.quote}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-fresh flex items-center justify-center text-white font-bold text-sm">
                                        {testimonial.author[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold">{testimonial.author}</div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wide">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24">
                <div className="container mx-auto px-6">
                    <div className="relative rounded-[3rem] bg-gradient-to-br from-primary to-primary/80 overflow-hidden px-8 py-20 text-center text-primary-foreground shadow-2xl">
                        <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/5/5b/Mandel_zoom_04_seehorse_tail.jpg')] opacity-5 mix-blend-overlay bg-cover bg-center" />
                        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                            <h2 className="text-4xl font-bold">Ready to modernize your supply chain?</h2>
                            <p className="text-primary-foreground/80 text-lg">
                                Join hundreds of forward-thinking agriculture businesses using AgroVia today.
                            </p>
                            <Link to="/dashboard">
                                <Button size="lg" variant="secondary" className="h-16 px-10 rounded-full text-xl font-bold text-primary hover:scale-105 transition-transform">
                                    Get Started Now
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-border/50 bg-secondary/20">
                <div className="container mx-auto px-6 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2 mb-6 text-foreground font-bold text-xl">
                        <Leaf className="h-6 w-6 text-primary" /> AgroVia
                    </div>
                    <p className="mb-6">&copy; 2026 AgroVia Inc. All rights reserved.</p>
                    <div className="flex justify-center gap-8 text-sm">
                        <a href="#" className="hover:text-primary">Privacy Policy</a>
                        <a href="#" className="hover:text-primary">Terms of Service</a>
                        <a href="#" className="hover:text-primary">Contact Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
