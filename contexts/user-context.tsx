"use client"
import React, { createContext, useContext, useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"

export interface User {
  id: string
  firstName: string
  lastName:string
  email: string
  password: string
  branchIds: string[]
  role: "admin" | "manager"
}

interface UserContextType {
  users: User[]
  addUser: (user: Omit<User, "id">) => void
  updateUser: (id: string, updates: Partial<User>) => void
  deleteUser: (id: string) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const ADMIN_USER: User = {
  id: "3157fc0f-6b43-477a-a6ed-af66865736c6",
  firstName: "Admin",
  lastName: "User",
  email: "admin@charlies.com",
  password: "Medo123!'",
  branchIds: [],
  role: "admin",
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => {
    let initialUsers: User[] = [];
    if (typeof window !== 'undefined') {
        try {
            const storedUsers = localStorage.getItem("users");
            if (storedUsers) {
                initialUsers = JSON.parse(storedUsers);
            }
        } catch (error) {
            console.error("Failed to parse users from localStorage", error);
            initialUsers = []; // Start fresh if localStorage is corrupt
        }
    }

    // Filter out any existing admin user (by ID or email) to prevent duplicates
    const otherUsers = initialUsers.filter(u => u.id !== ADMIN_USER.id && u.email !== ADMIN_USER.email);

    // Return the hardcoded admin user plus the other users
    return [ADMIN_USER, ...otherUsers];
  })

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users))
  }, [users])

  const addUser = (user: Omit<User, "id">) => {
    const newUser = { ...user, id: uuidv4() }
    setUsers((prev) => [...prev, newUser])
  }

  const updateUser = (id: string, updates: Partial<User>) => {
    if (id === ADMIN_USER.id) return // Prevent editing admin
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)))
  }

  const deleteUser = (id: string) => {
    if (id === ADMIN_USER.id) return // Prevent deleting admin
    setUsers((prev) => prev.filter((u) => u.id !== id))
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