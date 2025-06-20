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
  const { isAdmin, isManager } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAdmin && !isManager) {
      router.replace("/dashboard")
    }
  }, [isAdmin, isManager, router])

  useEffect(() => {
    if (branches.length > 0 && !selectedBranch) {
      setSelectedBranch(branches[0])
    }
  }, [branches, selectedBranch])

  const handleEmployeeUpdate = (id: string, updates: Partial<Employee>) => {
    updateEmployee(id, updates)
  }

  const handleExport = () => {
    const exportData = employeesForPayroll.map((emp) => {
      const baseAttendedDays = Object.values(emp.attendance).reduce((sum, val) => sum + val, 0)
      const totalAdjustedDays = baseAttendedDays + emp.bonusDays - emp.penaltyDays
      const finalSalary = (emp.baseSalary / 30) * (totalAdjustedDays + 4)

      return {
        firstName: emp.firstName,
        lastName: emp.lastName,
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
    .filter((emp) => (selectedBranch ? emp.branchIds.includes(selectedBranch.id) : true))
    .map((emp) => ({
      ...emp,
      month: selectedMonth,
      year: selectedYear,
    }))

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

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

          {/* Branch and Month Selectors */}
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
                  {(language === "ar" ? monthsAr : months).map((month, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={() => {
                        setSelectedMonth(index)
                        setSelectedYear(selectedYear)
                      }}
                      disabled={index !== currentMonth || selectedYear !== currentYear}
                    >
                      {month} {selectedYear}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right side - Action buttons */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleExport} variant="outline" className="gap-2 text-sm">
                <Download className="h-4 w-4" />
                {t("export")}
              </Button>
              {isAdmin && (
                <BulkAttendanceDialog employees={employeesForPayroll} onEmployeeUpdate={handleEmployeeUpdate} />
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
        />
      </div>
    </div>
  )
}
