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
  token_version: number
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

  useEffect(() => {
    fetchUsers()
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