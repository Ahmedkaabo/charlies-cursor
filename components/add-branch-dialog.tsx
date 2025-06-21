"use client"

import { cn } from "@/lib/utils"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useBranch } from "@/contexts/branch-context"
import { useAuth } from "@/contexts/auth-context"

export function AddBranchDialog() {
  const { t, language } = useLanguage()
  const { addBranch } = useBranch()
  const { getPermission } = useAuth()
  const [open, setOpen] = useState(false)
  const [branchName, setBranchName] = useState("")

  if (!getPermission || !getPermission('branches', 'add')) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (branchName.trim()) {
      addBranch(branchName.trim())
      setBranchName("")
      setOpen(false)
    }
  }

  const handleCancel = () => {
    setBranchName("")
    setOpen(false)
  }

  const isRTL = language === "ar"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t("addBranch")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className={isRTL ? "text-right" : "text-left"}>
          <DialogTitle>{t("addBranch")}</DialogTitle>
          <DialogDescription>{t("addBranchDescription")}</DialogDescription>
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
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
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
