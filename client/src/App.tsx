/**
 * App.tsx — Production Router
 *
 * Protected routes checked by useAuth.
 * RoleBasedNavbar shows only when user is logged in.
 */
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/_core/contexts/AuthContext";
import RoleBasedNavbar from "@/components/RoleBasedNavbar";

// Public
import Home         from "@/pages/Home";
import Auth         from "@/pages/Auth";
import NotFound     from "@/pages/NotFound";
import ProductDetail from "@/pages/ProductDetail";
import BuildingView from "@/pages/BuildingView";
import StorePage    from "@/pages/StorePage";

// Buyer
import ProductCatalog from "@/pages/buyer/ProductCatalog";
import BuyerDashboard from "@/pages/buyer/BuyerDashboard";
import Cart           from "@/pages/buyer/Cart";
import Checkout       from "@/pages/buyer/Checkout";
import OrderHistory   from "@/pages/buyer/OrderHistory";
import OrderTracking  from "@/pages/buyer/OrderTracking";
import BuyerProfile   from "@/pages/buyer/BuyerProfile";

// Admin
import AdminDashboard      from "@/pages/admin/AdminDashboard";
import SalesAnalytics      from "@/pages/admin/SalesAnalytics";
import AffiliateManagement from "@/pages/admin/AffiliateManagement";

// Manager
import ManagerDashboard    from "@/pages/manager/ManagerDashboard";
import ProductManagement   from "@/pages/manager/ProductManagement";
import CategoryManagement  from "@/pages/manager/CategoryManagement";
import InventoryManagement from "@/pages/manager/InventoryManagement";

// Delivery
import DeliveryDashboard     from "@/pages/delivery/DeliveryDashboard";
import DeliveryOrders        from "@/pages/delivery/DeliveryOrders";
import OrderDeliveryTracking from "@/pages/delivery/OrderDeliveryTracking";

// Affiliate
import AffiliateDashboard from "@/pages/affiliate/AffiliateDashboard";
import EarningsHistory    from "@/pages/affiliate/EarningsHistory";
import ReferralManagement from "@/pages/affiliate/ReferralManagement";

// Developer
import DeveloperDashboard from "@/pages/developer/DeveloperDashboard";
import PlatformAnalytics  from "@/pages/developer/PlatformAnalytics";
import UserManagement     from "@/pages/developer/UserManagement";

// Stock Manager
import StockManagerDashboard from "@/pages/stockmanager/StockManagerDashboard";
import StockAdjustment       from "@/pages/stockmanager/StockAdjustment";
import LowStockAlerts        from "@/pages/stockmanager/LowStockAlerts";
import InventoryHistory      from "@/pages/stockmanager/InventoryHistory";

// ─────────────────────────────────────────────────────────────────────────────
// Router
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <Toaster richColors position="top-right" />
      <RoleBasedNavbar />

      {/* pt-20 so navbar doesn't cover page content */}
      <div style={{ paddingTop: 80 }}>
        <Switch>
          {/* Public */}
          <Route path="/"             component={Home} />
          <Route path="/auth"         component={Auth} />
          <Route path="/mall"         component={BuildingView} />
          <Route path="/store/:id"    component={StorePage} />
          <Route path="/products/:id" component={ProductDetail} />
          <Route path="/products">    <ProductCatalog /></Route>

          {/* Buyer */}
          <Route path="/buyer">       <BuyerDashboard /></Route>
          <Route path="/cart">        <Cart /></Route>
          <Route path="/checkout">    <Checkout /></Route>
          <Route path="/orders">      <OrderHistory /></Route>
          <Route path="/orders/:id">  <OrderTracking /></Route>
          <Route path="/profile">     <BuyerProfile /></Route>

          {/* Admin */}
          <Route path="/admin">             <AdminDashboard /></Route>
          <Route path="/admin/analytics">   <SalesAnalytics /></Route>
          <Route path="/admin/affiliates">  <AffiliateManagement /></Route>

          {/* Manager */}
          <Route path="/manager">            <ManagerDashboard /></Route>
          <Route path="/manager/products">   <ProductManagement /></Route>
          <Route path="/manager/categories"> <CategoryManagement /></Route>
          <Route path="/manager/inventory">  <InventoryManagement /></Route>

          {/* Delivery */}
          <Route path="/delivery">           <DeliveryDashboard /></Route>
          <Route path="/delivery/orders">    <DeliveryOrders /></Route>
          <Route path="/delivery/orders/:id"><OrderDeliveryTracking /></Route>

          {/* Affiliate */}
          <Route path="/affiliate">           <AffiliateDashboard /></Route>
          <Route path="/affiliate/earnings">  <EarningsHistory /></Route>
          <Route path="/affiliate/referrals"> <ReferralManagement /></Route>

          {/* Developer */}
          <Route path="/developer">           <DeveloperDashboard /></Route>
          <Route path="/developer/analytics"> <PlatformAnalytics /></Route>
          <Route path="/developer/users">     <UserManagement /></Route>

          {/* Stock Manager */}
          <Route path="/stock-manager">             <StockManagerDashboard /></Route>
          <Route path="/stock-manager/adjust">      <StockAdjustment /></Route>
          <Route path="/stock-manager/low-stock">   <LowStockAlerts /></Route>
          <Route path="/stock-manager/history">     <InventoryHistory /></Route>

          {/* 404 */}
          <Route component={NotFound} />
        </Switch>
      </div>
    </AuthProvider>
  );
}
