"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Plus, Minus, Eye } from "lucide-react"
import { AttendanceCalendar } from "./attendance-calendar"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import type { Employee, MonthKey } from "@/types/payroll"

interface AttendanceDialogProps {
  employee: Employee
  month: number
  year: number
  onEmployeeUpdate: (id: string, updates: Partial<Employee>) => void
  branchId?: string
}

export function AttendanceDialog({ employee, month, year, onEmployeeUpdate, branchId }: AttendanceDialogProps) {
  const { t, language } = useLanguage()
  const { isAdmin, isManager } = useAuth()
  const [open, setOpen] = useState(false)

  const canEdit = isAdmin || isManager

  const monthKey: MonthKey = `${year}-${String(month + 1).padStart(2, "0")}`

  const branchAttendance = branchId && employee.attendance?.[branchId]?.[monthKey] ? employee.attendance[branchId][monthKey] : {}
  const bonus = branchId && employee.bonus_days?.[branchId]?.[monthKey] ? employee.bonus_days[branchId][monthKey] : 0
  const penalty = branchId && employee.penalty_days?.[branchId]?.[monthKey] ? employee.penalty_days[branchId][monthKey] : 0

  const calculateBaseAttendedDays = (attendance: Record<number, number>) => {
    return Object.values(attendance).reduce((sum, value) => sum + value, 0)
  }

  const getSummary = () => {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const baseAttendedDays = calculateBaseAttendedDays(branchAttendance)
    const totalAdjustedDays = baseAttendedDays + bonus - penalty
    const absentDays = daysInMonth - baseAttendedDays
    return { baseAttendedDays, totalAdjustedDays, absentDays }
  }

  const summary = getSummary()
  const isRTL = language === "ar"

  const handleAttendanceChange = (day: number, value: number) => {
    if (!canEdit || !branchId) return
    const prev = employee.attendance?.[branchId]?.[monthKey] || {}
    const newMonthAttendance = { ...prev, [day]: value }
    const newBranchAttendance = {
      ...(employee.attendance?.[branchId] || {}),
      [monthKey]: newMonthAttendance,
    }
    const newFullAttendance = {
      ...employee.attendance,
      [branchId]: newBranchAttendance,
    }
    onEmployeeUpdate(employee.id, { attendance: newFullAttendance })
  }

  const adjustBonusDays = (amount: number) => {
    if (!canEdit || !branchId) return
    const prev = employee.bonus_days?.[branchId]?.[monthKey] || 0
    const newBonus = Math.max(0, prev + amount)
    const newBranchBonus = {
      ...(employee.bonus_days?.[branchId] || {}),
      [monthKey]: newBonus,
    }
    const newFullBonus = {
      ...employee.bonus_days,
      [branchId]: newBranchBonus,
    }
    onEmployeeUpdate(employee.id, { bonus_days: newFullBonus })
  }

  const adjustPenaltyDays = (amount: number) => {
    if (!canEdit || !branchId) return
    const prev = employee.penalty_days?.[branchId]?.[monthKey] || 0
    const newPenalty = Math.max(0, prev + amount)
    const newBranchPenalty = {
      ...(employee.penalty_days?.[branchId] || {}),
      [monthKey]: newPenalty,
    }
    const newFullPenalty = {
      ...employee.penalty_days,
      [branchId]: newBranchPenalty,
    }
    onEmployeeUpdate(employee.id, { penalty_days: newFullPenalty })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={!branchId}>
          {canEdit ? <Calendar className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {(branchId && calculateBaseAttendedDays(branchAttendance).toFixed(1)) || "N/A"} {t("days")}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-2xl h-[90vh] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className={`px-4 pt-4 pb-2 border-b ${isRTL ? "text-right" : "text-left"}`}>
          <DialogTitle className="text-lg">
            {t("attendance")} - {employee.first_name} {employee.last_name}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {canEdit ? t("markAttendanceDescription") : t("viewAttendanceDescription")}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <div className="space-y-4">
            {/* Calendar */}
            <AttendanceCalendar
              month={month}
              year={year}
              attendance={branchAttendance}
              onChange={handleAttendanceChange}
              startDate={employee.start_date}
              readOnly={!canEdit || !branchId}
            />

            {/* Legend */}
            <div className={`flex flex-wrap gap-4 text-sm ${isRTL ? "justify-end" : "justify-start"}`}>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-200 rounded flex items-center justify-center text-green-800 text-xs">
                  ✓
                </div>
                <span>{t("fullDay")} (1.0)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-gray-800 text-xs">
                  ✗
                </div>
                <span>{t("absentDay")} (0.0)</span>
              </div>
            </div>

            {/* Bonus/Penalty Sections */}
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 rounded-lg bg-green-50/50 border border-green-200">
                <Label htmlFor="bonus" className={`text-green-800 font-semibold ${isRTL ? "text-right" : "text-left"}`}>
                  {t("bonusDays")}
                </Label>
                <div className="flex items-center mt-2">
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => adjustBonusDays(-0.25)}
                      className={`bg-green-100 border-green-200 text-green-800 hover:bg-green-200 ${isRTL ? "rounded-l-none" : "rounded-r-none"}`}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                  <Input
                    id="bonus"
                    type="number"
                    step="0.25"
                    value={bonus.toFixed(2)}
                    readOnly
                    className={`flex-1 text-center bg-green-50 border-green-200 text-green-800 focus-visible:ring-0 ${!canEdit ? "rounded" : ""}`}
                  />
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => adjustBonusDays(0.25)}
                      className={`bg-green-100 border-green-200 text-green-800 hover:bg-green-200 ${isRTL ? "rounded-r-none" : "rounded-l-none"}`}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-red-50/50 border border-red-200">
                <Label htmlFor="penalty" className={`text-red-800 font-semibold ${isRTL ? "text-right" : "text-left"}`}>
                  {t("penaltyDays")}
                </Label>
                <div className="flex items-center mt-2">
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => adjustPenaltyDays(-0.25)}
                      className={`bg-red-100 border-red-200 text-red-800 hover:bg-red-200 ${isRTL ? "rounded-l-none" : "rounded-r-none"}`}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                  <Input
                    id="penalty"
                    type="number"
                    step="0.25"
                    value={penalty.toFixed(2)}
                    readOnly
                    className={`flex-1 text-center bg-red-50 border-red-200 text-red-800 focus-visible:ring-0 ${!canEdit ? "rounded" : ""}`}
                  />
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => adjustPenaltyDays(0.25)}
                      className={`bg-red-100 border-red-200 text-red-800 hover:bg-red-200 ${isRTL ? "rounded-r-none" : "rounded-l-none"}`}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{summary.baseAttendedDays.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">{t("baseAttendedDays")}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{summary.absentDays}</div>
                <div className="text-sm text-muted-foreground">{t("absentDaysCount")}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{summary.totalAdjustedDays.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">{t("totalAdjustedDays")}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed footer */}
        <DialogFooter className="px-4 py-3 border-t bg-background">
          <Button type="button" onClick={() => setOpen(false)} className="w-full sm:w-auto">
            {canEdit ? t("save") : t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
