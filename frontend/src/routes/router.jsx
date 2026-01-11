import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
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
import { TicTacToeGame, TicTacToeLobby, GomokuGame, GomokuLobby } from '../features/games/components'

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
            // Redirect from / to /games
            index: true,
            element: <Navigate to="/games" replace />,
          },
          {
            // Games selection page
            element: <Games />,
            path: "games",
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
          {
            // TicTacToe Lobby
            element: <TicTacToeLobby />,
            path: "games/tic-tac-toe",
          },
          {
            // TicTacToe Game
            element: <TicTacToeGame />,
            path: "games/tic-tac-toe/play",
          },
          {
            // Gomoku Lobby
            element: <GomokuLobby />,
            path: "games/gomoku",
          },
          {
            // Gomoku Game
            element: <GomokuGame />,
            path: "games/gomoku/play",
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