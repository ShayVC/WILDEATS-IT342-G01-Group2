import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import pages
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/Login.jsx';
import RegisterPage from './pages/Register.jsx';
import SellerRegister from './pages/SellerRegister.jsx';
import SuperAdminDashboard from './pages/SuperAdminDashboard.jsx';
import SellerDashboard from './pages/SellerDashboard.jsx';

// Import components
import Navbar from './components/NavBar.jsx';
import Footer from './components/Footer.jsx';
import { SellerRoute } from './components/ProtectedRoute.jsx';

// Import contexts
import { AuthProvider } from './contexts/AuthContext.jsx';
import { AdminProvider } from './contexts/AdminContext.jsx';
import { ShopProvider } from './contexts/ShopContext.jsx';

// Import global styles
import GlobalStyles from './styles/GlobalStyles.js';

// Temporary placeholder for missing pages
const PlaceholderPage = ({ pageName }) => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>{pageName} - Coming Soon</h1>
    <p>This page is under development</p>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
          <ShopProvider>

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
                  <Route path="/shop-register" element={<SellerRegister />} />

                  {/* SUPERADMIN ROUTE */}
                  <Route path="/superadmin" element={<SuperAdminDashboard />} />

                  {/* Seller Routes */}
                  <Route element={<SellerRoute />}>
                    <Route path="/my-shop" element={<SellerDashboard />} />
                  </Route>

                  {/* Placeholder routes */}
                  <Route path="/shops" element={<PlaceholderPage pageName="Shops" />} />
                  <Route path="/shops/:id" element={<PlaceholderPage pageName="Shop Details" />} />
                  <Route path="/my-orders" element={<PlaceholderPage pageName="My Orders" />} />
                  <Route path="/orders" element={<PlaceholderPage pageName="Orders" />} />
                  <Route path="/users" element={<PlaceholderPage pageName="Users" />} />

                  {/* 404 */}
                  <Route path="*" element={<PlaceholderPage pageName="404 - Page Not Found" />} />

                </Routes>
              </main>

              <Footer />
            </div>

          </ShopProvider>
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
