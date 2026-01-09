import React from 'react'
import { Outlet } from 'react-router-dom'
import { useUser } from '@/contexts/UserProvider'
import { Navigate } from 'react-router-dom'
import { Spinner } from "@/components/ui/spinner";

const ProtectedLayout = () => {
  const { isAuthenticated, loading } = useUser();

  // Wait for auth check to complete before making redirect decision
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Spinner /></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <Outlet />
  )
}

export default ProtectedLayout