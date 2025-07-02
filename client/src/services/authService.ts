// src/services/authService.ts
import api from "./api";
import { RegisterData, UpdateProfileData } from "../types/auth";
import axios from "axios";
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/signin", { email, password });
    
    return response.data;
  },

  register: async (userData: RegisterData) => {
    const response = await api.post("/auth/signup", userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/users/me");
    return response.data;
  },

  forgotPassword: (email: string) => {
    return api.post(`/auth/forgot-password`, { email });
  },

  resetPassword: (token: string, newPassword: string) => {
    return api.post(`/auth/reset-password`, { token, newPassword });
  },

  verifyEmail: (token: string) => {
    return api.post(`/auth/verify-email`, { token });
  },

  resendVerification: (email: string) => {
    return api.post(`/auth/resend-verification`, { email });
  },
  updateProfile: async (userData: UpdateProfileData) => {
    const convertedData = new FormData();

    Object.entries(userData).forEach(([key, value]) => {
      if (key === "profile_picture" && value instanceof File) {
        convertedData.append(key, value as File);
      } else if (key === "interests" && value) {
        (value as string[]).forEach((interest) => {
          convertedData.append("interests[]", interest);
        });
      } else if (key === "sexual_preferences" && value) {
        (value as string[]).forEach((preference) => {
          convertedData.append("sexual_preferences[]", preference);
        });
      } else if (key === "location" && value) {
        Object.entries(value as Record<string, string>).forEach(([locKey, locValue]) => {
          convertedData.append(`location[${locKey}]`, locValue);
        });
      } else if (key === "pictures" && value) {
        (value as File[]).forEach((picture) => {
          convertedData.append("pictures[]", picture);
        });
      } else {
        convertedData.append(key, value as string);
      }
    });

    const response = await axios.put("http://localhost:3000/users/profile", convertedData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    return response.data;
  },
};
