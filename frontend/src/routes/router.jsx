import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout.jsx'
import ProtectedLayout from '@/layouts/ProtectedLayout.jsx'
import AdminProtectedLayout from '@/layouts/AdminProtectedLayout.jsx'
import UserLayout from '../layouts/UserLayout.jsx'
import AdminLayout from '../layouts/AdminLayout.jsx'

import Auth from '../features/auth/pages/Auth.jsx'
import Games from '../features/games/pages/Games.jsx'
import Ranking from '../features/ranking/pages/Ranking.jsx'
import Social from '../features/social/pages/social.jsx'
import Profile from '../features/profile/pages/Profile.jsx'
import UserManagement from '../features/userManagement/pages/UserManagement.jsx'
import NotFound from '@/features/errors/pages/NotFound.jsx'
import Statistics from '@/features/statistics/pages/Statistics.jsx'
import GameConfig from '@/features/gameConfig/pages/gameConfig.jsx'

const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        element: <Auth />,
        index: true,
      },
    ],
  },
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      {
        element: <UserLayout />,
        children: [
          {
            element: <Games />,
            index: true,
          },
          {
            element: <Ranking />,
            path: "ranking",
          },
          {
            element: <Social />,
            path: "social",
          },
          {
            element: <Profile />,
            path: "profile",
          },
        ],
      },
      {
        path: "/admin",
        element: <AdminProtectedLayout />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              {
                element: <UserManagement />,
                index: true,
              },
              {
                element: <Statistics />,
                path: "statistics",
              },
              {
                element: <GameConfig />,
                path: "game-config",
              },
              {
                element: <Profile />,
                path: "profile",
              }
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
  
export default router