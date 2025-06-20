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

interface EditBranchDialogProps {
  branch: Branch
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditBranchDialog({ branch, open, onOpenChange }: EditBranchDialogProps) {
  const { t, language } = useLanguage()
  const { updateBranch } = useBranch()
  const [formData, setFormData] = useState({
    name: "",
  })

  // Initialize form data when branch changes or dialog opens
  useEffect(() => {
    if (branch && open) {
      setFormData({
        name: branch.name || "",
      })
    }
  }, [branch, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim()) {
      updateBranch(branch.id, {
        name: formData.name.trim(),
      })
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    // Reset form data when canceling
    setFormData({
      name: branch.name || "",
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
