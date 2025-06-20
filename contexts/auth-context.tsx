"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

type UserRole = "admin" | "manager" | null // Null when not logged in

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  branch_ids: string[];
  role: UserRole;
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
    // Initialize auth state from localStorage on mount
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setCurrentUser(user)
        setIsLoggedIn(true)
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        localStorage.removeItem("currentUser")
      }
    }
    setIsInitialized(true)
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
    
    // Admin users have access to all branches (represented by empty array or special value)
    if (currentUser.role === "admin") {
      return [] // Empty array means all branches
    }
    
    // Manager users only have access to their assigned branches
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
