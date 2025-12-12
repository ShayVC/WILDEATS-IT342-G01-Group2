import axios from "axios";

const API_BASE = "http://localhost:8080";

const instance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Automatically attach JWT token
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Optional: global error logging
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    throw error;
  }
);

export default instance;
