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
    firstName: employee.first_name,
    lastName: employee.last_name,
    phone: employee.phone,
    role: employee.role,
    baseSalary: employee.base_salary.toString(),
    startDate: employee.start_date as string | Date,
    branchIds: employee.branch_ids,
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
        firstName: employee.first_name,
        lastName: employee.last_name,
        phone: employee.phone,
        role: employee.role,
        baseSalary: employee.base_salary.toString(),
        startDate: employee.start_date,
        branchIds: employee.branch_ids,
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
      // Only include email and password if role is manager and they are provided
      const updateData: any = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        role: formData.role,
        base_salary: Number.parseFloat(formData.baseSalary),
        start_date:
          typeof formData.startDate === "string" ? formData.startDate : format(formData.startDate, "yyyy-MM-dd"),
        branch_ids: formData.branchIds,
      }
      if (formData.role === "manager") {
        if (formData.email) updateData.email = formData.email
        if (formData.password) updateData.password = formData.password
      }
      updateEmployee(employee.id, updateData)
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
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${isRTL ? "sm:grid-flow-col-dense" : ""}`}>
            <div className={`${isRTL ? "sm:col-start-2" : ""}`}>
              <Label htmlFor="firstName" className={`block ${isRTL ? "text-right" : "text-left"} mb-2`}>
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
            <div className={`${isRTL ? "sm:col-start-1" : ""}`}>
              <Label htmlFor="lastName" className={`block ${isRTL ? "text-right" : "text-left"} mb-2`}>
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
            <Label htmlFor="phone" className={`block ${isRTL ? "text-right" : "text-left"} mb-2`}>
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
            <Label htmlFor="role" className={`block ${isRTL ? "text-right" : "text-left"} mb-2`}>
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
                <SelectItem value="captin_order">{t("captinOrder")}</SelectItem>
                <SelectItem value="helper">{t("helper")}</SelectItem>
                <SelectItem value="steward">{t("steward")}</SelectItem>
                <SelectItem value="manager">{t("manager")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="baseSalary" className={`block ${isRTL ? "text-right" : "text-left"} mb-2`}>
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
            <Label htmlFor="startDate" className={`block ${isRTL ? "text-right" : "text-left"} mb-2`}>
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
            <Label htmlFor="branches" className={`block ${isRTL ? "text-right" : "text-left"} mb-2`}>
              {t("branches")}
            </Label>
            <MultiSelect
              options={branchOptions}
              selected={formData.branchIds}
              onChange={(selectedBranches) => setFormData((prev) => ({ ...prev, branchIds: selectedBranches }))}
              placeholder={t("selectBranches")}
              className={isRTL ? "text-right" : "text-left"}
            />
          </div>

          {formData.role === "manager" && (
            <>
              <div>
                <Label htmlFor="email" className={`block ${isRTL ? "text-right" : "text-left"} mb-2`}>
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
                <Label htmlFor="password" className={`block ${isRTL ? "text-right" : "text-left"} mb-2`}>
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
