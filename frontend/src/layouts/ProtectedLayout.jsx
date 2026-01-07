import React from 'react'
import { Outlet } from 'react-router-dom'
import { useUser } from '@/contexts/UserProvider'
import { Navigate } from 'react-router-dom'

const ProtectedLayout = () => {
  const { isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <Outlet />
  )
}

export default ProtectedLayout