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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/contexts/language-context"
import { useEmployee } from "@/contexts/employee-context"
import { useBranch } from "@/contexts/branch-context"
import { MultiSelect } from "@/components/ui/multi-select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import type { Employee } from "@/types/payroll"

interface EditEmployeeDialogProps {
  employee: Employee
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditEmployeeDialog({ employee, open, onOpenChange }: EditEmployeeDialogProps) {
  const { t, language } = useLanguage()
  const { updateEmployee } = useEmployee()
  const { branches } = useBranch()
  const [formData, setFormData] = useState({
    firstName: employee.firstName,
    lastName: employee.lastName,
    phone: employee.phone,
    role: employee.role,
    baseSalary: employee.baseSalary.toString(),
    startDate: employee.startDate as string | Date,
    branchIds: employee.branchIds,
    email: employee.email || "", // Include email
    password: employee.password || "", // Include password
  })

  const branchOptions = branches.map((branch) => ({
    label: branch.name, // nameAr removed
    value: branch.id,
  }))

  // Update form data if employee prop changes (e.g., when a different employee is selected for editing)
  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName,
        lastName: employee.lastName,
        phone: employee.phone,
        role: employee.role,
        baseSalary: employee.baseSalary.toString(),
        startDate: employee.startDate,
        branchIds: employee.branchIds,
        email: employee.email || "",
        password: employee.password || "",
      })
    }
  }, [employee])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      formData.firstName &&
      formData.lastName &&
      formData.role &&
      formData.baseSalary &&
      formData.startDate &&
      formData.branchIds.length > 0 &&
      formData.phone.startsWith("01") &&
      formData.phone.length === 11
    ) {
      updateEmployee(employee.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        role: formData.role,
        baseSalary: Number.parseFloat(formData.baseSalary),
        startDate:
          typeof formData.startDate === "string" ? formData.startDate : format(formData.startDate, "yyyy-MM-dd"),
        branchIds: formData.branchIds,
        email: formData.email,
        password: formData.password,
      })
      onOpenChange(false)
    }
  }

  const isRTL = language === "ar"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className={isRTL ? "text-right" : "text-left"}>
          <DialogTitle>{t("editEmployeeTitle")}</DialogTitle>
          <DialogDescription>{t("editEmployeeDescription")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className={isRTL ? "text-right" : "text-left"}>
                {t("firstName")}
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                required
                placeholder={t("firstNamePlaceholder")}
                className={isRTL ? "text-right" : "text-left"}
              />
            </div>
            <div>
              <Label htmlFor="lastName" className={isRTL ? "text-right" : "text-left"}>
                {t("lastName")}
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                required
                placeholder={t("lastNamePlaceholder")}
                className={isRTL ? "text-right" : "text-left"}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone" className={isRTL ? "text-right" : "text-left"}>
              {t("phone")}
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              required
              placeholder={t("phonePlaceholder")}
              pattern="^01[0-9]{9}$"
              title="Phone number must start with 01 and be 11 digits long"
              className={isRTL ? "text-right" : "text-left"}
            />
          </div>

          <div>
            <Label htmlFor="role" className={isRTL ? "text-right" : "text-left"}>
              {t("role")}
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value: Employee["role"]) => setFormData((prev) => ({ ...prev, role: value }))}
            >
              <SelectTrigger className={isRTL ? "text-right" : "text-left"}>
                <SelectValue placeholder={t("selectRole")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="barista">{t("barista")}</SelectItem>
                <SelectItem value="waiter">{t("waiter")}</SelectItem>
                <SelectItem value="helper">{t("helper")}</SelectItem>
                <SelectItem value="manager">{t("manager")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="baseSalary" className={isRTL ? "text-right" : "text-left"}>
              {t("baseSalary")} ({t("egp")})
            </Label>
            <Input
              id="baseSalary"
              type="number"
              value={formData.baseSalary}
              onChange={(e) => setFormData((prev) => ({ ...prev, baseSalary: e.target.value }))}
              required
              placeholder={t("baseSalaryPlaceholder")}
              className={isRTL ? "text-right" : "text-left"}
            />
          </div>

          <div>
            <Label htmlFor="startDate" className={isRTL ? "text-right" : "text-left"}>
              {t("startDate")}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.startDate && "text-muted-foreground",
                    isRTL && "justify-end text-right",
                  )}
                >
                  <CalendarIcon className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                  {formData.startDate ? format(new Date(formData.startDate), "PPP") : <span>{t("pickADate")}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={typeof formData.startDate === "string" ? new Date(formData.startDate) : formData.startDate}
                  onSelect={(date) => setFormData((prev) => ({ ...prev, startDate: date || "" }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="branches" className={isRTL ? "text-right" : "text-left"}>
              {t("branches")}
            </Label>
            <MultiSelect
              options={branchOptions}
              selected={formData.branchIds}
              onChange={(selectedBranches) => setFormData((prev) => ({ ...prev, branchIds: selectedBranches }))}
              placeholder={t("selectBranches")}
            />
          </div>

          {formData.role === "manager" && (
            <>
              <div>
                <Label htmlFor="email" className={isRTL ? "text-right" : "text-left"}>
                  {t("email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required={formData.role === "manager"}
                  placeholder="manager@example.com"
                  className={isRTL ? "text-right" : "text-left"}
                />
              </div>
              <div>
                <Label htmlFor="password" className={isRTL ? "text-right" : "text-left"}>
                  {t("password")}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  required={formData.role === "manager"}
                  placeholder="********"
                  className={isRTL ? "text-right" : "text-left"}
                />
              </div>
            </>
          )}

          <DialogFooter className={isRTL ? "flex-row-reverse" : "flex-row"}>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit">{t("save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
