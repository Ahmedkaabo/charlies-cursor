"use client"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import type { Employee, MonthKey } from "@/types/payroll"
import { formatSalary } from "@/lib/utils"
import { AttendanceDialog } from "./attendance-dialog"
import { useState } from "react"
import { ArrowUp, ArrowDown } from "lucide-react"

interface PayrollTableProps {
  employees: Employee[]
  month: number
  year: number
  onEmployeeUpdate: (id: string, updates: Partial<Employee>) => void
  onExport: () => void
  branchId?: string
}

export function PayrollTable({ employees, month, year, onEmployeeUpdate, onExport, branchId }: PayrollTableProps) {
  const { t, language } = useLanguage()
  const { isAdmin, getPermission } = useAuth()
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null)

  const monthKey: MonthKey = `${year}-${String(month + 1).padStart(2, "0")}`

  const getRoleBadgeColor = (role: string) => {
    const colors: { [key: string]: string } = {
      waiter: "bg-blue-100 text-blue-800",
      barista: "bg-green-100 text-green-800",
      captin_order: "bg-pink-100 text-pink-800",
      helper: "bg-yellow-100 text-yellow-800",
      steward: "bg-orange-100 text-orange-800",
      manager: "bg-purple-100 text-purple-800",
    }
    return colors[role] || "bg-gray-100 text-gray-800"
  }

  const calculateBaseAttendedDays = (attendance: Record<number, number>) => {
    return Object.values(attendance).reduce((sum, value) => sum + value, 0)
  }

  const calculateFinalSalary = (employee: Employee) => {
    if (!branchId) return 0
    const branchAttendance: Record<number, number> = branchId ? (employee.attendance?.[branchId]?.[monthKey] || {}) : {}
    const baseAttendedDays = calculateBaseAttendedDays(branchAttendance)
    const bonus = branchId ? (employee.bonus_days?.[branchId]?.[monthKey] || 0) : 0
    const penalty = branchId ? (employee.penalty_days?.[branchId]?.[monthKey] || 0) : 0
    const totalAdjustedDays = baseAttendedDays + bonus - penalty
    return (employee.base_salary / 30) * (totalAdjustedDays + (employee.allowed_absent_days || 0))
  }

  const isRTL = language === "ar"

  const getSortedEmployees = () => {
    if (!sortConfig) return employees
    const sorted = [...employees]
    sorted.sort((a, b) => {
      let aValue: any
      let bValue: any
      switch (sortConfig.key) {
        case "employeeName":
          aValue = `${a.first_name} ${a.last_name}`.toLowerCase()
          bValue = `${b.first_name} ${b.last_name}`.toLowerCase()
          break
        case "role":
          aValue = a.role
          bValue = b.role
          break
        case "attendance":
          aValue = branchId ? calculateBaseAttendedDays(a.attendance?.[branchId]?.[monthKey] || {}) : 0
          bValue = branchId ? calculateBaseAttendedDays(b.attendance?.[branchId]?.[monthKey] || {}) : 0
          break
        case "bonusPenalty":
          aValue = branchId ? ((a.bonus_days?.[branchId]?.[monthKey] || 0) - (a.penalty_days?.[branchId]?.[monthKey] || 0)) : 0
          bValue = branchId ? ((b.bonus_days?.[branchId]?.[monthKey] || 0) - (b.penalty_days?.[branchId]?.[monthKey] || 0)) : 0
          break
        case "finalSalary":
          aValue = calculateFinalSalary(a)
          bValue = calculateFinalSalary(b)
          break
        default:
          aValue = 0
          bValue = 0
      }
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
      return 0
    })
    return sorted
  }

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" }
      }
      return { key, direction: "asc" }
    })
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead
                  className={`min-w-[180px] sticky ${isRTL ? "right-0" : "left-0"} bg-background z-10 ${isRTL ? "text-right" : "text-left"}`}
                  onClick={() => handleSort("employeeName")}
                  style={{ cursor: "pointer" }}
                >
                  {t("employeeName")}
                  {sortConfig?.key === "employeeName" && (sortConfig.direction === "asc" ? <ArrowUp className="inline ml-1 w-4 h-4" /> : <ArrowDown className="inline ml-1 w-4 h-4" />)}
                </TableHead>
                <TableHead
                  className={isRTL ? "text-right" : "text-left"}
                  onClick={() => handleSort("role")}
                  style={{ cursor: "pointer" }}
                >
                  {t("role")}
                  {sortConfig?.key === "role" && (sortConfig.direction === "asc" ? <ArrowUp className="inline ml-1 w-4 h-4" /> : <ArrowDown className="inline ml-1 w-4 h-4" />)}
                </TableHead>
                <TableHead
                  className={isRTL ? "text-right" : "text-left"}
                  onClick={() => handleSort("attendance")}
                  style={{ cursor: "pointer" }}
                >
                  {t("attendance")}
                  {sortConfig?.key === "attendance" && (sortConfig.direction === "asc" ? <ArrowUp className="inline ml-1 w-4 h-4" /> : <ArrowDown className="inline ml-1 w-4 h-4" />)}
                </TableHead>
                <TableHead
                  className={isRTL ? "text-right" : "text-left"}
                  onClick={() => handleSort("bonusPenalty")}
                  style={{ cursor: "pointer" }}
                >
                  {t("bonusPenalty")}
                  {sortConfig?.key === "bonusPenalty" && (sortConfig.direction === "asc" ? <ArrowUp className="inline ml-1 w-4 h-4" /> : <ArrowDown className="inline ml-1 w-4 h-4" />)}
                </TableHead>
                <TableHead
                  className={isRTL ? "text-right" : "text-left"}
                  onClick={() => handleSort("finalSalary")}
                  style={{ cursor: "pointer" }}
                >
                  {t("finalSalary")}
                  {sortConfig?.key === "finalSalary" && (sortConfig.direction === "asc" ? <ArrowUp className="inline ml-1 w-4 h-4" /> : <ArrowDown className="inline ml-1 w-4 h-4" />)}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getSortedEmployees().map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell
                    className={`font-medium sticky ${isRTL ? "right-0" : "left-0"} bg-background z-10 ${isRTL ? "text-right" : "text-left"}`}
                  >
                    <div className="min-w-[180px] whitespace-nowrap">
                      <div className="font-semibold text-sm sm:text-base">
                        {employee.first_name} {employee.last_name}
                      </div>
                      {employee.phone && <div className="text-xs sm:text-sm text-muted-foreground">{employee.phone}</div>}
                    </div>
                  </TableCell>
                  <TableCell className={isRTL ? "text-right" : "text-left"}>
                    <Badge className={`${getRoleBadgeColor(employee.role)} text-xs whitespace-nowrap`}>
                      {t(employee.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className={isRTL ? "text-right" : "text-left"}>
                    {branchId ? (
                      getPermission && getPermission('payroll', 'edit') ? (
                        <AttendanceDialog
                          employee={employee}
                          month={month}
                          year={year}
                          onEmployeeUpdate={onEmployeeUpdate}
                          branchId={branchId}
                        />
                      ) : (
                        <AttendanceDialog
                          employee={employee}
                          month={month}
                          year={year}
                          onEmployeeUpdate={onEmployeeUpdate}
                          branchId={branchId}
                          viewOnly={true}
                        />
                      )
                    ) : (
                      <span>-</span>
                    )}
                  </TableCell>
                  <TableCell className={`font-semibold text-sm whitespace-nowrap ${isRTL ? "text-right" : "text-left"}`}>
                    <div className="flex flex-col">
                      <span className="text-green-600">+{branchId ? (employee.bonus_days?.[branchId]?.[monthKey] || 0) : 0}</span>
                      <span className="text-red-600">-{branchId ? (employee.penalty_days?.[branchId]?.[monthKey] || 0) : 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className={`font-semibold text-sm whitespace-nowrap ${isRTL ? "text-right" : "text-left"}`}>
                    {formatSalary(calculateFinalSalary(employee))} {t("egp")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
