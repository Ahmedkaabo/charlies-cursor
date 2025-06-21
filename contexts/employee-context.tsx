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
  getActiveEmployeesForPayroll: (list?: Employee[], month?: number, year?: number) => Employee[]
  addEmployee: (
    employeeData: Omit<Employee, "id" | "attendance" | "bonus_days" | "penalty_days" | "month" | "year" | "status"> & {
      email?: string
      password?: string
    },
    initialStatus?: "pending" | "approved",
  ) => void
  updateEmployee: (id: string, updates: Partial<Employee>) => void
  deleteEmployee: (id: string) => void
  forceDeleteEmployee: (id: string) => void
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

  // Show all employees (including deleted) in staff table
  const employees = React.useMemo(() => {
    if (isAdmin) {
      return allEmployees
    }
    const userBranchIds = getUserBranches()
    if (userBranchIds.length === 0) {
      return allEmployees
    }
    return allEmployees.filter(employee => {
      if (employee.branch_ids && employee.branch_ids.length > 0) {
        return employee.branch_ids.some(branchId => userBranchIds.includes(branchId))
      }
      return false
    })
  }, [allEmployees, isAdmin, getUserBranches])

  // Exclude employees whose payroll_end_month/year is before the given month/year
  const getActiveEmployeesForPayroll = (list = allEmployees, month?: number, year?: number) => {
    return list.filter(emp => {
      if (emp.is_active === false) {
        // If no end month/year, treat as deleted for all months
        if (emp.payroll_end_month == null || emp.payroll_end_year == null) return false
        // If month/year not provided, treat as deleted
        if (month == null || year == null) return false
        // Exclude if the payroll is after the end month/year
        if (year > emp.payroll_end_year) return false
        if (year === emp.payroll_end_year && month > emp.payroll_end_month) return false
        // Otherwise, include for the end month
        if (year === emp.payroll_end_year && month === emp.payroll_end_month) return true
        return false
      }
      return true
    })
  }

  const addEmployee = useCallback(
    async (
      newEmployeeData: Omit<
        Employee,
        "id" | "attendance" | "bonus_days" | "penalty_days" | "month" | "year" | "status"
      > & { email?: string; password?: string },
      initialStatus?: "pending" | "approved",
    ) => {
      console.log("Adding employee:", newEmployeeData)

      const newEmployee: Employee = {
        ...newEmployeeData,
        id: `emp_${Date.now()}`,
        attendance: {},
        bonus_days: 0,
        penalty_days: 0,
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
          throw error
        } else if (data && data.length > 0) {
          console.log("Successfully added employee:", data[0])
          setAllEmployees((prev) => [...prev, data[0]])
          toast({
            variant: "success",
            title: "Success",
            description: "Employee added successfully!",
          })
          return data[0]
        }
      } catch (err) {
        console.error("Network or other error adding employee:", err)
        toast({
          variant: "destructive",
          title: "Network Error",
          description: `Failed to add employee: ${err}`,
        })
        throw err
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
        throw error
      } else if (data) {
        console.log("Successfully updated employee:", data[0])
        setAllEmployees((prev) => prev.map((emp) => (emp.id === id ? { ...emp, ...updates } : emp)))
        toast({
          variant: "success",
          title: "Success",
          description: "Employee updated successfully!",
        })
        return { ...data[0] }
      }
    } catch (err) {
      console.error("Network or other error updating employee:", err)
      toast({
        variant: "destructive",
        title: "Network Error",
        description: `Failed to update employee: ${err}`,
      })
      throw err
    }
  }, [])

  const deleteEmployee = useCallback(async (id: string) => {
    console.log("Soft deleting employee:", id)
    const now = new Date()
    const currentMonth = now.getMonth() + 1 // JS months are 0-based
    const currentYear = now.getFullYear()
    try {
      const { error } = await supabase.from("employees").update({ is_active: false, payroll_end_month: currentMonth, payroll_end_year: currentYear }).eq("id", id)
      console.log("Soft delete employee response:", { error })
      if (error) {
        console.error("Error soft deleting employee:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to delete employee: ${error.message}`,
        })
      } else {
        setAllEmployees((prev) => prev.map(emp => emp.id === id ? { ...emp, is_active: false, payroll_end_month: currentMonth, payroll_end_year: currentYear } : emp))
        toast({
          variant: "success",
          title: "Success",
          description: "Employee deleted (soft) successfully!",
        })
      }
    } catch (err) {
      console.error("Network or other error soft deleting employee:", err)
      toast({
        variant: "destructive",
        title: "Network Error",
        description: `Failed to delete employee: ${err}`,
      })
    }
  }, [])

  // Hard delete: permanently remove employee from DB (admin only, for terminated employees)
  const forceDeleteEmployee = useCallback(async (id: string) => {
    console.log("Force deleting employee:", id)
    try {
      const { error } = await supabase.from("employees").delete().eq("id", id)
      if (error) {
        console.error("Error force deleting employee:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to permanently delete employee: ${error.message}`,
        })
      } else {
        setAllEmployees((prev) => prev.filter((emp) => emp.id !== id))
        toast({
          variant: "success",
          title: "Success",
          description: "Employee permanently deleted!",
        })
      }
    } catch (err) {
      console.error("Network or other error force deleting employee:", err)
      toast({
        variant: "destructive",
        title: "Network Error",
        description: `Failed to permanently delete employee: ${err}`,
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
        getActiveEmployeesForPayroll,
        addEmployee, 
        updateEmployee, 
        deleteEmployee, 
        forceDeleteEmployee,
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
