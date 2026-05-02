import axios from "axios";

import { BASE_URL } from "./apiPath";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 80000,
  withCredentials: true, // ← Sends/receives httpOnly cookies automatically
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// No need for Bearer token interceptor — the cookie is sent automatically
// by the browser with every request because of `withCredentials: true`

// Helper to rewrite hardcoded database URLs to the current BASE_URL
export const fixLegacyUrls = (obj) => {
  if (typeof obj === "string") {
    // Fix both absolute and accidentally stored relative paths
    let fixed = obj.replace(/http:\/\/localhost:8000/g, BASE_URL);
    if (fixed.startsWith("/uploads/")) {
      fixed = `${BASE_URL}${fixed}`;
    }
    return fixed;
  }
  if (Array.isArray(obj)) {
    return obj.map(fixLegacyUrls);
  }
  if (obj !== null && typeof obj === "object") {
    const newObj = {};
    for (const key in obj) {
      newObj[key] = fixLegacyUrls(obj[key]);
    }
    return newObj;
  }
  return obj;
};

// response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = fixLegacyUrls(response.data);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle common errors globally
      if (error.response.status === 401) {
        // Cookie expired or invalid — redirect to login
        // Only redirect if not already on login/signup pages
        const path = window.location.pathname;
        if (path !== "/" && path !== "/login" && path !== "/signup") {
          window.location.href = "/";
        }
      } else if (error.response.status === 500) {
        console.error("Server error. Please try again later.");
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timed out. Please try again later.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
