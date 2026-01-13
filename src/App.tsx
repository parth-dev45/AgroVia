import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import FarmerIntake from "./pages/FarmerIntake";
import QualityGrading from "./pages/QualityGrading";
import WarehouseDashboard from "./pages/WarehouseDashboard";
import RetailerDashboard from "./pages/RetailerDashboard";
import CustomerLookup from "./pages/CustomerLookup";
import ConsumerScan from "./pages/ConsumerScan";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/farmer" element={<FarmerIntake />} />
          <Route path="/quality" element={<QualityGrading />} />
          <Route path="/warehouse" element={<WarehouseDashboard />} />
          <Route path="/retailer" element={<RetailerDashboard />} />
          <Route path="/customer" element={<CustomerLookup />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/scan/:batchId" element={<ConsumerScan />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
