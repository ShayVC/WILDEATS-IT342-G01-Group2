import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import pages
import HomePage from './pages/HomePage';
import MyOrdersPage from './pages/MyOrdersPage';
import PlaceOrderPage from './pages/PlaceOrderPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FoodItemFormPage from './pages/FoodItemFormPage';

// Import components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ProtectedRoute, SellerRoute, CustomerRoute } from './components/ProtectedRoute';

// Import contexts
import { AuthProvider } from './contexts/AuthContext';
import { OrderProvider } from './contexts/OrderContext';
import { ShopProvider } from './contexts/ShopContext';
import { UserProvider } from './contexts/UserContext';

// Import global styles
import GlobalStyles from './styles/GlobalStyles';

// Import Shop and User pages
import ShopsPage from './pages/ShopsPage';
import ShopDetailsPage from './pages/ShopDetailsPage';
import ShopFormPage from './pages/ShopFormPage';
import UsersPage from './pages/UsersPage';
import UserDetailsPage from './pages/UserDetailsPage';
import UserFormPage from './pages/UserFormPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ShopProvider>
          <UserProvider>
            <OrderProvider>
              <div className="App">
                <GlobalStyles />
                <ToastContainer position="bottom-right" />
                <Navbar />
                <main className="main-content">
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    
                    {/* Protected routes (require authentication) */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="/shops" element={<ShopsPage />} />
                      <Route path="/shops/:id" element={<ShopDetailsPage />} />
                      <Route path="/my-orders" element={<MyOrdersPage />} />
                    </Route>
                    
                    {/* Seller-only routes */}
                    <Route element={<SellerRoute />}>
                      <Route path="/shops/create" element={<ShopFormPage />} />
                      <Route path="/shops/edit/:id" element={<ShopFormPage />} />
                      <Route path="/shops/:shopId/add-food" element={<FoodItemFormPage />} />
                      <Route path="/shops/:shopId/food/:foodId/edit" element={<FoodItemFormPage />} />
                    </Route>
                    
                    {/* Customer-only routes */}
                    <Route element={<CustomerRoute />}>
                      <Route path="/shops/:shopId/place-order" element={<PlaceOrderPage />} />
                    </Route>
                    
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </OrderProvider>
          </UserProvider>
        </ShopProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
