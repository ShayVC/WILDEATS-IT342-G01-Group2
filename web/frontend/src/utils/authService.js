import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

// Base axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Debug logs
api.interceptors.request.use((config) => {
  console.log("API →", config.method.toUpperCase(), config.baseURL + config.url);
  return config;
});

api.interceptors.response.use(
  (res) => {
    console.log("API ←", res.status, res.data);
    return res;
  },
  (err) => {
    console.error("API ERROR:", err.message);
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", err.response.data);
    }
    return Promise.reject(err);
  }
);

/* ----------------------------------------------
   FALLBACK MOCK MODE (Only when backend is offline)
------------------------------------------------ */
let MOCK_USERS = [
  {
    id: 1,
    name: "Shop Owner",
    email: "shop.owner@gmail.com",
    password: "password",
    role: "SELLER",
  },
  {
    id: 2,
    name: "Customer User",
    email: "customer@gmail.com",
    password: "password",
    role: "CUSTOMER",
  },
];

// Load stored mock users
const saved = localStorage.getItem("mockUsers");
if (saved) {
  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) MOCK_USERS = parsed;
  } catch (_) {}
}

/* ----------------------------------------------
   LOGIN
------------------------------------------------ */
export const login = async (email, password) => {
  try {
    console.log("Login → Backend", email);

    const body = { email, password };

    // BACKEND REQUEST
    const response = await api.post("/login", body);

    // Expected backend return shape:
    // { user: {..}, token: "..." }
    return response.data;
  } catch (err) {
    // If backend gives a specific error message:
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }

    // FALLBACK: BACKEND OFFLINE → Try mock login
    if (!err.response) {
      console.warn("Login fallback → Mock Mode");

      const user = MOCK_USERS.find(
        (u) => u.email === email && u.password === password
      );

      if (!user) throw new Error("Invalid email or password");

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token: "MOCK_TOKEN_" + user.id,
      };
    }

    throw err;
  }
};

/* ----------------------------------------------
   REGISTER
------------------------------------------------ */
export const register = async (name, email, password, confirmPassword) => {
  try {
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    const body = { name, email, password };

    const response = await api.post("/register", body);

    // Expected backend return: { user, token }
    return response.data;
  } catch (err) {
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }

    // FALLBACK: BACKEND OFFLINE → Mock Mode
    if (!err.response) {
      console.warn("Register fallback → Mock Mode");

      if (MOCK_USERS.some((u) => u.email === email)) {
        throw new Error("Email already in use");
      }

      const newUser = {
        id: Math.floor(Math.random() * 9000),
        name,
        email,
        password,
        role: email.startsWith("shop.") ? "SELLER" : "CUSTOMER",
      };

      MOCK_USERS.push(newUser);
      localStorage.setItem("mockUsers", JSON.stringify(MOCK_USERS));

      return {
        user: {
          id: newUser.id,
          name,
          email,
          role: newUser.role,
        },
        token: "MOCK_TOKEN_" + newUser.id,
      };
    }

    throw err;
  }
};

/* ----------------------------------------------
   CHECK AUTH
------------------------------------------------ */
export const checkAuth = async () => {
  try {
    const response = await api.get("/check");
    return response.data;
  } catch {
    throw new Error("Authentication check failed");
  }
};

/* ----------------------------------------------
   AUTH HEADER
------------------------------------------------ */
export const getAuthHeader = () => {
  const stored = localStorage.getItem("currentUser");
  if (!stored) return {};

  const user = JSON.parse(stored);

  if (user?.token) {
    return { Authorization: `Bearer ${user.token}` };
  }

  return {};
};

export default {
  login,
  register,
  checkAuth,
  getAuthHeader,
};