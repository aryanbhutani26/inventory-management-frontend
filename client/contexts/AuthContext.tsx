import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "admin" | "staff";

export interface User {
  id: string;
  username: string;
  role: UserRole;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demo
const mockUsers: Array<User & { password: string }> = [
  { id: "1", username: "admin", password: "admin123", role: "admin" },
  { id: "2", username: "staff", password: "staff123", role: "staff" },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const foundUser = mockUsers.find(
      (u) => u.username === username && u.password === password,
    );

    if (foundUser) {
      const userWithoutPassword = {
        id: foundUser.id,
        username: foundUser.username,
        role: foundUser.role,
        lastLogin: new Date().toISOString(),
      };
      setUser(userWithoutPassword);
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const logout = () => {
    try {
      // Clear user state
      setUser(null);

      // Clear localStorage
      localStorage.removeItem("user");

      // Clear any other session data if needed
      localStorage.removeItem("authToken");
      localStorage.removeItem("sessionId");

      // Clear sessionStorage as well
      sessionStorage.clear();

      console.log("User logged out successfully");
    } catch (error) {
      console.error("Error during logout:", error);
      // Force clear even if there's an error
      setUser(null);
      localStorage.clear();
    }
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
