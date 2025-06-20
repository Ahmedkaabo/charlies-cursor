import React, { createContext, useContext, useState, useEffect } from "react"

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
  addUser: (user: Omit<User, "id">) => void
  updateUser: (id: string, updates: Partial<User>) => void
  deleteUser: (id: string) => void
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
  const [users, setUsers] = useState<User[]>(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('users') : null
    if (stored) return JSON.parse(stored)
    return [DEFAULT_ADMIN_USER]
  })

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users))
  }, [users])

  const addUser = (user: Omit<User, "id">) => {
    setUsers((prev) => [
      ...prev,
      { ...user, id: `user-${Date.now()}` },
    ])
  }

  const updateUser = (id: string, updates: Partial<User>) => {
    if (id === DEFAULT_ADMIN_USER.id) return // Prevent editing admin
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)))
  }

  const deleteUser = (id: string) => {
    if (id === DEFAULT_ADMIN_USER.id) return // Prevent deleting admin
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
  if (!context) throw new Error("useUser must be used within a UserProvider")
  return context
} 