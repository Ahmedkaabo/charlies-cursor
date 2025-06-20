import type { User } from "@/contexts/user-context"
import { useState, useEffect } from "react"
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
import { MultiSelect } from "@/components/ui/multi-select"
import { useLanguage } from "@/contexts/language-context"

interface EditUserDialogProps {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (id: string, updates: Partial<User>) => void
  branches: { id: string; name: string }[]
}

export function EditUserDialog({ user, open, onOpenChange, onSave, branches }: EditUserDialogProps) {
  const { t, language } = useLanguage()
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    password: user.password,
    branchIds: user.branchIds,
  })

  useEffect(() => {
    if (open) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        password: user.password,
        branchIds: user.branchIds,
      })
    }
  }, [user, open])

  const branchOptions = branches.map((branch) => ({ label: branch.name, value: branch.id }))
  const isRTL = language === "ar"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(user.id, {
      firstName: formData.firstName,
      lastName: formData.lastName,
      password: formData.password,
      branchIds: formData.branchIds,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className={isRTL ? "text-right" : "text-left"}>
          <DialogTitle>{t("edit") + " " + t("users")}</DialogTitle>
          <DialogDescription>{t("edit") + " " + t("users")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div>
            <Label htmlFor="firstName" className={`block ${isRTL ? "text-right" : "text-left"} mb-2`}>
              {t("firstName")}
            </Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
              required
              className={isRTL ? "text-right" : "text-left"}
            />
          </div>
          <div>
            <Label htmlFor="lastName" className={`block ${isRTL ? "text-right" : "text-left"} mb-2`}>
              {t("lastName")}
            </Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
              required
              className={isRTL ? "text-right" : "text-left"}
            />
          </div>
          <div>
            <Label htmlFor="email" className={`block ${isRTL ? "text-right" : "text-left"} mb-2`}>
              {t("email")}
            </Label>
            <Input
              id="email"
              value={user.email}
              readOnly
              className={isRTL ? "text-right" : "text-left"}
            />
          </div>
          <div>
            <Label htmlFor="password" className={`block ${isRTL ? "text-right" : "text-left"} mb-2`}>
              {t("password")}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              required
              className={isRTL ? "text-right" : "text-left"}
            />
          </div>
          <div>
            <Label htmlFor="branches" className={`block ${isRTL ? "text-right" : "text-left"} mb-2`}>
              {t("branches")}
            </Label>
            <MultiSelect
              options={branchOptions}
              selected={formData.branchIds}
              onChange={(selected) => setFormData((prev) => ({ ...prev, branchIds: selected }))}
              placeholder={t("selectBranches")}
              className={isRTL ? "text-right" : "text-left"}
            />
          </div>
          <DialogFooter className="flex flex-row-reverse justify-end gap-2 sm:flex-row sm:justify-end">
            <Button type="submit" className="flex-grow sm:flex-grow-0">
              {t("save")}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 