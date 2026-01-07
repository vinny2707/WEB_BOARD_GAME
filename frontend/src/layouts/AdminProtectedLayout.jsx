import React from 'react'
import { useUser } from '@/contexts/UserProvider'
import { Navigate } from 'react-router-dom'
import { Outlet } from 'react-router-dom'

const AdminProtectedLayout = () => {
  const { isAuthenticated, isAdmin } = useUser();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <Outlet />
  )
}

export default AdminProtectedLayout