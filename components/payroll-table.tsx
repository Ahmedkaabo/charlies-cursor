"use client"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import type { Employee } from "@/types/payroll"
import { formatSalary } from "@/lib/utils"
import { AttendanceDialog } from "./attendance-dialog"

interface PayrollTableProps {
  employees: Employee[]
  month: number
  year: number
  onEmployeeUpdate: (id: string, updates: Partial<Employee>) => void
  onExport: () => void
}

export function PayrollTable({ employees, month, year, onEmployeeUpdate, onExport }: PayrollTableProps) {
  const { t, language } = useLanguage()
  const { isAdmin } = useAuth()

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
    const baseAttendedDays = calculateBaseAttendedDays(employee.attendance)
    const totalAdjustedDays = baseAttendedDays + employee.bonus_days - employee.penalty_days
    return (employee.base_salary / 30) * (totalAdjustedDays + (employee.allowed_absent_days || 0))
  }

  const isRTL = language === "ar"

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead
                  className={`min-w-[180px] sticky ${isRTL ? "right-0" : "left-0"} bg-background z-10 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("employeeName")}
                </TableHead>
                <TableHead className={isRTL ? "text-right" : "text-left"}>{t("role")}</TableHead>
                <TableHead className={isRTL ? "text-right" : "text-left"}>{t("attendance")}</TableHead>
                <TableHead className={isRTL ? "text-right" : "text-left"}>{t("totalDays")}</TableHead>
                <TableHead className={isRTL ? "text-right" : "text-left"}>{t("bonusPenalty")}</TableHead>
                <TableHead className={isRTL ? "text-right" : "text-left"}>{t("finalSalary")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell
                    className={`font-medium sticky ${isRTL ? "right-0" : "left-0"} bg-background z-10 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
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
                    <AttendanceDialog
                      employee={employee}
                      month={month}
                      year={year}
                      onEmployeeUpdate={onEmployeeUpdate}
                    />
                  </TableCell>
                  <TableCell className={`font-semibold text-sm whitespace-nowrap ${isRTL ? "text-right" : "text-left"}`}>
                    {calculateBaseAttendedDays(employee.attendance).toFixed(2)}
                  </TableCell>
                  <TableCell className={`font-semibold text-sm whitespace-nowrap ${isRTL ? "text-right" : "text-left"}`}>
                    <div className="flex flex-col">
                      <span className="text-green-600">+{employee.bonus_days}</span>
                      <span className="text-red-600">-{employee.penalty_days}</span>
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
