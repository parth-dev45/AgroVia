import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import FarmerIntake from "./pages/FarmerIntake";
import QualityGrading from "./pages/QualityGrading";
import WarehouseDashboard from "./pages/WarehouseDashboard";
import RetailerDashboard from "./pages/RetailerDashboard";
import CustomerLookup from "./pages/CustomerLookup";
import ConsumerScan from "./pages/ConsumerScan";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import TraceabilityExplorer from "./pages/TraceabilityExplorer";
import Sustainability from "./pages/Sustainability";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/farmer" element={<FarmerIntake />} />
          <Route path="/grading" element={<QualityGrading />} />
          <Route path="/warehouse" element={<WarehouseDashboard />} />
          <Route path="/retailer" element={<RetailerDashboard />} />
          <Route path="/customer" element={<CustomerLookup />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/scan/:batchId" element={<ConsumerScan />} />
          <Route path="/traceability" element={<TraceabilityExplorer />} />
          <Route path="/sustainability" element={<Sustainability />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
