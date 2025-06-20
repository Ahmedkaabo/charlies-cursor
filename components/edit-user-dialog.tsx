"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/language-context"
import { MultiSelect } from "@/components/ui/multi-select"
import { useBranch } from "@/contexts/branch-context"
import { User } from "@/contexts/user-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EditUserDialogProps {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updates: Partial<User>) => void
}

export function EditUserDialog({ user, open, onOpenChange, onSave }: EditUserDialogProps) {
  const { t, language } = useLanguage()
  const { branches } = useBranch()
  const [formData, setFormData] = useState<Partial<User>>({})

  useEffect(() => {
    setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        branchIds: user.branchIds,
        role: user.role,
    })
  }, [user])

  const branchOptions = branches.map((branch) => ({ label: branch.name, value: branch.id }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onOpenChange(false)
  }

  const isRTL = language === "ar"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className={isRTL ? "text-right" : "text-left"}>
          <DialogTitle>{t("editUser")}</DialogTitle>
          <DialogDescription>{t("editUserDescription")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="firstName" className={`block ${isRTL ? "text-right" : "text-left"} mb-2`}>{t("firstName")}</Label>
                    <Input id="firstName" value={formData.firstName || ''} onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))} required placeholder={t("firstNamePlaceholder")} className={isRTL ? "text-right" : "text-left"} />
                </div>
                <div>
                    <Label htmlFor="lastName" className={`block ${isRTL ? "text-right" : "text-left"} mb-2`}>{t("lastName")}</Label>
                    <Input id="lastName" value={formData.lastName || ''} onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))} required placeholder={t("lastNamePlaceholder")} className={isRTL ? "text-right" : "text-left"} />
                </div>
            </div>
          <div>
            <Label htmlFor="email" className={`block ${isRTL ? "text-right" : "text-left"} mb-2`}>{t("email")}</Label>
            <Input id="email" type="email" value={formData.email || ''} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} required placeholder="user@example.com" className={isRTL ? "text-right" : "text-left"} />
          </div>
          <div>
            <Label htmlFor="password" className={`block ${isRTL ? "text-right" : "text-left"} mb-2`}>{t("password")} ({t("leaveBlankNoChange")})</Label>
            <Input id="password" type="password" value={formData.password || ''} onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))} placeholder="********" className={isRTL ? "text-right" : "text-left"} />
          </div>
          <div>
            <Label htmlFor="role" className={`block ${isRTL ? "text-right" : "text-left"} mb-2`}>{t("role")}</Label>
            <Select value={formData.role} onValueChange={(value: "admin" | "manager") => setFormData(prev => ({...prev, role: value}))}>
                <SelectTrigger>
                    <SelectValue placeholder={t("selectRole")} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="manager">{t("manager")}</SelectItem>
                    <SelectItem value="admin">{t("admin")}</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="branches" className={`block ${isRTL ? "text-right" : "text-left"} mb-2`}>{t("branches")}</Label>
            <MultiSelect options={branchOptions} selected={formData.branchIds || []} onChange={(selected) => setFormData((prev) => ({ ...prev, branchIds: selected }))} placeholder={t("selectBranches")} className={isRTL ? "text-right" : "text-left"}/>
          </div>
          <DialogFooter className="flex flex-row-reverse justify-end gap-2 sm:flex-row sm:justify-end mt-4">
            <Button type="submit">{t("saveChanges")}</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 