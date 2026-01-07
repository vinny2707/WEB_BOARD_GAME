import React from 'react'
import { createContext, useContext, useState, useMemo } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  const value = useMemo(
    () => ({
      user,
      setUser,
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