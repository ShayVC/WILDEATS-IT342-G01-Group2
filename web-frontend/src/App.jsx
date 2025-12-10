import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import pages
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/Login.jsx';
import RegisterPage from './pages/Register.jsx';

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

                    {/* Protected routes */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="/shops" element={<ShopsPage />} />
                      <Route path="/shops/:id" element={<ShopDetailsPage />} />
                      <Route path="/my-orders" element={<MyOrdersPage />} />
                      <Route path="/seller-register" element={<SellerRegisterFlow />} />

                      {/* Admin routes */}
                      <Route path="/admin/create" element={<AdminFormPage />} />
                      <Route path="/admin/:id" element={<AdminDetailsPage />} />
                      <Route path="/admins/*" element={<AdminFormPage />} />
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