import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserProvider";
import { Navigate } from "react-router-dom";

const ProtectedLayout = () => {
  const { isAuthenticated, isAdmin } = useUser();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect admin to admin page if they try to access user routes
  if (isAdmin && location.pathname === "/") {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};

export default ProtectedLayout;
