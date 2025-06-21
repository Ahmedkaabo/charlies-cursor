"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/language-context"
import { useBranch } from "@/contexts/branch-context"
import type { Branch } from "@/types/payroll"
import { cn } from "@/lib/utils"
import { Plus, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EditBranchDialogProps {
  branch: Branch
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Predefined staff roles
const STAFF_ROLES = [
  "barista",
  "waiter",
  "captin_order",
  "helper",
  "steward",
  "manager",
]

export function EditBranchDialog({ branch, open, onOpenChange }: EditBranchDialogProps) {
  const { t, language } = useLanguage()
  const { updateBranch } = useBranch()
  const [formData, setFormData] = useState({
    name: "",
    staffRoles: {} as Record<string, number>,
    shifts: [] as Array<{ name: string; start: string; end: string }>,
  })

  // Initialize form data when branch changes or dialog opens
  useEffect(() => {
    if (branch && open) {
      setFormData({
        name: branch.name || "",
        staffRoles: branch.staffRoles || {},
        shifts: branch.shifts || [],
      })
    }
  }, [branch, open])

  // Staff roles logic
  const [newRole, setNewRole] = useState("")
  const [newRoleCount, setNewRoleCount] = useState(1)
  const handleAddRole = () => {
    if (newRole.trim() && newRoleCount > 0) {
      setFormData(prev => ({
        ...prev,
        staffRoles: { ...prev.staffRoles, [newRole.trim()]: newRoleCount },
      }))
      setNewRole("")
      setNewRoleCount(1)
    }
  }
  const handleRemoveRole = (role: string) => {
    setFormData(prev => {
      const updated = { ...prev.staffRoles }
      delete updated[role]
      return { ...prev, staffRoles: updated }
    })
  }

  // Shifts logic
  const [newShift, setNewShift] = useState({ name: "", start: "", end: "" })
  const handleAddShift = () => {
    if (newShift.name && newShift.start && newShift.end) {
      setFormData(prev => ({
        ...prev,
        shifts: [...prev.shifts, { ...newShift }],
      }))
      setNewShift({ name: "", start: "", end: "" })
    }
  }
  const handleRemoveShift = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      shifts: prev.shifts.filter((_, i) => i !== idx),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim()) {
      updateBranch(branch.id, {
        name: formData.name.trim(),
        staffRoles: formData.staffRoles,
        shifts: formData.shifts,
      })
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    // Reset form data when canceling
    setFormData({
      name: branch.name || "",
      staffRoles: branch.staffRoles || {},
      shifts: branch.shifts || [],
    })
    onOpenChange(false)
  }

  const isRTL = language === "ar"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className={isRTL ? "text-right" : "text-left"}>
          <DialogTitle>{t("editBranch")}</DialogTitle>
          <DialogDescription>{t("editBranchDescription")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <div>
              <Label htmlFor="branchName" className={`block ${isRTL ? "text-right" : "text-left"}`}>
                {t("branchName")}
              </Label>
            </div>
            <Input
              id="branchName"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className={cn("col-span-3", isRTL && "text-right")}
              required
              placeholder="Enter branch name"
            />
          </div>
          {/* Staff Roles */}
          <div>
            <Label className="block mb-2">Staff Roles Needed</Label>
            <div className="flex gap-2 mb-2">
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {STAFF_ROLES.map(role => (
                    <SelectItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={1}
                value={newRoleCount}
                onChange={(e) => setNewRoleCount(Number(e.target.value))}
                className="w-20"
              />
              <Button type="button" variant="secondary" onClick={handleAddRole}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {Object.entries(formData.staffRoles).map(([role, count]) => (
                <div key={role} className="flex items-center gap-2">
                  <span className="font-mono bg-muted rounded px-2 py-1 text-xs">{role}</span>
                  <span className="text-xs text-muted-foreground">x{count}</span>
                  <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveRole(role)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {Object.keys(formData.staffRoles).length === 0 && <span className="text-xs text-muted-foreground">No roles defined.</span>}
            </div>
          </div>
          {/* Shifts */}
          <div>
            <Label className="block mb-2">Shifts</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Shift Name (e.g. Morning)"
                value={newShift.name}
                onChange={(e) => setNewShift(s => ({ ...s, name: e.target.value }))}
                className="w-32"
              />
              <Input
                type="time"
                value={newShift.start}
                onChange={(e) => setNewShift(s => ({ ...s, start: e.target.value }))}
                className="w-24"
              />
              <Input
                type="time"
                value={newShift.end}
                onChange={(e) => setNewShift(s => ({ ...s, end: e.target.value }))}
                className="w-24"
              />
              <Button type="button" variant="secondary" onClick={handleAddShift}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {formData.shifts.map((shift, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="font-mono bg-muted rounded px-2 py-1 text-xs">{shift.name}</span>
                  <span className="text-xs text-muted-foreground">{shift.start} - {shift.end}</span>
                  <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveShift(idx)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {formData.shifts.length === 0 && <span className="text-xs text-muted-foreground">No shifts defined.</span>}
            </div>
          </div>
          <DialogFooter className={isRTL ? "flex-row-reverse" : "flex-row"}>
            <Button type="button" variant="outline" onClick={handleCancel}>
              {t("cancel")}
            </Button>
            <Button type="submit">{t("save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
