// web-frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Placeholder routes - you'll create these pages later */}
          <Route path="/customer/shops" element={<div>Customer Shops Page (Coming Soon)</div>} />
          <Route path="/seller/dashboard" element={<div>Seller Dashboard (Coming Soon)</div>} />
          <Route path="/admin/dashboard" element={<div>Admin Dashboard (Coming Soon)</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;