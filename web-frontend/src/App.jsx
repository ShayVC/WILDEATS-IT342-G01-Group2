import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import pages
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/Login.jsx';
import RegisterPage from './pages/Register.jsx';
import SellerRegister from './pages/SellerRegister.jsx';
import ApplicationPending from './pages/ApplicationPending.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import OAuthCallback from './pages/OAuthCallback.jsx';

// Import components
import Navbar from './components/NavBar.jsx';
import Footer from './components/Footer.jsx';

// Import contexts
import { AuthProvider } from './contexts/AuthContext.jsx';

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

              {/* OAuth callback route */}
              <Route path="/oauth-callback" element={<OAuthCallback />} />

              {/* Seller onboarding flow */}
              <Route path="/pending" element={<ApplicationPending />} />

              {/* Dashboards */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/seller" element={<SellerRegister />} />

              {/* Placeholder routes for pages that don't exist yet */}
              <Route path="/shops" element={<PlaceholderPage pageName="Shops" />} />
              <Route path="/shops/:id" element={<PlaceholderPage pageName="Shop Details" />} />
              <Route path="/my-orders" element={<PlaceholderPage pageName="My Orders" />} />
              <Route path="/my-shop" element={<PlaceholderPage pageName="My Shop" />} />
              <Route path="/orders" element={<PlaceholderPage pageName="Orders" />} />
              <Route path="/users" element={<PlaceholderPage pageName="Users" />} />

              {/* 404 catch-all */}
              <Route path="*" element={<PlaceholderPage pageName="404 - Page Not Found" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;