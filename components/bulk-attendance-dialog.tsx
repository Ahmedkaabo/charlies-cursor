"use client"

import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import type { Employee } from "@/types/payroll"
import { Users, Check, X } from "lucide-react"

interface BulkAttendanceDialogProps {
  employees: Employee[]
  onEmployeeUpdate: (id: string, updates: Partial<Employee>) => void
}

export function BulkAttendanceDialog({ employees, onEmployeeUpdate }: BulkAttendanceDialogProps) {
  const { t, language } = useLanguage()
  const { isAdmin, isManager } = useAuth()
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<"today" | "yesterday">("today")
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])

  const canEdit = isAdmin || isManager

  // Calculate today and yesterday dates
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const targetDate = selectedDate === "today" ? today : yesterday
  const targetDay = targetDate.getDate()

  const currentMonthEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (!emp.start_date) return false
      const employeeStartDate = new Date(emp.start_date)
      return employeeStartDate <= targetDate
    })
  }, [employees, targetDate])

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      waiter: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
      barista: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
      captin_order: "bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300",
      helper: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
      steward: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
      manager: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
    }
    return colors[role] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
  }

  const getAttendanceStatus = (employee: Employee) => {
    const attendance = employee.attendance || {}
    return attendance[targetDay] ?? 0
  }

  const handleEmployeeSelect = (employeeId: string, checked: boolean) => {
    setSelectedEmployees((prev) =>
      checked ? [...prev, employeeId] : prev.filter((id) => id !== employeeId)
    )
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedEmployees(checked ? currentMonthEmployees.map((emp) => emp.id) : [])
  }

  const handleBulkAttendance = (status: number) => {
    selectedEmployees.forEach((employeeId) => {
      const employee = currentMonthEmployees.find((emp) => emp.id === employeeId)
      if (employee) {
        const newAttendance = { ...employee.attendance, [targetDay]: status }
        onEmployeeUpdate(employeeId, { attendance: newAttendance })
      }
    })
    setSelectedEmployees([])
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }
  
  const isRTL = language === "ar"
  
  if (!canEdit) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Users className="h-4 w-4" />
          {t("bulkAttendance")}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className={`px-4 pt-4 pb-2 border-b ${isRTL ? "text-right" : "text-left"}`}>
          <DialogTitle className="text-lg">{t("bulkAttendanceTitle")}</DialogTitle>
          <DialogDescription className="text-sm">{t("bulkAttendanceDescription")}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          <div className="space-y-4">
            <div
              className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 ${isRTL ? "justify-end" : "justify-start"}`}
            >
              <label className="text-sm font-medium whitespace-nowrap">{t("selectDate")}:</label>
              <Select value={selectedDate} onValueChange={(value: "today" | "yesterday") => setSelectedDate(value)}>
                <SelectTrigger className="w-full sm:w-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">
                    {t("today")} ({formatDate(today)})
                  </SelectItem>
                  <SelectItem value="yesterday">
                    {t("yesterday")} ({formatDate(yesterday)})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            currentMonthEmployees.length > 0 &&
                            selectedEmployees.length === currentMonthEmployees.length
                          }
                          onCheckedChange={(checked) => handleSelectAll(!!checked)}
                        />
                      </TableHead>
                      <TableHead className={`min-w-[150px] ${isRTL ? "text-right" : "text-left"}`}>
                        {t("employee")}
                      </TableHead>
                      <TableHead className={`min-w-[80px] ${isRTL ? "text-right" : "text-left"}`}>
                        {t("role")}
                      </TableHead>
                      <TableHead className={`min-w-[100px] ${isRTL ? "text-right" : "text-left"}`}>
                        {t("currentStatus")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentMonthEmployees.map((employee) => {
                      const attendanceStatus = getAttendanceStatus(employee)
                      const isSelected = selectedEmployees.includes(employee.id)

                      return (
                        <TableRow key={employee.id} data-state={isSelected ? "selected" : ""}>
                          <TableCell>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => handleEmployeeSelect(employee.id, !!checked)}
                            />
                          </TableCell>
                          <TableCell className={`${isRTL ? "text-right" : "text-left"} font-medium`}>
                            <div>
                              <div className="font-medium text-sm">
                                {employee.first_name} {employee.last_name}
                              </div>
                              <div className="text-xs text-muted-foreground">{employee.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell className={isRTL ? "text-right" : "text-left"}>
                            <Badge className={`${getRoleBadgeColor(employee.role)} text-xs`}>{t(employee.role)}</Badge>
                          </TableCell>
                          <TableCell className={isRTL ? "text-right" : "text-left"}>
                            <Badge variant={attendanceStatus === 1 ? "default" : "destructive"} className="text-xs">
                              {attendanceStatus === 1 ? t("present") : t("absent")}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-auto">
          <div className={`px-4 py-3 border-b bg-muted/50 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
            <div
              className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 ${isRTL ? "sm:justify-end" : "sm:justify-start"}`}
            >
              <span className="text-sm font-medium">
                {selectedEmployees.length > 0
                  ? `${selectedEmployees.length} ${t("employeesSelected")}`
                  : t("noEmployeesSelected")}
              </span>
              <div className={`flex gap-2 w-full sm:w-auto ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
                <Button
                  size="sm"
                  onClick={() => handleBulkAttendance(1)}
                  className="gap-1 flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white"
                  disabled={selectedEmployees.length === 0}
                >
                  <Check className="h-4 w-4" />
                  {t("markPresent")}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBulkAttendance(0)}
                  className="gap-1 flex-1 sm:flex-none"
                  disabled={selectedEmployees.length === 0}
                >
                  <X className="h-4 w-4" />
                  {t("markAbsent")}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="px-4 py-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
              {t("close")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
