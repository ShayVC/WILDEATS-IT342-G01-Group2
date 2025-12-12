// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ShopProvider } from "@/context/ShopContext";
import { CartProvider } from "@/context/CartContext";

import ProtectedRoute from "@/routes/ProtectedRoute";

// Admin
import AdminLayout from "@/layouts/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminShopRequests from "@/pages/admin/AdminShopRequests";
import AdminShopManagement from "@/pages/admin/AdminShopManagement";

// User/Seller pages
import Home from "@/pages/Home";
import SellerDashboard from "@/pages/SellerDashboard";
import Dashboard from "@/pages/Dashboard";
import SellerRegisterFlow from "@/pages/SellerRegisterFlow";
import ShopsPage from "@/pages/ShopsPage";
import ShopDetailsPage from "@/pages/ShopDetailsPage";
import ProfilePage from "@/pages/ProfilePage";
import ProfileEditPage from "@/pages/ProfileEditPage";
import OrdersPage from "@/pages/OrdersPage";
import SellerApplicationPage from "./pages/SellerApplicationPage";
import OAuthCallback from "@/pages/OAuthCallback";

/* ------------------------------------------------------
   NO LOGIN PAGE — This decides what happens on "/"
------------------------------------------------------- */

function RootRouter() {
  const { token, user, isAdmin } = useAuth();

  // not logged in → show homepage with login/signup modals
  if (!token || !user) return <Home />;

  // admin → redirect to admin panel
  if (isAdmin) return <Navigate to="/admin" replace />;

  // customer/seller → show normal homepage
  return <Home />;
}

/* ------------------------------------------------------ */

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ShopProvider>
          <CartProvider>

            <Routes>

              {/* ✅ ADD OAUTH CALLBACK ROUTE */}
              <Route path="/oauth-callback" element={<OAuthCallback />} />

              {/* Old admin route → redirect permanently */}
              <Route path="/admin_homepage" element={<Navigate to="/admin" replace />} />

              {/* Root */}
              <Route path="/" element={<RootRouter />} />

              {/* Admin */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="requests" element={<AdminShopRequests />} />
                <Route path="shops" element={<AdminShopManagement />} />
              </Route>

              {/* Profile */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={["CUSTOMER", "SELLER", "ADMIN"]}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/edit"
                element={
                  <ProtectedRoute allowedRoles={["CUSTOMER", "SELLER", "ADMIN"]}>
                    <ProfileEditPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/seller-application"
                element={
                  <ProtectedRoute allowedRoles={["CUSTOMER", "SELLER"]}>
                    <SellerApplicationPage />
                  </ProtectedRoute>
                }
              />

              {/* Orders */}
              <Route
                path="/orders"
                element={
                  <ProtectedRoute allowedRoles={["CUSTOMER", "SELLER", "ADMIN"]}>
                    <OrdersPage />
                  </ProtectedRoute>
                }
              />

              {/* Seller */}
              <Route
                path="/seller-register"
                element={
                  <ProtectedRoute allowedRoles={["CUSTOMER", "SELLER"]}>
                    <SellerRegisterFlow />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seller_dashboard"
                element={
                  <ProtectedRoute allowedRoles={["SELLER"]}>
                    <SellerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Customer dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Shops */}
              <Route
                path="/shops"
                element={
                  <ProtectedRoute allowedRoles={["CUSTOMER", "SELLER", "ADMIN"]}>
                    <ShopsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shops/:id"
                element={
                  <ProtectedRoute allowedRoles={["CUSTOMER", "SELLER", "ADMIN"]}>
                    <ShopDetailsPage />
                  </ProtectedRoute>
                }
              />

            </Routes>

          </CartProvider>
        </ShopProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;