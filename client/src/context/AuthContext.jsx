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

  
  const checkAuthStatus = async () => {
    try {
    
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
      
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setAuthenticated(true);
      }

     
      const response = await axiosInstance.get(API_PATH.AUTH.GET_PROFILE);
      const serverUser = response.data;

    
      localStorage.setItem("user", JSON.stringify(serverUser));
      setUser(serverUser);
      setAuthenticated(true);
      
     
      subscribeToPushNotifications();
    } catch (error) {
     
      console.error("Auth check failed:", error?.response?.status || error.message);
      localStorage.removeItem("user");
      setUser(null);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  
  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setAuthenticated(true);
    
   
    subscribeToPushNotifications();
  };


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
