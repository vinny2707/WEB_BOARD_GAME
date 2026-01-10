import React from "react";
import Sidebar from "../components/Sidebar.jsx";
import MobileNav from "../components/MobileNav.jsx";
import { Outlet } from "react-router-dom";
import { Gamepad2, Trophy, Users, User } from "lucide-react";

const UserLayout = () => {
  const navItems = [
    {
      icon: Gamepad2,
      label: "Games",
      path: "/",
    },
    {
      icon: Trophy,
      label: "Ranking",
      path: "/ranking",
    },
    {
      icon: Users,
      label: "Social",
      path: "/social",
      badge: 3,
    },
    {
      icon: User,
      label: "Profile",
      path: "/profile",
    },
  ];

  return (
    <div className="w-full h-screen flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileNav navItems={navItems} />
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
