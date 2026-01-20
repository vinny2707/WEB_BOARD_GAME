import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserProvider";
import { Navigate } from "react-router-dom";

const ProtectedLayout = () => {
  // Removed authentication check to allow access without login
  return <Outlet />;
};

export default ProtectedLayout;
