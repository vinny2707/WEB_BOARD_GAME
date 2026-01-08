import React from 'react'
import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import api from '../api/axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Login function to set user and store token
  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  // Logout function to clear user and remove token
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  }

  useEffect(() => { 
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/auth/profile');
        setUser(response.data.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);
  
  const value = useMemo(
    () => ({
      user,
      setUser,
      login,
      logout,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
    }),
    [user]
  );

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  return useContext(UserContext);
}