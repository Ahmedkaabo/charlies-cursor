import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  password: string
  branchIds: string[]
  role: "manager" | "admin"
}

interface UserContextType {
  users: User[]
  addUser: (user: Omit<User, "id">) => Promise<void>
  updateUser: (id: string, updates: Partial<User>) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const DEFAULT_ADMIN_USER: User = {
  id: "admin-1",
  firstName: "Admin",
  lastName: "User",
  email: "admin@charlies.com",
  password: "Medo123!'",
  branchIds: [], // Will have access to all branches
  role: "admin",
}

const TEST_USER: User = {
  id: "user-omar",
  firstName: "Omar",
  lastName: "Mohamed",
  email: "omar@charlies.com",
  password: "test123",
  branchIds: ["branch-1", "branch-2"],
  role: "manager",
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch users from Supabase on mount
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      const { data, error } = await supabase.from("users").select("*")
      if (error) {
        console.error("Error fetching users:", error)
        setUsers([])
      } else {
        setUsers(data || [])
      }
      setIsLoading(false)
    }
    fetchUsers()
  }, [])

  const addUser = useCallback(async (user: Omit<User, "id">) => {
    const { data, error } = await supabase.from("users").insert([user]).select()
    if (error) {
      console.error("Error adding user:", error)
      return
    }
    if (data && data.length > 0) {
      setUsers((prev) => [...prev, data[0]])
    }
  }, [])

  const updateUser = useCallback(async (id: string, updates: Partial<User>) => {
    const { data, error } = await supabase.from("users").update(updates).eq("id", id).select()
    if (error) {
      console.error("Error updating user:", error)
      return
    }
    if (data && data.length > 0) {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data[0] } : u)))
    }
  }, [])

  const deleteUser = useCallback(async (id: string) => {
    const { error } = await supabase.from("users").delete().eq("id", id)
    if (error) {
      console.error("Error deleting user:", error)
      return
    }
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }, [])

  return (
    <UserContext.Provider value={{ users, addUser, updateUser, deleteUser, isLoading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) throw new Error("useUser must be used within a UserProvider")
  return context
} 