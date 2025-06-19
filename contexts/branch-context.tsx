"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { Branch } from "@/types/payroll"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface BranchContextType {
  branches: Branch[]
  addBranch: (name: string) => void
  updateBranch: (id: string, updates: Partial<Branch>) => void
  deleteBranch: (id: string) => void
  isLoading: boolean
  refreshBranches: () => void
}

const BranchContext = createContext<BranchContextType | undefined>(undefined)

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
        setBranches(data || [])
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

  const addBranch = useCallback(async (name: string) => {
    console.log("Adding branch:", { name })

    const newBranch: Branch = {
      id: `branch-${Date.now()}`,
      name,
    }

    try {
      const { data, error } = await supabase.from("branches").insert([newBranch]).select()

      console.log("Add branch response:", { data, error })

      if (error) {
        console.error("Error adding branch:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to add branch: ${error.message}`,
        })
      } else if (data && data.length > 0) {
        console.log("Successfully added branch:", data[0])
        setBranches((prev) => [...prev, data[0]])
        toast({
          variant: "success",
          title: "Success",
          description: "Branch added successfully!",
        })
      }
    } catch (err) {
      console.error("Network or other error adding branch:", err)
      toast({
        variant: "destructive",
        title: "Network Error",
        description: `Failed to add branch: ${err}`,
      })
    }
  }, [])

  const updateBranch = useCallback(async (id: string, updates: Partial<Branch>) => {
    console.log("Updating branch:", { id, updates })

    try {
      const { data, error } = await supabase.from("branches").update(updates).eq("id", id).select()

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
        setBranches((prev) => prev.map((branch) => (branch.id === id ? { ...branch, ...updates } : branch)))
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
        setBranches((prev) => prev.filter((branch) => branch.id !== id))
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
      value={{ branches, addBranch, updateBranch, deleteBranch, isLoading, refreshBranches: fetchBranches }}
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
