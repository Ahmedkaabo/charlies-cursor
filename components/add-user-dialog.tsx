"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { MultiSelect } from "@/components/ui/multi-select"
import { useBranch } from "@/contexts/branch-context"
import { useUser } from "@/contexts/user-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"

export function AddUserDialog({ buttonLabel, defaultRole }: { buttonLabel?: string, defaultRole?: 'owner' | 'manager' | 'admin' }) {
  const { t, language } = useLanguage()
  const { allBranches } = useBranch()
  const { addUser } = useUser()
  const { getPermission } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    branch_ids: [] as string[],
    role: defaultRole || "manager",
    token_version: 1,
  })

  useEffect(() => {
    if (defaultRole) {
      setFormData(prev => ({ ...prev, role: defaultRole }))
    }
  }, [defaultRole])

  const branchOptions = allBranches.map((branch) => ({ label: branch.name, value: branch.id }))

  // Update branch_ids when role changes
  const handleRoleChange = (value: "admin" | "manager" | "owner") => {
    if (value === "admin") {
      // Admin users get access to all branches
      setFormData(prev => ({ ...prev, role: value, branch_ids: allBranches.map(b => b.id) }))
    } else {
      // Manager/Owner users start with no branches selected
      setFormData(prev => ({ ...prev, role: value, branch_ids: [] }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await addUser(formData)
      setFormData({ first_name: "", last_name: "", email: "", password: "", branch_ids: [], role: "manager", token_version: 1 })
      setOpen(false)
    } catch (err: any) {
        setError(err.message || "An unexpected error occurred.")
    } finally {
        setLoading(false)
    }
  }

  const isRTL = language === "ar"

  if (!getPermission || !getPermission('users', 'add')) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {buttonLabel || t("addUser")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader className={isRTL ? "text-right" : "text-left"}>
          <DialogTitle>{t("addUser")}</DialogTitle>
          <DialogDescription>{t("addUserDescription")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
                <Label htmlFor="firstName" className={`block ${isRTL ? "text-right" : "text-left"} mb-2`}>{t("firstName")}</Label>
                <Input id="firstName" value={formData.first_name} onChange={(e) => setFormData((prev) => ({ ...prev, first_name: e.target.value }))} required placeholder={t("firstNamePlaceholder")} className={isRTL ? "text-right" : "text-left"} />
            </div>
            <div>
                <Label htmlFor="lastName" className={`block ${isRTL ? "text-right" : "text-left"} mb-2`}>{t("lastName")}</Label>
                <Input id="lastName" value={formData.last_name} onChange={(e) => setFormData((prev) => ({ ...prev, last_name: e.target.value }))} required placeholder={t("lastNamePlaceholder")} className={isRTL ? "text-right" : "text-left"} />
            </div>
          </div>
          <div>
            <Label htmlFor="email" className={`block ${isRTL ? "text-right" : "text-left"} mb-2`}>{t("email")}</Label>
            <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} required placeholder="user@example.com" className={isRTL ? "text-right" : "text-left"} />
          </div>
          <div>
            <Label htmlFor="password" className={`block ${isRTL ? "text-right" : "text-left"} mb-2`}>{t("password")}</Label>
            <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))} required placeholder="********" className={isRTL ? "text-right" : "text-left"} />
          </div>
           <div>
            <Label htmlFor="role" className={`block ${isRTL ? "text-right" : "text-left"} mb-2`}>{t("role")}</Label>
            <Select value={formData.role} onValueChange={handleRoleChange} disabled={!!defaultRole}>
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
              selected={formData.branch_ids} 
              onChange={(selected) => setFormData((prev) => ({ ...prev, branch_ids: selected }))} 
              placeholder={formData.role === "admin" ? "All branches" : t("selectBranches")} 
              className={isRTL ? "text-right" : "text-left"}
              disabled={formData.role === "admin"}
            />
          </div>
          <DialogFooter className="flex flex-row-reverse justify-end gap-2 sm:flex-row sm:justify-end mt-4">
            <Button type="submit" disabled={loading}>{loading ? t("saving") : t("save")}</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t("cancel")}</Button>
          </DialogFooter>
           {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </form>
      </DialogContent>
    </Dialog>
  )
} 