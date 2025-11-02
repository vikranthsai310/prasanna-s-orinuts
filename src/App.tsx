
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import AdminRoute from "./components/AdminRoute";
import SuperAdminRoute from "./components/SuperAdminRoute";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import "./styles/animations.css";
import { lazy, Suspense, useEffect } from "react";
import ImagePreloader from "./components/ImagePreloader";
import { initializeMalformedUrlProtection } from "./utils/malformedUrlFixer";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const AddSamples = lazy(() => import("./pages/AddSamples"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const Orders = lazy(() => import("./pages/Orders"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const Auth = lazy(() => import("./pages/Auth"));
const Profile = lazy(() => import("./pages/Profile"));
const Contact = lazy(() => import("./pages/Contact"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy"));
const ReturnPolicy = lazy(() => import("./pages/ReturnPolicy"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminUserDetails = lazy(() => import("./pages/admin/UserDetails"));
const AdminManagement = lazy(() => import("./pages/admin/AdminManagement"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons"));
const AdminProductDiscounts = lazy(() => import("./pages/admin/ProductDiscounts"));
const AdminManageSamples = lazy(() => import("./pages/admin/ManageSamples"));
const DebugOrders = lazy(() => import("./pages/DebugOrders"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TestRazorpay = lazy(() => import("./pages/TestRazorpay"));

const queryClient = new QueryClient();

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const App = () => {
  // Initialize malformed URL protection
  useEffect(() => {
    const protection = initializeMalformedUrlProtection();
    
    return () => {
      protection.cleanup();
    };
  }, []);

  const isDevelopment = import.meta.env.DEV;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <CartProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
              <ScrollToTop />
              <ImagePreloader 
                preloadAll={false} 
              />
              <Suspense fallback={<LoadingFallback />}>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/samples" element={<AddSamples />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order/:id/confirmation" element={<OrderConfirmation />} />
                    <Route path="/order-confirmation" element={<OrderConfirmation />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/track/:id" element={<TrackOrder />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms-of-service" element={<TermsOfService />} />
                    <Route path="/shipping-policy" element={<ShippingPolicy />} />
                    <Route path="/return-policy" element={<ReturnPolicy />} />
                    
                    {/* Development-only routes */}
                    {isDevelopment && (
                      <>
                        <Route path="/test-razorpay" element={<TestRazorpay />} />
                        <Route path="/debug-orders" element={
                          <AdminRoute>
                            <DebugOrders />
                          </AdminRoute>
                        } />
                      </>
                    )}
                    
                    {/* Admin Routes - Protected with AdminRoute */}
                    <Route path="/admin" element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    } />
                    <Route path="/admin/dashboard" element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    } />
                    <Route path="/admin/products" element={
                      <AdminRoute>
                        <AdminProducts />
                      </AdminRoute>
                    } />
                    <Route path="/admin/orders" element={
                      <AdminRoute>
                        <AdminOrders />
                      </AdminRoute>
                    } />
                    <Route path="/admin/users" element={
                      <AdminRoute>
                        <AdminUsers />
                      </AdminRoute>
                    } />
                    <Route path="/admin/users/:userId" element={
                      <AdminRoute>
                        <AdminUserDetails />
                      </AdminRoute>
                    } />
                    <Route path="/admin/admin-management" element={
                      <SuperAdminRoute>
                        <AdminManagement />
                      </SuperAdminRoute>
                    } />
                    <Route path="/admin/settings" element={
                      <AdminRoute>
                        <AdminSettings />
                      </AdminRoute>
                    } />
                    <Route path="/admin/coupons" element={
                      <AdminRoute>
                        <AdminCoupons />
                      </AdminRoute>
                    } />
                    <Route path="/admin/discounts" element={
                      <AdminRoute>
                        <AdminProductDiscounts />
                      </AdminRoute>
                    } />
                    <Route path="/admin/samples" element={
                      <AdminRoute>
                        <AdminManageSamples />
                      </AdminRoute>
                    } />
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </Suspense>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
