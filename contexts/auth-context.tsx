"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

type UserRole = "admin" | "manager" | null // Null when not logged in

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  branchIds: string[];
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
      setCurrentUser(JSON.parse(storedUser))
      setIsLoggedIn(true)
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

  const isAdmin = currentUser?.role === "admin"
  const isManager = currentUser?.role === "manager"

  if (!isInitialized) {
    return null
  }

  return (
    <AuthContext.Provider value={{ currentUser, isLoggedIn, isAdmin, isManager, isInitialized, login, logout }}>
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
