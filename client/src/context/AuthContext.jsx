import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATH } from "../utils/apiPath";
import { subscribeToPushNotifications } from "../utils/pushNotifications";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // With cookie-based JWT, we verify auth by calling GET /api/auth/me
  // If the cookie is valid, the server returns user data
  // If the cookie is expired/missing, it returns 401
  const checkAuthStatus = async () => {
    try {
      // First check if we have cached user data in localStorage
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        // We have cached data — set it immediately for fast UI render
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setAuthenticated(true);
      }

      // Then verify with the server (cookie will be sent automatically)
      const response = await axiosInstance.get(API_PATH.AUTH.GET_PROFILE);
      const serverUser = response.data;

      // Update with fresh data from server
      localStorage.setItem("user", JSON.stringify(serverUser));
      setUser(serverUser);
      setAuthenticated(true);
      
      // Initialize Push Notifications
      subscribeToPushNotifications();
    } catch (error) {
      // Cookie is invalid/expired — clear everything
      console.error("Auth check failed:", error?.response?.status || error.message);
      localStorage.removeItem("user");
      setUser(null);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // After login, the server sets the httpOnly cookie automatically
  // We just need to save user data for the UI
  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setAuthenticated(true);
    
    // Initialize Push Notifications
    subscribeToPushNotifications();
  };

  // Call the server to clear the cookie, then clean up local state
  const logout = async () => {
    try {
      await axiosInstance.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout API error:", error);
    }
    localStorage.removeItem("user");
    setUser(null);
    setAuthenticated(false);
    window.location.href = "/";
  };

  const updateUser = (updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData };
    localStorage.setItem("user", JSON.stringify(newUserData));
    setUser(newUserData);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
