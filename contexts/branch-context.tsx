"use client"

import React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { Branch } from "@/types/payroll"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "./auth-context"

interface BranchContextType {
  branches: Branch[]
  allBranches: Branch[] // All branches (for admin use)
  addBranch: (name: string) => void
  updateBranch: (id: string, updates: Partial<Branch>) => void
  deleteBranch: (id: string) => void
  isLoading: boolean
  refreshBranches: () => void
}

const BranchContext = createContext<BranchContextType | undefined>(undefined)

// Utility to map camelCase to snake_case for branch updates
function mapBranchUpdateToDb(updates: any) {
  const mapped: any = { ...updates };
  if ('staffRoles' in mapped) {
    mapped.staff_roles = mapped.staffRoles;
    delete mapped.staffRoles;
  }
  // Add more mappings as needed
  return mapped;
}

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [allBranches, setAllBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { currentUser, isAdmin, getUserBranches } = useAuth()

  // Load branches from Supabase on mount
  const fetchBranches = useCallback(async () => {
    console.log("Fetching branches from Supabase...")
    setIsLoading(true)

    try {
      const { data, error } = await supabase.from("branches").select("*").order("created_at", { ascending: true })

      console.log("Supabase response:", { data, error })

      if (error) {
        console.error("Error fetching branches:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to fetch branches: ${error.message}`,
        })
      } else {
        console.log("Successfully fetched branches:", data)
        setAllBranches(data || [])
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
  }, [])

  useEffect(() => {
    fetchBranches()
  }, [fetchBranches])

  // Filter branches based on user permissions
  const branches = React.useMemo(() => {
    if (isAdmin) {
      return allBranches
    }
    // For managers, filter branches based on their assigned branch_ids
    // If a manager has no branches, show all branches so they can be assigned.
    const userBranchIds = getUserBranches()
    if (userBranchIds.length === 0) {
      return allBranches;
    }
    
    return allBranches.filter(branch => userBranchIds.includes(branch.id))
  }, [allBranches, isAdmin, getUserBranches])

  const addBranch = useCallback(async (name: string) => {
    // Simple function to convert a name to a slug-like ID
    const createSlug = (str: string) => 
        str.toLowerCase()
           .trim()
           .replace(/[^\w\s-]/g, '')
           .replace(/[\s_-]+/g, '-')
           .replace(/^-+|-+$/g, '');

    const newBranch: Omit<Branch, 'created_at'> = {
      id: `${createSlug(name)}-branch`,
      name,
    }

    try {
      const { data, error } = await supabase.from("branches").insert(newBranch).select().single();

      if (error) {
        console.error("Error adding branch:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to add branch: ${error.message}`,
        })
      } else if (data) {
        setAllBranches((prev) => [...prev, data]);
        toast({
          variant: "success",
          title: "Success",
          description: "Branch added successfully!",
        })
      }
    } catch (err: any) {
      console.error("Network or other error adding branch:", err)
      toast({
        variant: "destructive",
        title: "Network Error",
        description: `Failed to add branch: ${err.message}`,
      })
    }
  }, [])

  const updateBranch = useCallback(async (id: string, updates: Partial<Branch>) => {
    console.log("Updating branch:", { id, updates })

    try {
      const dbUpdates = mapBranchUpdateToDb(updates);
      const { data, error } = await supabase.from("branches").update(dbUpdates).eq("id", id).select()

      console.log("Update branch response:", { data, error })

      if (error) {
        console.error("Error updating branch:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to update branch: ${error.message}`,
        })
      } else if (data && data.length > 0) {
        console.log("Successfully updated branch:", data[0])
        setAllBranches((prev) => prev.map((branch) => (branch.id === id ? { ...branch, ...updates } : branch)))
        toast({
          variant: "success",
          title: "Success",
          description: "Branch updated successfully!",
        })
      }
    } catch (err) {
      console.error("Network or other error updating branch:", err)
      toast({
        variant: "destructive",
        title: "Network Error",
        description: `Failed to update branch: ${err}`,
      })
    }
  }, [])

  const deleteBranch = useCallback(async (id: string) => {
    console.log("Deleting branch:", id)

    try {
      const { error } = await supabase.from("branches").delete().eq("id", id)

      console.log("Delete branch response:", { error })

      if (error) {
        console.error("Error deleting branch:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to delete branch: ${error.message}`,
        })
      } else {
        console.log("Successfully deleted branch")
        setAllBranches((prev) => prev.filter((branch) => branch.id !== id))
        toast({
          variant: "success",
          title: "Success",
          description: "Branch deleted successfully!",
        })
      }
    } catch (err) {
      console.error("Network or other error deleting branch:", err)
      toast({
        variant: "destructive",
        title: "Network Error",
        description: `Failed to delete branch: ${err}`,
      })
    }
  }, [])

  return (
    <BranchContext.Provider
      value={{ 
        branches, 
        allBranches,
        addBranch, 
        updateBranch, 
        deleteBranch, 
        isLoading, 
        refreshBranches: fetchBranches 
      }}
    >
      {children}
    </BranchContext.Provider>
  )
}

export function useBranch() {
  const context = useContext(BranchContext)
  if (context === undefined) {
    throw new Error("useBranch must be used within a BranchProvider")
  }
  return context
}
