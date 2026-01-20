import React from "react";
import { createContext, useContext, useState, useMemo, useEffect } from "react";
import api from "../api/axios";
import { Spinner } from "@/components/ui/spinner";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Login function to set user and store token
  const login = (token, userData) => {
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser({
      ...userData,
      dob: userData.dob
        ? userData.dob.split("T")[0]
        : null,
      avatar_id: userData.avatar_id || null,
      avatar_url: userData.avatar_url || null,
    });
  };

  // Logout function to clear user and remove token
  const logout = async () => {
    try {
      // Call backend to invalidate token in DB
      const token = localStorage.getItem("token");
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        try {
          await api.post("/api/auth/logout");
        } catch (error) {
          // Even if backend call fails, still clear local state
          console.error("Error calling logout API:", error);
        }
      }

      // Clear local state
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
      console.log(
        "[UserProvider] Token from localStorage:",
        token ? "exists" : "missing"
      );

      if (!token) {
        console.log("[UserProvider] No token found, setting user to null");
        setUser(null);
        setLoading(false);
        return;
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      try {
        // Set 10 second timeout for auth check
        const response = await api.get("/api/auth/profile", {
          timeout: 10000,
        });
        const userData = response.data?.data;

        if (!userData) {
          throw new Error("No user data in response");
        }

        const processedUser = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          full_name: userData.full_name,
          dob: userData.dob
            ? userData.dob.split("T")[0]
            : null,
          role: userData.role,
          status: userData.status,
          created_at: userData.created_at,
          last_login: userData.last_login,
          avatar_id: userData.avatar_id || null,
          avatar_url: userData.avatar_url || null,
        };

        setUser(processedUser);
      } catch (error) {
        console.error("[UserProvider] Error fetching user profile:", {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        });
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

  // Update user data (e.g., after profile update)
  const updateUser = async () => {
    try {
      const response = await api.get("/api/auth/profile", { timeout: 10000 });
      const userData = response.data?.data;
      if (userData) {
        setUser({
          id: userData.id,
          username: userData.username,
          email: userData.email,
          full_name: userData.full_name,
          dob: userData.dob ? userData.dob.split("T")[0] : null,
          role: userData.role,
          status: userData.status,
          created_at: userData.created_at,
          last_login: userData.last_login,
          avatar_id: userData.avatar_id || null,
          avatar_url: userData.avatar_url || null,
        });
      }
    } catch (error) {
      console.error("[UserProvider] Error updating user:", error);
    }
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      updateUser,
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
          <Spinner size="lg" />
        </div>
      </UserContext.Provider>
    );
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  return useContext(UserContext);
};
