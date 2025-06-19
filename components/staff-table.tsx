"use client"

import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { useBranch } from "@/contexts/branch-context"
import { useEmployee } from "@/contexts/employee-context"
import type { Employee } from "@/types/payroll"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { EditEmployeeDialog } from "./edit-employee-dialog"
import { useState } from "react"

interface StaffTableProps {
  staff: Employee[]
}

export function StaffTable({ staff }: StaffTableProps) {
  const { t, language } = useLanguage()
  const { isAdmin } = useAuth()
  const { branches } = useBranch()
  const { approveEmployee } = useEmployee()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  const getRoleBadgeColor = (role: Employee["role"]) => {
    const colors = {
      waiter: "bg-blue-100 text-blue-800",
      barista: "bg-green-100 text-green-800",
      captin_order: "bg-pink-100 text-pink-800",
      helper: "bg-yellow-100 text-yellow-800",
      steward: "bg-orange-100 text-orange-800",
      manager: "bg-purple-100 text-purple-800",
    }
    return colors[role] || "bg-gray-100 text-gray-800"
  }

  const getBranchNames = (branchIds: string[]) => {
    return branchIds
      .map((id) => {
        const branch = branches.find((b) => b.id === id)
        return branch ? branch.name : ""
      })
      .filter(Boolean)
      .join(", ")
  }

  const handleEditClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsEditDialogOpen(true)
  }

  const handleApproveClick = (employeeId: string) => {
    approveEmployee(employeeId)
  }

  const isRTL = language === "ar"

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead
                className={`min-w-[200px] sticky ${isRTL ? "right-0" : "left-0"} bg-background z-10 ${isRTL ? "text-right" : "text-left"}`}
              >
                {t("employeeName")}
              </TableHead>
              <TableHead className={`min-w-[100px] ${isRTL ? "text-right" : "text-left"}`}>{t("role")}</TableHead>
              <TableHead className={`min-w-[120px] ${isRTL ? "text-right" : "text-left"}`}>{t("baseSalary")}</TableHead>
              <TableHead className={`min-w-[100px] ${isRTL ? "text-right" : "text-left"}`}>{t("startDate")}</TableHead>
              <TableHead className={`min-w-[150px] ${isRTL ? "text-right" : "text-left"}`}>{t("branches")}</TableHead>
              <TableHead className={`min-w-[100px] ${isRTL ? "text-right" : "text-left"}`}>{t("status")}</TableHead>
              <TableHead className={`min-w-[80px] ${isRTL ? "text-left" : "text-right"}`}>{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell
                  className={`font-medium sticky ${isRTL ? "right-0" : "left-0"} bg-background z-10 ${isRTL ? "text-right" : "text-left"}`}
                >
                  <div className="min-w-[180px]">
                    <div className="font-semibold text-sm sm:text-base">
                      {employee.firstName} {employee.lastName}
                    </div>
                    {employee.phone && <div className="text-xs sm:text-sm text-muted-foreground">{employee.phone}</div>}
                  </div>
                </TableCell>
                <TableCell className={isRTL ? "text-right" : "text-left"}>
                  <Badge className={`${getRoleBadgeColor(employee.role)} text-xs`}>{t(employee.role)}</Badge>
                </TableCell>
                <TableCell className={`text-sm ${isRTL ? "text-right" : "text-left"}`}>
                  {employee.baseSalary.toFixed(2)} {t("egp")}
                </TableCell>
                <TableCell className={`text-sm ${isRTL ? "text-right" : "text-left"}`}>{employee.startDate}</TableCell>
                <TableCell className={`text-sm ${isRTL ? "text-right" : "text-left"}`}>
                  {getBranchNames(employee.branchIds)}
                </TableCell>
                <TableCell className={isRTL ? "text-right" : "text-left"}>
                  <Badge variant={employee.status === "approved" ? "default" : "destructive"} className="text-xs">
                    {t(employee.status)}
                  </Badge>
                </TableCell>
                <TableCell className={isRTL ? "text-left" : "text-right"}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isRTL ? "start" : "end"}>
                      <DropdownMenuItem onClick={() => handleEditClick(employee)} disabled={!isAdmin}>
                        {t("edit")}
                      </DropdownMenuItem>
                      {employee.status === "pending" && isAdmin && (
                        <DropdownMenuItem onClick={() => handleApproveClick(employee.id)}>
                          {t("approve")}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedEmployee && (
        <EditEmployeeDialog employee={selectedEmployee} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />
      )}
    </div>
  )
}
