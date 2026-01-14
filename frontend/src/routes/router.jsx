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
          {
            // Caro4 Lobby
            element: <Caro4Lobby />,
            path: "games/caro4",
          },
          {
            // Caro4 Game
            element: <Caro4Game />,
            path: "games/caro4/play",
          },
          {
            // Snake Lobby
            element: <SnakeLobby />,
            path: "games/snake",
          },
          {
            // Snake Game
            element: <SnakeGame />,
            path: "games/snake/play",
          },
          {
            // Match3 Lobby
            element: <Match3Lobby />,
            path: "games/match3",
          },
          {
            // Match3 Game
            element: <Match3Game />,
            path: "games/match3/play",
          },
          {
            // Memory Lobby
            element: <MemoryLobby />,
            path: "games/memory",
          },
          {
            // Memory Game
            element: <MemoryGame />,
            path: "games/memory/play",
          },
          {
            // Drawing Lobby
            element: <DrawingLobby />,
            path: "games/drawing",
          },
          {
            // Drawing Game
            element: <DrawingGame />,
            path: "games/drawing/play",
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