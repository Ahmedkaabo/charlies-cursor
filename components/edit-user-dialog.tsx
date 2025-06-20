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
import { User, useUser } from "@/contexts/user-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EditUserDialogProps {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditUserDialog({ user, open, onOpenChange }: EditUserDialogProps) {
  const { t, language } = useLanguage()
  const { allBranches } = useBranch()
  const { updateUser } = useUser()
  const [formData, setFormData] = useState<Partial<User>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
        setFormData({
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            branch_ids: user.branch_ids || [],
            role: user.role as "admin" | "manager" | "owner",
            password: ""
        })
    }
  }, [user])

  const branchOptions = allBranches.map((branch) => ({ label: branch.name, value: branch.id }))

  // Update branch_ids when role changes
  const handleRoleChange = (value: "admin" | "manager" | "owner") => {
    if (value === "admin") {
      // Admin users get access to all branches
      setFormData(prev => ({ ...prev, role: value, branch_ids: allBranches.map(b => b.id) }))
    } else {
      // Manager/Owner users keep their current branch assignments or start with none
      setFormData(prev => ({ ...prev, role: value, branch_ids: prev.branch_ids || [] }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const updates: Partial<User> = { ...formData };
    if (!updates.password) {
      delete updates.password;
    }

    try {
        await updateUser(user.id, updates)
        onOpenChange(false)
    } catch(err: any) {
        setError(err.message || "An unexpected error occurred.")
    } finally {
        setLoading(false)
    }
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
                    <Input id="firstName" value={formData.first_name || ''} onChange={(e) => setFormData((prev) => ({ ...prev, first_name: e.target.value }))} required placeholder={t("firstNamePlaceholder")} className={isRTL ? "text-right" : "text-left"} />
                </div>
                <div>
                    <Label htmlFor="lastName" className={`block ${isRTL ? "text-right" : "text-left"} mb-2`}>{t("lastName")}</Label>
                    <Input id="lastName" value={formData.last_name || ''} onChange={(e) => setFormData((prev) => ({ ...prev, last_name: e.target.value }))} required placeholder={t("lastNamePlaceholder")} className={isRTL ? "text-right" : "text-left"} />
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
            <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                    <SelectValue placeholder={t("selectRole")} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="manager">{t("manager")}</SelectItem>
                    <SelectItem value="owner">{t("owner")}</SelectItem>
                    <SelectItem value="admin">{t("admin")}</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="branches" className={`block ${isRTL ? "text-right" : "text-left"} mb-2`}>
              {t("branches")}
              {formData.role === "admin" && <span className="text-sm text-muted-foreground ml-2">(All branches automatically assigned)</span>}
            </Label>
            <MultiSelect 
              options={branchOptions} 
              selected={formData.branch_ids || []} 
              onChange={(selected) => setFormData((prev) => ({ ...prev, branch_ids: selected }))} 
              placeholder={formData.role === "admin" ? "All branches" : t("selectBranches")} 
              className={isRTL ? "text-right" : "text-left"}
              disabled={formData.role === "admin"}
            />
          </div>
          <DialogFooter className="flex flex-row-reverse justify-end gap-2 sm:flex-row sm:justify-end mt-4">
            <Button type="submit" disabled={loading}>{loading ? t("saving") : t("saveChanges")}</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
          </DialogFooter>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </form>
      </DialogContent>
    </Dialog>
  )
} 