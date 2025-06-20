"use client"
import type React from "react"
import { useState } from "react"
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

export function AddUserDialog() {
  const { t, language } = useLanguage()
  const { branches } = useBranch()
  const { addUser } = useUser()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    branchIds: [] as string[],
    role: "manager" as "admin" | "manager",
  })

  const branchOptions = branches.map((branch) => ({ label: branch.name, value: branch.id }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addUser(formData)
    setFormData({ firstName: "", lastName: "", email: "", password: "", branchIds: [], role: "manager" })
    setOpen(false)
  }

  const isRTL = language === "ar"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t("addUser")}
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
                <Input id="firstName" value={formData.firstName} onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))} required placeholder={t("firstNamePlaceholder")} className={isRTL ? "text-right" : "text-left"} />
            </div>
            <div>
                <Label htmlFor="lastName" className={`block ${isRTL ? "text-right" : "text-left"} mb-2`}>{t("lastName")}</Label>
                <Input id="lastName" value={formData.lastName} onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))} required placeholder={t("lastNamePlaceholder")} className={isRTL ? "text-right" : "text-left"} />
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
            <MultiSelect options={branchOptions} selected={formData.branchIds} onChange={(selected) => setFormData((prev) => ({ ...prev, branchIds: selected }))} placeholder={t("selectBranches")} className={isRTL ? "text-right" : "text-left"}/>
          </div>
          <DialogFooter className="flex flex-row-reverse justify-end gap-2 sm:flex-row sm:justify-end mt-4">
            <Button type="submit">{t("save")}</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t("cancel")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 