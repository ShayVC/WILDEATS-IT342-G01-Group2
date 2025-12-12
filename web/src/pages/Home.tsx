import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

import {
  Search,
  ChevronDown,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const BACKEND_URL = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:8080";

// ==============================
// API + Types
// ==============================
const API = axios.create({
  baseURL: "http://localhost:8080",
});

interface ShopApplication {
  shopId: number;
  shopName: string;
  status: string;
  createdAt: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    roles: string[]; // FIXED — array of roles
  };
}

type AuthView = "main" | "login" | "signup";

// Dummy UI data
const cuisines = [
  { name: "Pizza", image: "https://images.deliveryhero.io/image/foodpanda/cuisine-images/ph/52.png" },
  { name: "Chicken", image: "https://images.deliveryhero.io/image/foodpanda/cuisine-images/ph/79.png" },
  { name: "Cakes", image: "https://images.deliveryhero.io/image/foodpanda/cuisine-images/ph/1107.png" },
  { name: "Burgers", image: "https://images.deliveryhero.io/image/foodpanda/cuisine-images/ph/64.png" },
];

const dailyDeals = [
  { id: 1, title: "50% OFF", subtitle: "Exclusive promo with GCash", bg: "bg-blue-900", logo: "GCash" },
  { id: 2, title: "₱89 Meals", subtitle: "Budget meals available today", bg: "bg-rose-600", logo: "Student Saver" },
  { id: 3, title: "Free Delivery", subtitle: "For selected shops nearby", bg: "bg-emerald-600", logo: "Free Shipping" },
];

const restaurants = [
  {
    id: 1,
    name: "McDonald's - Paterno",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    rating: 4.5,
    deliveryTime: "20–35 min",
    deliveryFee: "₱49",
    discount: "Up to 25% off",
  },
  {
    id: 2,
    name: "Jollibee - City Center",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400",
    rating: 4.7,
    deliveryTime: "25–40 min",
    deliveryFee: "₱39",
    discount: "₱99 Jollibee Meal Deals",
  },
  {
    id: 3,
    name: "Tasty Milk Tea",
    image: "https://images.unsplash.com/photo-1589187155479-61b47c09a755?w=400",
    rating: 4.8,
    deliveryTime: "15–25 min",
    deliveryFee: "₱29",
    discount: "Buy 1 Take 1",
  },
  {
    id: 4,
    name: "Campus Chicken House",
    image: "https://images.unsplash.com/photo-1606851092835-82cd6e5a642f?w=400",
    rating: 4.6,
    deliveryTime: "20–30 min",
    deliveryFee: "₱19",
    discount: "Free Rice Meal",
  },
];

const handleGoogleLogin = () => {
  // Redirect to backend OAuth2 endpoint
  window.location.href = `${BACKEND_URL}/oauth2/authorization/google`;
};

// ==============================
// HOME COMPONENT
// ==============================
const Home: React.FC = () => {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState<AuthView>("main");

  const [partnerBannerVisible, setPartnerBannerVisible] = useState(true);
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const [signupForm, setSignupForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [signupError, setSignupError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] =
    useState<"weak" | "medium" | "strong" | null>(null);

  const [shopStatus, setShopStatus] = useState<
    "NONE" | "PENDING" | "ACTIVE" | "SUSPENDED" | "CLOSED"
  >("NONE");

  const cuisineRef = useRef<HTMLDivElement | null>(null);
  const dealsRef = useRef<HTMLDivElement | null>(null);

  // ==========================================
  // Fetch seller application status
  // ==========================================
  useEffect(() => {
    if (!user) {
      setShopStatus("NONE");
      return;
    }

    const loadStatus = async () => {
      try {
        const res = await API.get("/api/shops/my-applications", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const list = res.data as ShopApplication[];
        if (!Array.isArray(list) || list.length === 0) {
          setShopStatus("NONE");
          return;
        }

        const latest = [...list].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )[0];

        setShopStatus(latest.status as any);
      } catch {
        setShopStatus("NONE");
      }
    };

    loadStatus();
  }, [user]);

  // ==========================================
  // Banner
  // ==========================================
  const getBannerText = () => {
    if (!user) return "Login and register for a business account!";
    if (shopStatus === "NONE") return "Be our partner. Register your shop here!";
    if (shopStatus === "PENDING") return "Your application is currently under review.";
    if (shopStatus === "ACTIVE") return "Your shop is approved! Visit your seller dashboard.";
    return "Be our partner.";
  };

  const handleBannerClick = () => {
    if (!user) {
      setAuthView("main");
      setAuthModalOpen(true);
      return;
    }
    if (shopStatus === "NONE") navigate("/seller-register");
    if (shopStatus === "ACTIVE" && user.roles?.includes("SELLER"))
      navigate("/seller_dashboard");
  };

  // ==========================================
  // Login
  // ==========================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await API.post("/api/auth/login", loginData);
      const { token, user } = res.data as AuthResponse;

      login(token, user);

      toast({
        title: "Login successful",
        description: `Welcome back, ${user.firstName}!`,
      });

      if (user.roles?.includes("ADMIN")) navigate("/admin_homepage");
      else if (user.roles?.includes("SELLER")) navigate("/seller_dashboard");
      else navigate("/");

      setAuthModalOpen(false);
    } catch (err: any) {
      toast({
        title: "Login failed",
        variant: "destructive",
        description:
          err?.response?.data?.message ||
          "Invalid login credentials",
      });
    }
  };

  // ==========================================
  // Signup
  // ==========================================
  const updatePasswordStrength = (value: string) => {
    const strong = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    const medium = /^(?=.*[A-Z])(?=.*\d).{6,}$/;

    if (!value) setPasswordStrength(null);
    else if (strong.test(value)) setPasswordStrength("strong");
    else if (medium.test(value)) setPasswordStrength("medium");
    else setPasswordStrength("weak");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (signupForm.password !== signupForm.confirmPassword) {
      setSignupError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await API.post("/api/auth/register", signupForm);
      const { token, user } = res.data as AuthResponse;

      login(token, user);

      toast({
        title: "Account created",
        description: `Welcome, ${user.firstName}!`,
      });

      if (user.roles?.includes("ADMIN")) navigate("/admin_homepage");
      else navigate("/");

      setAuthModalOpen(false);
    } catch (err: any) {
      setSignupError(
        err?.response?.data?.message || "Registration failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // Password strength badge
  // ==========================================
  const renderPasswordStrength = () => {
    if (!passwordStrength) return null;

    const label =
      passwordStrength === "strong"
        ? "Strong password"
        : passwordStrength === "medium"
          ? "Medium strength"
          : "Weak password";

    const color =
      passwordStrength === "strong"
        ? "bg-emerald-100 text-emerald-700"
        : passwordStrength === "medium"
          ? "bg-amber-100 text-amber-700"
          : "bg-red-100 text-red-700";

    return (
      <p
        className={`mt-1 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${color}`}
      >
        {label}
      </p>
    );
  };

  // ==========================================
  // UI RENDER
  // ==========================================
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">

      {/* ======================== */}
      {/* TOP BANNER */}
      {/* ======================== */}
      {partnerBannerVisible && (
        <div className="bg-fp-pink py-2 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-white text-sm">
            <div className="w-6" />

            <span
              className="cursor-pointer underline decoration-white/70 hover:decoration-white"
              onClick={handleBannerClick}
            >
              {getBannerText()}
            </span>

            <button
              onClick={() => setPartnerBannerVisible(false)}
              className="text-white/90 hover:text-white text-lg font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* ======================== */}
      {/* HEADER */}
      {/* ======================== */}
      <header className="bg-white/95 backdrop-blur border-b sticky top-0 z-[999] shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 flex justify-between items-center gap-4">

          {/* LOGO */}
          <div
            onClick={() => navigate("/")}
            className="cursor-pointer flex items-center gap-2"
          >
            <svg viewBox="0 0 200 50" className="h-8 w-auto">
              <rect x="0" y="10" width="30" height="30" rx="6" fill="hsla(0,80%,25%,1)" />
              <text x="38" y="33" fill="hsla(0,80%,25%,1)" fontSize="22" fontWeight="700">
                WildEats
              </text>
            </svg>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4">

            {/* CART */}
            {user && (
              <button
                onClick={() => navigate("/cart")}
                className="relative p-2 hover:bg-gray-100 rounded-full"
              >
                <ShoppingBag className="w-6 h-6 text-gray-700" />
              </button>
            )}

            {/* NOT LOGGED IN */}
            {!user && (
              <>
                <button
                  onClick={() => {
                    setAuthView("login");
                    setAuthModalOpen(true);
                  }}
                  className="px-4 py-2 border rounded-full text-sm hover:bg-gray-100"
                >
                  Log in
                </button>

                <button
                  onClick={() => {
                    setAuthView("signup");
                    setAuthModalOpen(true);
                  }}
                  className="px-4 py-2 bg-fp-pink text-white rounded-full text-sm font-medium hover:bg-fp-pink/90"
                >
                  Sign up
                </button>
              </>
            )}

            {/* LOGGED IN DROPDOWN */}
            {user && (
              <div className="relative group">
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center gap-2 text-sm">
                  <span>{user.firstName}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                <div className="absolute right-0 mt-2 w-48 bg-white border shadow-lg rounded-lg p-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition">

                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                  >
                    Profile
                  </button>

                  <button
                    onClick={() => navigate("/orders")}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                  >
                    My Orders
                  </button>

                  {shopStatus === "ACTIVE" && user.roles?.includes("SELLER") && (
                    <button
                      onClick={() => navigate("/seller_dashboard")}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    >
                      Seller Dashboard
                    </button>
                  )}

                  {user.roles?.includes("ADMIN") && (
                    <button
                      onClick={() => navigate("/admin_homepage")}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    >
                      Admin Panel
                    </button>
                  )}

                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* ======================== */}
      {/* MAIN CONTENT */}
      {/* ======================== */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">

          {/* GUEST HERO */}
          {!user && (
            <section className="relative rounded-3xl overflow-hidden bg-[#ff3b5c] text-white px-8 py-12 shadow-sm flex flex-col md:flex-row items-center gap-8">

              <div className="relative z-10 max-w-lg">
                <h1 className="text-4xl font-extrabold mb-3 leading-tight">
                  Cravings? We deliver your campus favorites.
                </h1>
                <p className="text-white/90 text-sm mb-6">
                  Order from nearby student-loved shops. Fast delivery, simple ordering.
                </p>

                <div className="flex items-center bg-white/20 border border-white/30 px-4 py-3 rounded-full backdrop-blur-sm max-w-md">
                  <Search className="w-5 h-5 text-white/80 mr-3" />
                  <input
                    type="text"
                    placeholder="Search restaurants, cuisines, dishes..."
                    className="flex-1 bg-transparent outline-none text-white placeholder:text-white/70"
                  />
                </div>
              </div>

              <img
                src="https://images.deliveryhero.io/image/foodpanda/homepage/fp-rider-delivery-bag.png"
                className="w-56 md:w-72 lg:w-80 opacity-90 drop-shadow-xl pointer-events-none"
              />
            </section>
          )}

          {/* LOGGED-IN HERO */}
          {user && (
            <section className="relative rounded-3xl overflow-hidden bg-white shadow-sm border px-8 py-12 flex flex-col md:flex-row justify-between items-center gap-10">

              <div className="max-w-xl space-y-3">
                <span className="text-xs font-semibold tracking-wide text-fp-pink">
                  WELCOME BACK
                </span>

                <h2 className="text-4xl font-extrabold leading-snug text-gray-900">
                  Hey {user.firstName},
                  <br />what’s your craving today?
                </h2>

                <p className="text-gray-600 text-sm">
                  Choose from your favorites or discover something new from nearby shops.
                </p>

                <div className="flex gap-3 pt-3 flex-wrap">
                  <button
                    onClick={() => navigate("/shops")}
                    className="bg-fp-pink text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-fp-pink/90 shadow"
                  >
                    Browse Shops
                  </button>

                  <button
                    onClick={() => navigate("/orders")}
                    className="px-5 py-2 rounded-full text-sm border text-gray-700 hover:bg-gray-50"
                  >
                    My Orders
                  </button>

                  <button
                    onClick={() => navigate("/cart")}
                    className="px-5 py-2 rounded-full text-sm border text-gray-700 hover:bg-gray-50"
                  >
                    View Cart
                  </button>
                </div>
              </div>

              <img
                src="https://cdn-icons-png.flaticon.com/512/1046/1046749.png"
                className="w-52 drop-shadow-md opacity-95"
              />
            </section>
          )}

          {/* CUISINES */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Explore by cuisine</h2>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-slate-50 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-slate-50 to-transparent" />

              <div
                ref={cuisineRef}
                className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
              >
                {cuisines.map((c) => (
                  <button
                    key={c.name}
                    className="flex flex-col items-center min-w-[100px] bg-white rounded-xl p-3 border hover:shadow-md transition"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden mb-2 bg-slate-100">
                      <img src={c.image} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-medium">{c.name}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() =>
                  cuisineRef.current?.scrollBy({ left: 300, behavior: "smooth" })
                }
                className="hidden md:flex absolute right-2 -top-12 bg-white w-10 h-10 rounded-full shadow border items-center justify-center hover:bg-slate-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </section>

          {/* DAILY DEALS */}
          <section className="space-y-4">
            <div className="flex justify-between items-baseline">
              <h2 className="text-2xl font-bold">Daily Deals</h2>
              <span className="text-sm text-muted-foreground">
                Discounts updated every morning
              </span>
            </div>

            <div className="relative">
              <div
                ref={dealsRef}
                className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
              >
                {dailyDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className={`min-w-[260px] rounded-xl p-5 ${deal.bg} text-white shadow flex flex-col justify-between`}
                  >
                    <div>
                      <span className="text-[11px] bg-white/20 px-2 py-1 rounded">
                        {deal.logo}
                      </span>

                      <p className="text-3xl font-extrabold mt-4 leading-tight">
                        {deal.title}
                      </p>
                      <p className="text-sm text-white/90">
                        {deal.subtitle}
                      </p>
                    </div>

                    <p className="text-xs text-white/60 mt-3">
                      Terms apply. Available at selected shops.
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() =>
                  dealsRef.current?.scrollBy({ left: 300, behavior: "smooth" })
                }
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border rounded-full shadow items-center justify-center hover:bg-slate-50"
              >
                <ChevronRight />
              </button>
            </div>
          </section>

          {/* RESTAURANTS */}
          <section className="space-y-4 pb-10">
            <div className="flex justify-between items-baseline">
              <h2 className="text-2xl font-bold">Fast Delivery Near You</h2>
              <button className="text-fp-pink text-sm hover:underline">
                View All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {restaurants.map((rest) => (
                <div
                  key={rest.id}
                  className="bg-white rounded-xl overflow-hidden border hover:shadow-lg transition cursor-pointer"
                >
                  <div className="relative">
                    <img src={rest.image} className="w-full h-40 object-cover" />
                    <span className="absolute top-2 left-2 bg-fp-pink text-white text-xs px-2 py-1 rounded">
                      {rest.discount}
                    </span>
                  </div>

                  <div className="p-4 space-y-1">
                    <h3 className="font-semibold text-sm">{rest.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      ⭐ {rest.rating} • {rest.deliveryTime} • {rest.deliveryFee}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>

      {/* ======================== */}
      {/* AUTH MODAL */}
      {/* ======================== */}
      <Dialog open={authModalOpen} onOpenChange={setAuthModalOpen}>
        <DialogContent className="sm:max-w-[420px] p-0 bg-background rounded-2xl overflow-hidden">
          <div className="p-6">

            {/* MAIN VIEW */}
            {authView === "main" && (
              <>
                <DialogTitle className="text-2xl font-bold mb-2">
                  Welcome to WildEats
                </DialogTitle>
                <p className="text-muted-foreground mb-6 text-sm">
                  Order online or become a shop partner on campus.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => setAuthView("login")}
                    className="w-full border border-fp-pink text-fp-pink rounded-lg py-3 text-sm font-medium hover:bg-fp-pink/5"
                  >
                    Log in
                  </button>

                  <button
                    onClick={() => setAuthView("signup")}
                    className="w-full border rounded-lg py-3 text-sm font-medium hover:bg-slate-50"
                  >
                    Sign up
                  </button>
                </div>
              </>
            )}

            {/* LOGIN VIEW */}
            {authView === "login" && (
              <div className="space-y-4">
                <button
                  onClick={() => setAuthView("main")}
                  type="button"
                  className="text-xs mb-2 text-muted-foreground hover:text-foreground"
                >
                  ← Back
                </button>

                <DialogTitle className="text-2xl font-bold mb-1">
                  Log in
                </DialogTitle>
                <p className="text-xs text-muted-foreground mb-4">
                  Enter your email and password.
                </p>

                {/* Traditional Login Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="text-xs font-medium">Email</label>
                    <input
                      type="email"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                      className="border w-full p-2 rounded-lg text-sm"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium">Password</label>
                    <input
                      type="password"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      className="border w-full p-2 rounded-lg text-sm"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-fp-pink text-white py-3 rounded-lg text-sm font-semibold hover:bg-fp-pink/90"
                  >
                    Log in
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-500">OR</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Google Sign-In Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-lg border-2 border-gray-200 hover:border-fp-pink hover:bg-gray-50 transition-all text-sm font-medium"
                >
                  <FcGoogle size={20} />
                  <span>Continue with Google</span>
                </button>
              </div>
            )}

            {/* SIGNUP VIEW */}
            {authView === "signup" && (
              <div className="space-y-4">
                <button
                  onClick={() => setAuthView("main")}
                  type="button"
                  className="text-xs mb-2 text-muted-foreground hover:text-foreground"
                >
                  ← Back
                </button>

                <DialogTitle className="text-2xl font-bold mb-1">
                  Sign up
                </DialogTitle>
                <p className="text-xs text-muted-foreground mb-4">
                  Create your WildEats account.
                </p>

                {/* Traditional Signup Form */}
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium">First name</label>
                      <input
                        type="text"
                        placeholder="Juan"
                        value={signupForm.firstName}
                        onChange={(e) =>
                          setSignupForm({
                            ...signupForm,
                            firstName: e.target.value,
                          })
                        }
                        className="border p-2 rounded-lg text-sm w-full"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium">Last name</label>
                      <input
                        type="text"
                        placeholder="Dela Cruz"
                        value={signupForm.lastName}
                        onChange={(e) =>
                          setSignupForm({
                            ...signupForm,
                            lastName: e.target.value,
                          })
                        }
                        className="border p-2 rounded-lg text-sm w-full"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium">Email</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={signupForm.email}
                      onChange={(e) =>
                        setSignupForm({
                          ...signupForm,
                          email: e.target.value,
                        })
                      }
                      className="border p-2 rounded-lg w-full text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium">Password</label>
                    <input
                      type="password"
                      placeholder="At least 8 characters"
                      value={signupForm.password}
                      onChange={(e) => {
                        setSignupForm({
                          ...signupForm,
                          password: e.target.value,
                        });
                        updatePasswordStrength(e.target.value);
                      }}
                      className="border p-2 rounded-lg w-full text-sm"
                      required
                    />
                    {renderPasswordStrength()}
                  </div>

                  <div>
                    <label className="text-xs font-medium">Confirm password</label>
                    <input
                      type="password"
                      placeholder="Repeat your password"
                      value={signupForm.confirmPassword}
                      onChange={(e) =>
                        setSignupForm({
                          ...signupForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="border p-2 rounded-lg w-full text-sm"
                      required
                    />
                  </div>

                  {signupError && (
                    <p className="text-red-500 text-xs">{signupError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-fp-pink text-white py-3 rounded-lg text-sm font-semibold hover:bg-fp-pink/90 disabled:opacity-60"
                  >
                    {isSubmitting ? "Creating account..." : "Create account"}
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-500">OR</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Google Sign-In Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-lg border-2 border-gray-200 hover:border-fp-pink hover:bg-gray-50 transition-all text-sm font-medium"
                >
                  <FcGoogle size={20} />
                  <span>Sign up with Google</span>
                </button>
              </div>
            )}

          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
