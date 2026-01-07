import React from 'react'
import Sidebar from '../components/Sidebar.jsx'
import {Outlet} from 'react-router-dom'

const UserLayout = () => {
  return (
    <div className="w-full min-h-screen flex">
      <Sidebar />
      <Outlet />
    </div>
  )
}

export default UserLayout