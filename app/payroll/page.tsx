"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { PayrollTable } from "@/components/payroll-table"
import { useLanguage } from "@/contexts/language-context"
import { useEmployee } from "@/contexts/employee-context"
import { useBranch } from "@/contexts/branch-context"
import type { Employee, Branch } from "@/types/payroll"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { BulkAttendanceDialog } from "@/components/bulk-attendance-dialog"
import { Download } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const monthsAr = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
]

export default function PayrollPage() {
  const { t, language } = useLanguage()
  const { employees, updateEmployee } = useEmployee()
  const { branches } = useBranch()
  const [selectedBranch, setSelectedBranch] = useState<Branch | undefined>(undefined)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const { isAdmin, isManager, isInitialized } = useAuth()
  const router = useRouter()

  if (!isInitialized) return null

  if (!isAdmin && !isManager) {
    return (
      <div className="flex-1 flex flex-col min-h-screen items-center justify-center">
        <Header />
        <div className="flex flex-col items-center justify-center flex-1">
          <h1 className="text-3xl font-bold mb-4 text-red-600">Access Denied</h1>
          <p className="text-lg text-muted-foreground mb-8">You do not have permission to view this page.</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (branches.length > 0 && !selectedBranch) {
      setSelectedBranch(branches[0])
    }
  }, [branches, selectedBranch])

  const handleEmployeeUpdate = (employeeId: string, updates: Partial<Employee>) => {
    // The logic to merge attendance is now handled within each dialog component
    // before calling onEmployeeUpdate.
    updateEmployee(employeeId, updates);
  }

  const handleExport = () => {
    if (!selectedBranch) return
    const exportData = employeesForPayroll.map((emp) => {
      const branchAttendance = emp.attendance?.[selectedBranch.id] || {}
      const baseAttendedDays = Object.values(branchAttendance).reduce((sum: number, val: number) => sum + val, 0)
      const totalAdjustedDays = baseAttendedDays + emp.bonus_days - emp.penalty_days
      const finalSalary = (emp.base_salary / 30) * (totalAdjustedDays + (emp.allowed_absent_days || 0))

      return {
        firstName: emp.first_name,
        lastName: emp.last_name,
        phone: `'${emp.phone}'`,
        amount: finalSalary.toFixed(2),
      }
    })

    const csvContent = [
      ["First Name", "Last Name", "Phone", "Amount"],
      ...exportData.map((row) => [row.firstName, row.lastName, row.phone, row.amount]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `payroll-${selectedBranch?.name || "all"}-${selectedMonth + 1}-${selectedYear}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const employeesForPayroll = employees
    .filter((emp) => (selectedBranch ? (emp.branch_ids || []).includes(selectedBranch.id) : true))
    .filter((emp) => {
      // Only approved
      if (emp.status !== 'approved') return false;
      // Only after start date
      const [startYear, startMonth] = emp.start_date.split('-').map(Number);
      if (selectedYear < startYear) return false;
      if (selectedYear === startYear && selectedMonth + 1 < startMonth) return false;
      return true;
    })
    .map((emp) => ({
      ...emp,
      month: selectedMonth,
      year: selectedYear,
    }))

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthYearOptions = Array.from({ length: 12 }, (_, m) => ({
    label: `${language === "ar" ? monthsAr[m] : months[m]} ${selectedYear}`,
    month: m,
    year: selectedYear,
  }))

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 space-y-4 p-3 sm:p-4 md:p-8 pt-4 sm:pt-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                {t("payroll")} – {selectedBranch ? selectedBranch.name : "All Branches"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Manage employee attendance and calculate salaries</p>
            </div>
          </div>

          {/* Branch and Month/Year Selectors */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Left side - Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 justify-between w-full sm:w-auto">
                    <span className="truncate">{selectedBranch ? selectedBranch.name : t("selectBranch")}</span>
                    <ChevronDown className="h-4 w-4 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {branches.map((branch) => (
                    <DropdownMenuItem key={branch.id} onClick={() => setSelectedBranch(branch)}>
                      {branch.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Month/Year Dropdown */}
              {isAdmin ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 justify-between w-full sm:w-auto">
                      <span>
                        {language === "ar" ? monthsAr[selectedMonth] : months[selectedMonth]} {selectedYear}
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {monthYearOptions.map((opt, idx) => (
                      <DropdownMenuItem
                        key={idx}
                        onClick={() => setSelectedMonth(opt.month)}
                      >
                        {opt.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="outline" className="gap-2 justify-between w-full sm:w-auto" disabled>
                  <span>
                    {language === "ar" ? monthsAr[selectedMonth] : months[selectedMonth]} {selectedYear}
                  </span>
                </Button>
              )}
            </div>

            {/* Right side - Action buttons */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleExport} variant="outline" className="gap-2 text-sm">
                <Download className="h-4 w-4" />
                {t("export")}
              </Button>
              {(isAdmin || isManager) && (
                <BulkAttendanceDialog 
                  employees={employeesForPayroll} 
                  onEmployeeUpdate={handleEmployeeUpdate}
                  branchId={selectedBranch?.id}
                  month={selectedMonth}
                  year={selectedYear}
                />
              )}
            </div>
          </div>
        </div>

        <PayrollTable
          employees={employeesForPayroll}
          month={selectedMonth}
          year={selectedYear}
          onEmployeeUpdate={handleEmployeeUpdate}
          onExport={handleExport}
          branchId={selectedBranch?.id}
        />
      </div>
    </div>
  )
}
