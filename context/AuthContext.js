import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores the logged-in user
  const [clickCount, setClickCount] = useState(0); // Tracks button clicks
  const [users, setUsers] = useState([]); // Mock database for users

  // Function to register a new user
  const registerUser = (newUser) => {
    setUsers((prevUsers) => [...prevUsers, newUser]);
  };

  // Function to authenticate a user on login
  const authenticateUser = (username, password) => {
    return users.find(
      (u) => u.username === username && u.password === password
    );
  };

  // Function to increment the click count
  const incrementClickCount = () => {
    setClickCount((prev) => prev + 1);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        clickCount,
        incrementClickCount,
        registerUser,
        authenticateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);
