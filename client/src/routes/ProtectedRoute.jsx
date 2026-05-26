import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ requiredRole, requiredRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isRoleAllowed = () => {
    if (requiredRoles && requiredRoles.length > 0) {
      return requiredRoles.includes(user.role);
    }
    if (requiredRole) {
      return user.role === requiredRole;
    }
    return true; // No role restriction
  };

  if (!isRoleAllowed()) {
    // Redirect to appropriate dashboard based on role
    if (user.role === "employer") {
      return <Navigate to="/employer-dashboard" replace />;
    } else {
      return <Navigate to="/find-jobs" replace />;
    }
  }



  return <Outlet />;
};

export default ProtectedRoute;
