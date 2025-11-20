import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ShopList from "./pages/ShopList";
import ShopMenu from "./pages/ShopMenu";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App(){
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>} />
            <Route path="/shops" element={<ProtectedRoute><ShopList/></ProtectedRoute>} />
            <Route path="/shop/:id" element={<ProtectedRoute><ShopMenu/></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute><Cart/></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout/></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

