import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Page2 from "./pages/Page2";
import AppraisalTool from "./pages/AppraisalTool";
import BrowseSellers from "./pages/BrowseSellers";
import Auth from "./pages/Auth";
import Browse from "./pages/Browse";
import Dashboard from "./pages/Dashboard";
import Community from "./pages/Community";
import CreateListing from "./pages/CreateListing";
import Pricing from "./pages/Pricing";
import SellerOnboarding from "./pages/SellerOnboarding";
import Admin from "./pages/Admin";
import Verification from "./pages/Verification";
import ListingDetail from "./pages/ListingDetail";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/page-2" element={<Page2 />} />
            <Route path="/appraisal-tool" element={<AppraisalTool />} />
            <Route path="/browse-sellers" element={<BrowseSellers />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/community" element={<Community />} />
            <Route path="/sell/new" element={<CreateListing />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/onboarding/seller" element={<SellerOnboarding />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/verification" element={<Verification />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
