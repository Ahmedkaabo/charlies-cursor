"use client"
import React, { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

export interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  password: string
  branch_ids: string[]
  role: "admin" | "manager"
}

interface UserContextType {
  users: User[]
  addUser: (user: Omit<User, "id">) => Promise<void>
  updateUser: (id: string, updates: Partial<User>) => Promise<void>
  deleteUser: (id: string) => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([])

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("users").select("*")
    if (error) {
      console.error("Error fetching users:", error)
    } else {
      setUsers(data || [])
    }
  }

  const ensureDefaultAdmin = async () => {
    const { data: existingAdmins, error } = await supabase
      .from("users")
      .select("*")
      .eq("role", "admin")
    
    if (error) {
      console.error("Error checking for admin users:", error)
      return
    }

    // If no admin user exists, create one
    if (!existingAdmins || existingAdmins.length === 0) {
      const defaultAdmin: User = {
        id: uuidv4(),
        first_name: "Admin",
        last_name: "User",
        email: "admin@charlies.com",
        password: "Medo123!'",
        branch_ids: [], // Empty array means all branches for admin
        role: "admin",
      }

      try {
        const { error: insertError } = await supabase.from("users").insert([defaultAdmin])
        if (insertError) {
          console.error("Failed to create default admin user:", insertError)
        } else {
          console.log("Default admin user created")
          setUsers(prev => [...prev, defaultAdmin])
        }
      } catch (err) {
        console.error("Failed to create default admin user:", err)
      }
    }
  }

  useEffect(() => {
    const initializeUsers = async () => {
      await fetchUsers()
      await ensureDefaultAdmin()
    }
    initializeUsers()
  }, [])

  const addUser = async (user: Omit<User, "id">) => {
    const { error } = await supabase.from("users").insert([
      { ...user, id: uuidv4() },
    ])
    if (error) throw error
    await fetchUsers()
  }

  const updateUser = async (id: string, updates: Partial<User>) => {
    const { error } = await supabase.from("users").update(updates).eq("id", id)
    if (error) throw error
    await fetchUsers()
  }

  const deleteUser = async (id: string) => {
    const { error } = await supabase.from("users").delete().eq("id", id)
    if (error) throw error
    await fetchUsers()
  }

  return (
    <UserContext.Provider value={{ users, addUser, updateUser, deleteUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
} 