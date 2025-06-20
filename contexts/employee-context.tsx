"use client"

import React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { Employee } from "@/types/payroll"
import { useAuth } from "./auth-context"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface EmployeeContextType {
  employees: Employee[]
  allEmployees: Employee[] // All employees (for admin use)
  addEmployee: (
    employeeData: Omit<Employee, "id" | "attendance" | "bonusDays" | "penaltyDays" | "month" | "year" | "status"> & {
      email?: string
      password?: string
    },
    initialStatus?: "pending" | "approved",
  ) => void
  updateEmployee: (id: string, updates: Partial<Employee>) => void
  deleteEmployee: (id: string) => void
  approveEmployee: (id: string) => void
  isLoading: boolean
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined)

export function EmployeeProvider({ children }: { children: React.ReactNode }) {
  const { isAdmin, getUserBranches } = useAuth()
  const [allEmployees, setAllEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load employees from Supabase on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      console.log("Fetching employees from Supabase...")
      setIsLoading(true)

      try {
        const { data, error } = await supabase.from("employees").select("*")

        console.log("Supabase employees response:", { data, error })

        if (error) {
          console.error("Error fetching employees:", error)
          toast({
            variant: "destructive",
            title: "Error",
            description: `Failed to fetch employees: ${error.message}`,
          })
        } else {
          console.log("Successfully fetched employees:", data)
          // Ensure attendance is parsed correctly if stored as JSON string
          const parsedData = (data || []).map((emp) => ({
            ...emp,
            attendance: typeof emp.attendance === "string" ? JSON.parse(emp.attendance) : emp.attendance || {},
          }))
          setAllEmployees(parsedData)
        }
      } catch (err) {
        console.error("Network or other error:", err)
        toast({
          variant: "destructive",
          title: "Network Error",
          description: `Failed to connect to database: ${err}`,
        })
      }

      setIsLoading(false)
    }
    fetchEmployees()
  }, [])

  // Filter employees based on user permissions
  const employees = React.useMemo(() => {
    if (isAdmin) {
      // Admin users see all employees
      return allEmployees
    }
    
    // Manager users only see employees from their assigned branches
    const userBranchIds = getUserBranches()
    return allEmployees.filter(employee => {
      // Check if employee has any branches that match user's assigned branches
      return employee.branchIds && employee.branchIds.some(branchId => userBranchIds.includes(branchId))
    })
  }, [allEmployees, isAdmin, getUserBranches])

  const addEmployee = useCallback(
    async (
      newEmployeeData: Omit<
        Employee,
        "id" | "attendance" | "bonusDays" | "penaltyDays" | "month" | "year" | "status"
      > & { email?: string; password?: string },
      initialStatus?: "pending" | "approved",
    ) => {
      console.log("Adding employee:", newEmployeeData)

      const newEmployee: Employee = {
        ...newEmployeeData,
        id: Date.now().toString(),
        attendance: {},
        bonusDays: 0,
        penaltyDays: 0,
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
        status: initialStatus || (isAdmin ? "approved" : "pending"),
      }

      try {
        const { data, error } = await supabase.from("employees").insert([newEmployee]).select()

        console.log("Add employee response:", { data, error })

        if (error) {
          console.error("Error adding employee:", error)
          toast({
            variant: "destructive",
            title: "Error",
            description: `Failed to add employee: ${error.message}`,
          })
        } else if (data && data.length > 0) {
          console.log("Successfully added employee:", data[0])
          setAllEmployees((prev) => [...prev, data[0]])
          toast({
            variant: "success",
            title: "Success",
            description: "Employee added successfully!",
          })
        }
      } catch (err) {
        console.error("Network or other error adding employee:", err)
        toast({
          variant: "destructive",
          title: "Network Error",
          description: `Failed to add employee: ${err}`,
        })
      }
    },
    [isAdmin],
  )

  const updateEmployee = useCallback(async (id: string, updates: Partial<Employee>) => {
    console.log("Updating employee:", { id, updates })

    try {
      const { data, error } = await supabase.from("employees").update(updates).eq("id", id).select()

      console.log("Update employee response:", { data, error })

      if (error) {
        console.error("Error updating employee:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to update employee: ${error.message}`,
        })
      } else if (data) {
        console.log("Successfully updated employee:", data[0])
        setAllEmployees((prev) => prev.map((emp) => (emp.id === id ? { ...emp, ...updates } : emp)))
        toast({
          variant: "success",
          title: "Success",
          description: "Employee updated successfully!",
        })
      }
    } catch (err) {
      console.error("Network or other error updating employee:", err)
      toast({
        variant: "destructive",
        title: "Network Error",
        description: `Failed to update employee: ${err}`,
      })
    }
  }, [])

  const deleteEmployee = useCallback(async (id: string) => {
    console.log("Deleting employee:", id)

    try {
      const { error } = await supabase.from("employees").delete().eq("id", id)

      console.log("Delete employee response:", { error })

      if (error) {
        console.error("Error deleting employee:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to delete employee: ${error.message}`,
        })
      } else {
        console.log("Successfully deleted employee")
        setAllEmployees((prev) => prev.filter((emp) => emp.id !== id))
        toast({
          variant: "success",
          title: "Success",
          description: "Employee deleted successfully!",
        })
      }
    } catch (err) {
      console.error("Network or other error deleting employee:", err)
      toast({
        variant: "destructive",
        title: "Network Error",
        description: `Failed to delete employee: ${err}`,
      })
    }
  }, [])

  const approveEmployee = useCallback(async (id: string) => {
    console.log("Approving employee:", id)

    try {
      const { data, error } = await supabase.from("employees").update({ status: "approved" }).eq("id", id).select()

      console.log("Approve employee response:", { data, error })

      if (error) {
        console.error("Error approving employee:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to approve employee: ${error.message}`,
        })
      } else if (data) {
        console.log("Successfully approved employee:", data[0])
        setAllEmployees((prev) => prev.map((emp) => (emp.id === id ? { ...emp, status: "approved" } : emp)))
        toast({
          variant: "success",
          title: "Success",
          description: "Employee approved successfully!",
        })
      }
    } catch (err) {
      console.error("Network or other error approving employee:", err)
      toast({
        variant: "destructive",
        title: "Network Error",
        description: `Failed to approve employee: ${err}`,
      })
    }
  }, [])

  return (
    <EmployeeContext.Provider
      value={{ 
        employees, 
        allEmployees,
        addEmployee, 
        updateEmployee, 
        deleteEmployee, 
        approveEmployee, 
        isLoading 
      }}
    >
      {children}
    </EmployeeContext.Provider>
  )
}

export function useEmployee() {
  const context = useContext(EmployeeContext)
  if (context === undefined) {
    throw new Error("useEmployee must be used within an EmployeeProvider")
  }
  return context
}
