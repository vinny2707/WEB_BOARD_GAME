import React from 'react'
import Admin_Sidebar from '../components/Admin_Sidebar.jsx'
import {Outlet} from 'react-router-dom'

const AdminLayout = () => {
  return (
    <div className="w-full h-screen flex overflow-hidden">
      <Admin_Sidebar className="w-1/4" />
      <Outlet className="flex-1 overflow-auto" />
    </div>
  );
}

export default AdminLayout