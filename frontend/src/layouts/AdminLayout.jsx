import React from "react";
import Admin_Sidebar from "../components/Admin_Sidebar.jsx";
import MobileNav from "../components/MobileNav.jsx";
import { Outlet } from "react-router-dom";
import { Users, BarChart3, Gamepad2, User } from "lucide-react";

const AdminLayout = () => {
  const navItems = [
    {
      icon: Users,
      label: "User Management",
      path: "/admin",
    },
    {
      icon: BarChart3,
      label: "Statistics",
      path: "/admin/statistics",
    },
    {
      icon: Gamepad2,
      label: "Game Config",
      path: "/admin/game-config",
    },
    {
      icon: User,
      label: "Profile",
      path: "/admin/profile",
    },
  ];

  return (
    <div className="w-full h-screen flex overflow-hidden">
      <Admin_Sidebar className="w-1/4" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileNav navItems={navItems} />
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
