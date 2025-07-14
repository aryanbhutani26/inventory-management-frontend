import React, { createContext, useContext, useState, useCallback } from "react";
import { UserRole } from "./AuthContext";

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  lastLogin?: string;
  department?: string;
  phone?: string;
  permissions: string[];
}

interface UserContextType {
  users: User[];
  addUser: (userData: Omit<User, "id" | "createdAt">) => Promise<boolean>;
  updateUser: (id: string, userData: Partial<User>) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  getUser: (id: string) => User | undefined;
  getUsersByRole: (role: UserRole) => User[];
  searchUsers: (query: string) => User[];
  toggleUserStatus: (id: string) => Promise<boolean>;
  resetUserPassword: (id: string) => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock data for demonstration
const mockUsers: User[] = [
  {
    id: "1",
    username: "admin",
    email: "admin@transportpro.com",
    fullName: "System Administrator",
    role: "admin",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    lastLogin: "2024-01-20T10:30:00Z",
    department: "IT Administration",
    phone: "+91 98765 43210",
    permissions: ["all"],
  },
  {
    id: "2",
    username: "staff",
    email: "staff@transportpro.com",
    fullName: "Transport Staff",
    role: "staff",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    lastLogin: "2024-01-20T09:15:00Z",
    department: "Operations",
    phone: "+91 98765 43211",
    permissions: ["trips.view", "trips.create", "inventory.view"],
  },
  {
    id: "3",
    username: "johndoe",
    email: "john.doe@transportpro.com",
    fullName: "John Doe",
    role: "staff",
    status: "active",
    createdAt: "2024-01-05T00:00:00Z",
    lastLogin: "2024-01-19T16:45:00Z",
    department: "Logistics",
    phone: "+91 98765 43212",
    permissions: ["trips.view", "trips.create"],
  },
  {
    id: "4",
    username: "janesmith",
    email: "jane.smith@transportpro.com",
    fullName: "Jane Smith",
    role: "admin",
    status: "active",
    createdAt: "2024-01-10T00:00:00Z",
    lastLogin: "2024-01-20T08:20:00Z",
    department: "Management",
    phone: "+91 98765 43213",
    permissions: ["all"],
  },
  {
    id: "5",
    username: "mikewilson",
    email: "mike.wilson@transportpro.com",
    fullName: "Mike Wilson",
    role: "staff",
    status: "inactive",
    createdAt: "2024-01-15T00:00:00Z",
    lastLogin: "2024-01-18T14:30:00Z",
    department: "Fleet Management",
    phone: "+91 98765 43214",
    permissions: ["inventory.view", "inventory.create"],
  },
  {
    id: "6",
    username: "sarahbrown",
    email: "sarah.brown@transportpro.com",
    fullName: "Sarah Brown",
    role: "staff",
    status: "suspended",
    createdAt: "2024-01-12T00:00:00Z",
    lastLogin: "2024-01-17T11:00:00Z",
    department: "Finance",
    phone: "+91 98765 43215",
    permissions: ["reports.view"],
  },
];

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(mockUsers);

  const addUser = useCallback(
    async (userData: Omit<User, "id" | "createdAt">): Promise<boolean> => {
      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Check if username or email already exists
        const usernameExists = users.some(
          (user) => user.username === userData.username,
        );
        const emailExists = users.some((user) => user.email === userData.email);

        if (usernameExists || emailExists) {
          throw new Error("Username or email already exists");
        }

        const newUser: User = {
          ...userData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };

        setUsers((prev) => [...prev, newUser]);
        return true;
      } catch (error) {
        console.error("Error adding user:", error);
        return false;
      }
    },
    [users],
  );

  const updateUser = useCallback(
    async (id: string, userData: Partial<User>): Promise<boolean> => {
      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        setUsers((prev) =>
          prev.map((user) =>
            user.id === id ? { ...user, ...userData } : user,
          ),
        );
        return true;
      } catch (error) {
        console.error("Error updating user:", error);
        return false;
      }
    },
    [],
  );

  const deleteUser = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Prevent deleting the last admin
        const user = users.find((u) => u.id === id);
        if (user?.role === "admin") {
          const adminCount = users.filter((u) => u.role === "admin").length;
          if (adminCount <= 1) {
            throw new Error("Cannot delete the last admin user");
          }
        }

        setUsers((prev) => prev.filter((user) => user.id !== id));
        return true;
      } catch (error) {
        console.error("Error deleting user:", error);
        return false;
      }
    },
    [users],
  );

  const getUser = useCallback(
    (id: string): User | undefined => {
      return users.find((user) => user.id === id);
    },
    [users],
  );

  const getUsersByRole = useCallback(
    (role: UserRole): User[] => {
      return users.filter((user) => user.role === role);
    },
    [users],
  );

  const searchUsers = useCallback(
    (query: string): User[] => {
      if (!query.trim()) return users;

      const lowercaseQuery = query.toLowerCase();
      return users.filter(
        (user) =>
          user.username.toLowerCase().includes(lowercaseQuery) ||
          user.email.toLowerCase().includes(lowercaseQuery) ||
          user.fullName.toLowerCase().includes(lowercaseQuery) ||
          user.department?.toLowerCase().includes(lowercaseQuery),
      );
    },
    [users],
  );

  const toggleUserStatus = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const user = users.find((u) => u.id === id);
        if (!user) return false;

        const newStatus = user.status === "active" ? "inactive" : "active";
        return await updateUser(id, { status: newStatus });
      } catch (error) {
        console.error("Error toggling user status:", error);
        return false;
      }
    },
    [users, updateUser],
  );

  const resetUserPassword = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // In a real app, this would trigger a password reset email
        console.log(`Password reset requested for user ID: ${id}`);
        return true;
      } catch (error) {
        console.error("Error resetting password:", error);
        return false;
      }
    },
    [],
  );

  const value: UserContextType = {
    users,
    addUser,
    updateUser,
    deleteUser,
    getUser,
    getUsersByRole,
    searchUsers,
    toggleUserStatus,
    resetUserPassword,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
