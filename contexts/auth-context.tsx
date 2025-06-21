"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"

type UserRole = "admin" | "manager" | null // Null when not logged in

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  branch_ids: string[];
  role: UserRole;
  token_version: number;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isInitialized: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  getUserBranches: () => string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const checkUserSession = async () => {
      const storedUserJson = localStorage.getItem("currentUser");
      if (storedUserJson) {
        try {
          const localUser: AuthUser = JSON.parse(storedUserJson);

          // Fetch the latest user data from the database
          const { data: dbUser, error } = await supabase
            .from("users")
            .select("id, token_version")
            .eq("id", localUser.id)
            .single();

          // If user not found in DB or token version mismatch, force logout
          if (error || !dbUser || dbUser.token_version !== localUser.token_version) {
            logout();
          } else {
            setCurrentUser(localUser);
            setIsLoggedIn(true);
          }
        } catch (error) {
          console.error("Failed to parse or validate stored user:", error);
          logout(); // Corrupted local storage, force logout
        }
      }
      setIsInitialized(true);
    };

    checkUserSession();
  }, [])

  const login = useCallback((user: AuthUser) => {
    setCurrentUser(user)
    setIsLoggedIn(true)
    localStorage.setItem("currentUser", JSON.stringify(user))
  }, [])

  const logout = useCallback(() => {
    setCurrentUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem("currentUser")
  }, [])

  const getUserBranches = useCallback(() => {
    if (!currentUser) return []
    
    // Returns the branch_ids for the logged-in user.
    // The logic to grant "all access" to admins is handled in the
    // specific contexts (like BranchProvider and EmployeeProvider)
    // using the `isAdmin` flag.
    return currentUser.branch_ids || []
  }, [currentUser])

  const isAdmin = currentUser?.role === "admin"
  const isManager = currentUser?.role === "manager"

  if (!isInitialized) {
    return null
  }

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isLoggedIn, 
      isAdmin, 
      isManager, 
      isInitialized, 
      login, 
      logout,
      getUserBranches 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
