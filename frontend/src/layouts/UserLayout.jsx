import React from 'react'
import Sidebar from '../components/Sidebar.jsx'
import {Outlet} from 'react-router-dom'

const UserLayout = () => {
  return (
    <div className="w-full flex">
      <Sidebar className="w-1/4" />
      <Outlet className="flex-1" />
    </div>
  )
}

export default UserLayout