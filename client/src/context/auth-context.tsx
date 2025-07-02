// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { RegisterData, UpdateProfileData, User } from "../types/auth";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import axios from "axios";

// Auth context type
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<unknown>;
  register: (userData: RegisterData) => Promise<unknown>;
  updateProfile: (userData: UpdateProfileData) => Promise<unknown>;
  logout: () => void;
  profileCompleted: boolean;
  connectedUsers: string[];
}

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState<boolean>(false);
  const [profileCompleted, setProfileCompleted] = useState<boolean>(false);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setProfileCompleted(user.profile_complete || false);
    }
  }, [user]);

  const handleRequest = async (requestFn: () => Promise<unknown>, successMessage?: string) => {
    try {
      const result = await requestFn();

      if (successMessage) {
        toast({
          title: "Success",
          description: successMessage,
        });
      }

      return result;
    } catch (err) {
      const errorMsg = axios.isAxiosError(err) 
        ? err.response?.data?.message || "Operation failed" 
        : "An unexpected error occurred";

      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });

      throw err;
    }
  };

  // Load user when token changes
  const loadUser = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      console.log("User loaded:", userData);
    } catch (err) {
      console.error("Error loading user:", err);
      setToken(null);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [token]);

  // Login function
  const login = async (email: string, password: string) => {
    return await handleRequest(async () => {
      const response = await authService.login(email, password);
      const newToken = response.token;
      localStorage.setItem("token", newToken);
      setToken(newToken);
      return response;
    });
  };

  // Register function
  const register = async (userData: RegisterData) => {
    await handleRequest(
      () => authService.register(userData), 
      "Registration successful! Please log in."
    )
      .then(() => {
        login(userData.email, userData.password);
        return true;
      })
      .catch((error) => {
        return false;
      });
  };

  // Update profile function
  const updateProfile = async (userData: UpdateProfileData) => {
    await handleRequest(
      () => authService.updateProfile(userData),
      "Profile updated successfully!"
    ).then(() => loadUser());
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  // Context value
  const value = {
    user,
    token,
    loading,
    logout,
    login,
    register,
    updateProfile,
    profileCompleted,
    connectedUsers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};