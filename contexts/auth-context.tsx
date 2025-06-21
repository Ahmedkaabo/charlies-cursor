"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"

export type UserRole = "admin" | "manager" | "hr" | "viewer" | null

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  branch_ids: string[];
  role: UserRole;
  token_version: number;
  permissions?: Record<string, boolean>;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isInitialized: boolean;
  permissions: Record<string, boolean>;
  hasPermission: (perm: string) => boolean;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getUserBranches: () => string[];
  getPermission: (module: string, type: 'view' | 'edit') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [permissions, setPermissions] = useState<Record<string, boolean>>({})

  const logout = useCallback(() => {
    setCurrentUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem("currentUser")
  }, [])

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
  }, [logout])

  useEffect(() => {
    if (!currentUser) {
      setPermissions({})
      return
    }
    // Prefer user-specific permissions, else load from roles table
    if (currentUser.permissions) {
      setPermissions(currentUser.permissions)
    } else if (currentUser.role) {
      // Fetch from roles table
      supabase
        .from('roles')
        .select('permissions')
        .eq('name', currentUser.role)
        .single()
        .then(({ data }) => {
          setPermissions(data?.permissions || {})
        })
    }
  }, [currentUser])

  const hasPermission = useCallback((perm: string) => {
    return !!permissions[perm]
  }, [permissions])

  const login = useCallback((user: AuthUser) => {
    setCurrentUser(user)
    setIsLoggedIn(true)
    localStorage.setItem("currentUser", JSON.stringify(user))
  }, [])

  const loginWithCredentials = async (email: string, password: string) => {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password", password) // Note: In a real app, hash passwords!
      .single();

    if (error || !user) {
      throw new Error("Invalid email or password.");
    }
    
    // The user from the DB is valid, log them in.
    login(user);
  };

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

  function getPermission(module: string, type: 'view' | 'edit'): boolean {
    // Prefer user-specific permissions
    const userPerm = currentUser?.permissions?.[module]
    if (userPerm && typeof userPerm === 'object' && userPerm !== null && type in userPerm) {
      return !!userPerm[type]
    } else if (typeof userPerm === 'boolean' && type === 'view') {
      // Legacy: treat boolean as view only
      return userPerm
    }
    // Fallback to role permissions
    const rolePerm = permissions?.[module]
    if (rolePerm && typeof rolePerm === 'object' && rolePerm !== null && type in rolePerm) {
      return !!rolePerm[type]
    } else if (typeof rolePerm === 'boolean' && type === 'view') {
      // Legacy: treat boolean as view only
      return rolePerm
    }
    return false
  }

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
      permissions,
      hasPermission,
      loginWithCredentials, 
      logout,
      getUserBranches,
      getPermission
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
