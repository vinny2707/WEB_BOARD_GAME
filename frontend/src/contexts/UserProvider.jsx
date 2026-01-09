import React from "react";
import { createContext, useContext, useState, useMemo, useEffect } from "react";
import api from "../api/axios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Login function to set user and store token
  const login = (token, userData) => {
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
  };

  // Logout function to clear user and remove token
  const logout = () => {
    try {
      delete api.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.get("api/auth/profile");
        setUser(response.data.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // If profile fetch fails, clear the invalid token
        localStorage.removeItem("token");
        delete api.defaults.headers.common["Authorization"];
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
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

  // Don't render router until initial auth check is done
  if (loading) {
    return (
      <UserContext.Provider value={value}>
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      </UserContext.Provider>
    );
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  return useContext(UserContext);
};
