"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

type UserRole = "admin" | "manager" | null // Null when not logged in

interface AuthContextType {
  role: UserRole
  isLoggedIn: boolean
  isAdmin: boolean
  isManager: boolean
  login: (role: UserRole) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false) // To prevent hydration mismatch

  useEffect(() => {
    // Initialize auth state from localStorage on mount
    const storedRole = localStorage.getItem("userRole") as UserRole
    if (storedRole) {
      setRole(storedRole)
      setIsLoggedIn(true)
    }
    setIsInitialized(true)
  }, [])

  const login = useCallback((userRole: UserRole) => {
    setRole(userRole)
    setIsLoggedIn(true)
    localStorage.setItem("userRole", userRole || "")
  }, [])

  const logout = useCallback(() => {
    setRole(null)
    setIsLoggedIn(false)
    localStorage.removeItem("userRole")
    // Clear all other local storage data on logout for a clean slate
    // localStorage.removeItem("employees")
    // localStorage.removeItem("branches")
  }, [])

  const isAdmin = role === "admin"
  const isManager = role === "manager"

  // Only render children once auth state is initialized to prevent hydration errors
  if (!isInitialized) {
    return null
  }

  return (
    <AuthContext.Provider value={{ role, isLoggedIn, isAdmin, isManager, login, logout }}>
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
