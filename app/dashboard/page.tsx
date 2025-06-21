"use client"

import { Header } from "@/components/header"
import { useLanguage } from "@/contexts/language-context"
import { useEmployee } from "@/contexts/employee-context"
import { useBranch } from "@/contexts/branch-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, DollarSign, TrendingUp, Building2, Calendar, UserCheck, AlertTriangle, CheckCircle } from "lucide-react"
import { useMemo, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { t } = useLanguage()
  const { employees, isLoading: employeesLoading } = useEmployee()
  const { branches, isLoading: branchesLoading } = useBranch()
  const { isAdmin, isManager, isInitialized } = useAuth()
  const router = useRouter()

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

    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

    // Basic counts
    const totalEmployees = employees.length
    const totalBranches = branches.length
    const approvedEmployees = employees.filter((emp) => emp.status === "approved").length
    const pendingEmployees = employees.filter((emp) => emp.status === "pending").length

    // Payroll calculations
    const totalPayroll = employees.reduce((sum, emp) => {
      const baseAttendedDays = Object.values(emp.attendance || {}).reduce((daySum, val) => daySum + val, 0)
      const totalAdjustedDays = baseAttendedDays + (emp.bonus_days || 0) - (emp.penalty_days || 0)
      const finalSalary = (emp.base_salary / 30) * (totalAdjustedDays + 4) // +4 for weekends
      return sum + finalSalary
    }, 0)

    // Attendance calculations
    const attendanceData = employees.map((emp) => {
      const attendedDays = Object.values(emp.attendance || {}).reduce((sum, val) => sum + val, 0)
      const attendanceRate = (attendedDays / daysInMonth) * 100
      return { ...emp, attendanceRate, attendedDays }
    })

    const averageAttendance =
      attendanceData.length > 0
        ? attendanceData.reduce((sum, emp) => sum + emp.attendanceRate, 0) / attendanceData.length
        : 0

    // Role distribution
    const roleDistribution = employees.reduce(
      (acc, emp) => {
        acc[emp.role] = (acc[emp.role] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Branch distribution
    const branchDistribution = employees.reduce(
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

    // Attendance by role
    const attendanceByRole = employees.reduce(
      (acc, emp) => {
        const attendedDays = Object.values(emp.attendance || {}).reduce((sum, val) => sum + val, 0)
        const attendanceRate = (attendedDays / daysInMonth) * 100

        if (!acc[emp.role]) {
          acc[emp.role] = { total: 0, count: 0 }
        }
        acc[emp.role].total += attendanceRate
        acc[emp.role].count += 1
        return acc
      },
      {} as Record<string, { total: number; count: number }>,
    )

    // Convert to averages
    Object.keys(attendanceByRole).forEach((role) => {
      attendanceByRole[role] = attendanceByRole[role].count > 0 ? attendanceByRole[role].total / attendanceByRole[role].count : 0
    })

    // Recent activity (employees with low attendance)
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
      attendanceByRole,
    }
  }, [employees, branches, employeesLoading, branchesLoading])

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
                {stats.totalPayroll.toFixed(0)} {t("egp")}
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
              <CardDescription>{t("distributionOfEmployees")}</CardDescription>
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
                      {count} {t("employees")}
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
                    <div key={emp.id} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">
                          {emp.first_name} {emp.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{t(emp.role)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-orange-600">{emp.attendanceRate.toFixed(1)}%</p>
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
