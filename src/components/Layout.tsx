import { Link, useLocation } from 'react-router-dom';
import {
  Leaf,
  Warehouse,
  Store,
  BarChart3,
  ClipboardCheck,
  Menu,
  X,
  User,
  FileText,
  Database
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/dashboard', label: 'Overview', icon: BarChart3 },
  { path: '/farmer', label: 'Farmer', icon: Leaf },
  { path: '/grading', label: 'Quality', icon: ClipboardCheck },
  { path: '/warehouse', label: 'Warehouse', icon: Warehouse },
  { path: '/retailer', label: 'Retailer', icon: Store },
  { path: '/customer', label: 'Customer', icon: User },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/traceability', label: 'Traceability', icon: Database },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Floating Navbar */}
      <div className="fixed top-4 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
        <header className="w-full max-w-7xl rounded-2xl glass px-4 py-3 flex items-center justify-between pointer-events-auto">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Agrovia</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300',
                    isActive
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-primary rounded-xl -z-10 shadow-lg shadow-primary/25 layout-id-active" />
                  )}
                  <span className="relative flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-xl hover:bg-secondary/50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </header>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden pt-24 px-4">
          <nav className="glass rounded-3xl p-4 animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-4 px-4 py-3 text-base font-medium rounded-2xl transition-all active:scale-98',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}

      {/* Main Content Spacer for Floating Nav */}
      <main className="container py-24 md:py-28 max-w-7xl animate-in fade-in duration-700 slide-in-from-bottom-4">
        {children}
      </main>
    </div>
  );
}
