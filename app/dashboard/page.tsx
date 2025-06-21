"use client"

import { Header } from "@/components/header"
import { useLanguage } from "@/contexts/language-context"
import { useEmployee } from "@/contexts/employee-context"
import { useBranch } from "@/contexts/branch-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, DollarSign, TrendingUp, Building2, Calendar, UserCheck, AlertTriangle, CheckCircle } from "lucide-react"
import { useMemo, useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Employee } from "@/types/payroll"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function DashboardPage() {
  const { t, language } = useLanguage()
  const { employees, isLoading: employeesLoading } = useEmployee()
  const { branches, isLoading: branchesLoading } = useBranch()
  const { isAdmin, isManager, isInitialized } = useAuth()
  const router = useRouter()
  const months = language === "ar"
    ? ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
    : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const [selectedBranch, setSelectedBranch] = useState<string | null>("all")
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth)
  const [selectedYear] = useState<number>(currentYear)
  const monthYearOptions = Array.from({ length: currentYear === selectedYear ? currentMonth + 1 : 12 }, (_, m) => ({
    label: `${months[m]} ${selectedYear}`,
    month: m,
    year: selectedYear,
  }))

  if (!isInitialized) return null

  // If a manager logs in, redirect them to the payroll page.
  useEffect(() => {
    if (isManager) {
      router.replace("/payroll")
    }
  }, [isManager, router])

  // Show access denied for anyone who is not an admin.
  if (!isAdmin) {
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

  const filteredEmployees = useMemo(() => {
    let filtered = employees
    if (selectedBranch && selectedBranch !== "all") {
      filtered = filtered.filter(emp => emp.branch_ids?.includes(selectedBranch))
    }
    // Only approved and started
    filtered = filtered.filter(emp => {
      if (emp.status !== 'approved') return false;
      const [startYear, startMonth] = emp.start_date.split('-').map(Number);
      if (selectedYear < startYear) return false;
      if (selectedYear === startYear && selectedMonth + 1 < startMonth) return false;
      return true;
    })
    return filtered
  }, [employees, selectedBranch, selectedYear, selectedMonth])

  const stats = useMemo(() => {
    if (employeesLoading || branchesLoading) {
      return {
        totalEmployees: 0,
        totalBranches: 0,
        approvedEmployees: 0,
        pendingEmployees: 0,
        totalPayroll: 0,
        averageAttendance: 0,
        roleDistribution: {},
        branchDistribution: {},
        recentActivity: [],
        attendanceByRole: {},
      }
    }

    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()

    const calculateTotalAttendedDays = (employee: Employee): number => {
      if (!employee.attendance) return 0;
      let totalDays = 0;
      // Only count attendance for the selected month/year and branch
      if (selectedBranch && selectedBranch !== "all") {
        const branchAttendance = employee.attendance[selectedBranch]?.[`${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`] || {}
        totalDays = Object.values(branchAttendance).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0)
      } else {
        // All branches
        for (const branchId in employee.attendance) {
          const branchAttendance = employee.attendance[branchId]?.[`${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`] || {}
          totalDays += Object.values(branchAttendance).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0)
        }
      }
      return totalDays;
    }

    const totalPayroll = filteredEmployees.reduce((sum, emp) => {
      let employeeTotalSalary = 0;
      if (selectedBranch && selectedBranch !== "all") {
        // Only selected branch
        const branchAttendance = emp.attendance[selectedBranch]?.[`${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`] || {}
        const baseAttendedDays = Object.values(branchAttendance).reduce((s, v) => s + (typeof v === 'number' ? v : 0), 0)
        const bonus = emp.bonus_days?.[selectedBranch]?.[`${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`] || 0
        const penalty = emp.penalty_days?.[selectedBranch]?.[`${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`] || 0
        const totalAdjustedDays = baseAttendedDays + bonus - penalty
        employeeTotalSalary = (emp.base_salary / 30) * (totalAdjustedDays + (emp.allowed_absent_days || 0))
      } else {
        // All branches
        for (const branchId of emp.branch_ids || []) {
          const branchAttendance = emp.attendance[branchId]?.[`${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`] || {}
          const baseAttendedDays = Object.values(branchAttendance).reduce((s, v) => s + (typeof v === 'number' ? v : 0), 0)
          const bonus = emp.bonus_days?.[branchId]?.[`${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`] || 0
          const penalty = emp.penalty_days?.[branchId]?.[`${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`] || 0
          const totalAdjustedDays = baseAttendedDays + bonus - penalty
          employeeTotalSalary += (emp.base_salary / 30) * (totalAdjustedDays + (emp.allowed_absent_days || 0))
        }
      }
      return sum + employeeTotalSalary;
    }, 0)

    const totalEmployees = filteredEmployees.length
    const totalBranches = branches.length
    const approvedEmployees = filteredEmployees.filter((emp) => emp.status === "approved").length
    const pendingEmployees = filteredEmployees.filter((emp) => emp.status === "pending").length

    const attendanceData = filteredEmployees.map((emp) => {
      const totalAttendedDays = calculateTotalAttendedDays(emp)
      const potentialWorkDays = daysInMonth * (emp.branch_ids?.length || 1)
      const attendanceRate = potentialWorkDays > 0 ? (totalAttendedDays / potentialWorkDays) * 100 : 0
      return { ...emp, attendanceRate, attendedDays: totalAttendedDays }
    })

    const averageAttendance =
      attendanceData.length > 0
        ? attendanceData.reduce((sum, emp) => sum + emp.attendanceRate, 0) / attendanceData.length
        : 0

    const roleDistribution = filteredEmployees.reduce(
      (acc, emp) => {
        acc[emp.role] = (acc[emp.role] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const branchDistribution = filteredEmployees.reduce(
      (acc, emp) => {
        (emp.branch_ids || []).forEach((branchId) => {
          const branch = branches.find((b) => b.id === branchId)
          if (branch) {
            acc[branch.name] = (acc[branch.name] || 0) + 1
          }
        })
        return acc
      },
      {} as Record<string, number>,
    )

    const attendanceByRole = attendanceData.reduce(
      (acc, emp) => {
        if (!acc[emp.role]) {
          acc[emp.role] = { totalRate: 0, count: 0 }
        }
        acc[emp.role].totalRate += emp.attendanceRate
        acc[emp.role].count += 1
        return acc
      },
      {} as Record<string, { totalRate: number; count: number }>,
    )
    
    const finalAttendanceByRole: Record<string, number> = {}
    for (const role in attendanceByRole) {
      finalAttendanceByRole[role] = attendanceByRole[role].totalRate / attendanceByRole[role].count
    }

    const recentActivity = attendanceData
      .filter((emp) => emp.attendanceRate < 80)
      .sort((a, b) => a.attendanceRate - b.attendanceRate)
      .slice(0, 5)

    return {
      totalEmployees,
      totalBranches,
      approvedEmployees,
      pendingEmployees,
      totalPayroll,
      averageAttendance,
      roleDistribution,
      branchDistribution,
      recentActivity,
      attendanceByRole: finalAttendanceByRole,
    }
  }, [filteredEmployees, branches, employeesLoading, branchesLoading, selectedMonth, selectedYear, selectedBranch])

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      waiter: "bg-blue-100 text-blue-800",
      barista: "bg-green-100 text-green-800",
      captin_order: "bg-pink-100 text-pink-800",
      helper: "bg-yellow-100 text-yellow-800",
      steward: "bg-orange-100 text-orange-800",
      manager: "bg-purple-100 text-purple-800",
    }
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  if (employeesLoading || branchesLoading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 space-y-4 p-3 sm:p-4 md:p-8 pt-4 sm:pt-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("dashboard")}</h1>
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 space-y-6 p-3 sm:p-4 md:p-8 pt-4 sm:pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("dashboard")}</h1>
            <p className="text-muted-foreground">{t("welcomeMessage")}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
          {/* Branch Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 justify-between w-full sm:w-auto">
                <span className="truncate">{selectedBranch === "all" ? "All Branches" : branches.find(b => b.id === selectedBranch)?.name || t("selectBranch")}</span>
                <ChevronDown className="h-4 w-4 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem value="all" onClick={() => setSelectedBranch("all")}>All Branches</DropdownMenuItem>
              {branches.map((branch) => (
                <DropdownMenuItem key={branch.id} onClick={() => setSelectedBranch(branch.id)}>
                  {branch.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Month Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 justify-between w-full sm:w-auto">
                <span>{monthYearOptions[selectedMonth].label}</span>
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
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("totalEmployees")}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">
                  {stats.approvedEmployees} {t("approved")}
                </span>
                {stats.pendingEmployees > 0 && (
                  <span className="text-orange-600 ml-2">
                    {stats.pendingEmployees} {t("pending")}
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("monthlyPayroll")}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.ceil(stats.totalPayroll / 5) * 5} {t("egp")}
              </div>
              <p className="text-xs text-muted-foreground">{t("estimatedForCurrentMonth")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("averageAttendance")}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageAttendance.toFixed(1)}%</div>
              <Progress value={stats.averageAttendance} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("activeBranches")}</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBranches}</div>
              <p className="text-xs text-muted-foreground">{t("operationalLocations")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Role Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t("staffByRole")}
              </CardTitle>
              <CardDescription>{t("Distribution of employees")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(stats.roleDistribution).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleBadgeColor(role)}>{t(role)}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{count}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(count / stats.totalEmployees) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Branch Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {t("staffByBranch")}
              </CardTitle>
              <CardDescription>{t("employeeDistribution")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(stats.branchDistribution).map(([branch, count]) => (
                <div key={branch} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{branch}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {count} {t("")}
                    </span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(count / stats.totalEmployees) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Attendance by Role */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t("attendanceByRole")}
              </CardTitle>
              <CardDescription>{t("averageAttendanceRates")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(stats.attendanceByRole).map(([role, rate]) => (
                <div key={role} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className={getRoleBadgeColor(role)}>{t(role)}</Badge>
                    <span className="text-sm font-medium">{Number(rate).toFixed(1)}%</span>
                  </div>
                  <Progress value={Number(rate)} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Low Attendance Alert */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                {t("attendanceAlerts")}
              </CardTitle>
              <CardDescription>{t("employeesBelow80")}</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentActivity.length === 0 ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">{t("allEmployeesGoodAttendance")}</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentActivity.map((emp) => (
                    <div key={emp.id} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg dark:bg-orange-900/50">
                      <div>
                        <p className="text-sm font-medium">
                          {emp.first_name} {emp.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{t(emp.role)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-orange-600 dark:text-orange-400">{emp.attendanceRate.toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">
                          {emp.attendedDays} {t("days")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t("quickActions")}</CardTitle>
            <CardDescription>{t("commonTasksShortcuts")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/payroll"
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <UserCheck className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium">{t("markAttendanceAction")}</p>
                  <p className="text-xs text-muted-foreground">{t("bulkAttendanceManagement")}</p>
                </div>
              </Link>
              <Link
                href="/staff"
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium">{t("addEmployeeAction")}</p>
                  <p className="text-xs text-muted-foreground">{t("registerNewStaff")}</p>
                </div>
              </Link>
              <Link
                href="/payroll"
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <DollarSign className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="font-medium">{t("generatePayroll")}</p>
                  <p className="text-xs text-muted-foreground">{t("calculateMonthlySalaries")}</p>
                </div>
              </Link>
              <Link
                href="/branches"
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <Building2 className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="font-medium">{t("manageBranches")}</p>
                  <p className="text-xs text-muted-foreground">{t("addOrEditLocations")}</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
