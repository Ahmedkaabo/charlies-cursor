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
import { formatSalary } from "@/lib/utils"

interface ManagersTableProps {
  managers: Employee[]
}

export function ManagersTable({ managers }: ManagersTableProps) {
  const { t, language } = useLanguage()
  const { isAdmin } = useAuth()
  const { branches } = useBranch()
  const { approveEmployee } = useEmployee()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

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

  const isRTL = language === "ar"

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className={`min-w-[180px] sticky ${isRTL ? "right-0" : "left-0"} bg-background z-10 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("employeeName")}
            </TableHead>
            <TableHead className={isRTL ? "text-right" : "text-left"}>{t("baseSalary")}</TableHead>
            <TableHead className={isRTL ? "text-right" : "text-left"}>{t("role")}</TableHead>
            <TableHead className={isRTL ? "text-right" : "text-left"}>{t("status")}</TableHead>
            <TableHead className={`text-center ${isRTL ? "text-left" : "text-right"}`}>{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {managers.map((manager) => (
            <TableRow key={manager.id}>
              <TableCell
                className={`font-medium sticky ${isRTL ? "right-0" : "left-0"} bg-background z-10 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                <div className="min-w-[180px] whitespace-nowrap">
                  <div className="font-semibold text-sm sm:text-base">{`${manager.firstName} ${manager.lastName}`}</div>
                  {manager.phone && <div className="text-xs sm:text-sm text-muted-foreground">{manager.phone}</div>}
                </div>
              </TableCell>
              <TableCell className={`text-sm whitespace-nowrap ${isRTL ? "text-right" : "text-left"}`}>
                {formatSalary(manager.baseSalary)} {t("egp")}
              </TableCell>
              <TableCell className={isRTL ? "text-right" : "text-left"}>
                <Badge className={`${getRoleBadgeColor(manager.role)} text-xs whitespace-nowrap`}>
                  {t(manager.role)}
                </Badge>
              </TableCell>
              <TableCell className={isRTL ? "text-right" : "text-left"}>
                <Badge variant={manager.status === "approved" ? "default" : "destructive"} className="text-xs">
                  {t(manager.status)}
                </Badge>
              </TableCell>
              <TableCell className={`text-center ${isRTL ? "text-left" : "text-right"}`}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isRTL ? "start" : "end"}>
                    <DropdownMenuItem onClick={() => handleEditClick(manager)} disabled={!isAdmin}>
                      {t("edit")}
                    </DropdownMenuItem>
                    {manager.status === "pending" && isAdmin && (
                      <DropdownMenuItem onClick={() => handleApproveClick(manager.id)}>{t("approve")}</DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedEmployee && (
        <EditEmployeeDialog employee={selectedEmployee} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />
      )}
    </div>
  )
}
