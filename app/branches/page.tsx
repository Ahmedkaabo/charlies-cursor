"use client"

import { Header } from "@/components/header"
import { useLanguage } from "@/contexts/language-context"
import { useBranch } from "@/contexts/branch-context"
import { AddBranchDialog } from "@/components/add-branch-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/contexts/auth-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { EditBranchDialog } from "@/components/edit-branch-dialog"
import { useState } from "react"
import type { Branch } from "@/types/payroll"
import Link from "next/link"
import { useUser } from "@/contexts/user-context"
import { Badge } from "@/components/ui/badge"
import { useEmployee } from "@/contexts/employee-context"

// Utility to format 24h time to 12h AM/PM
function formatTime12h(time: string) {
  if (!time) return '';
  const [h, m] = time.split(":").map(Number);
  const hour = h % 12 === 0 ? 12 : h % 12;
  const ampm = h < 12 || h === 24 ? "AM" : "PM";
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export default function BranchesPage() {
  const { t, language } = useLanguage()
  const { branches, deleteBranch } = useBranch()
  const { getPermission, isInitialized } = useAuth()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const { users } = useUser()
  const { employees } = useEmployee()

  const handleEditClick = (branch: Branch) => {
    setSelectedBranch(branch)
    setIsEditDialogOpen(true)
  }

  const handleDeleteClick = (branchId: string) => {
    if (window.confirm("Are you sure you want to delete this branch?")) {
      deleteBranch(branchId)
    }
  }

  const isRTL = language === "ar"

  if (!isInitialized || !getPermission) {
    return (
      <div className="flex-1 flex flex-col min-h-screen items-center justify-center">
        <Header />
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="w-8 h-8 border-4 border-muted-foreground border-t-primary rounded-full animate-spin mb-4"></div>
          <p className="text-lg text-muted-foreground mb-8">Loading...</p>
        </div>
      </div>
    )
  }
  if (!getPermission('branches', 'view')) {
    return null
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header />
      <div className="space-y-8 p-4 md:p-8 pt-6">
        <div className="flex flex-row items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{t("branches")}</h1>
          {getPermission && getPermission('branches', 'add') && <AddBranchDialog />}
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={isRTL ? "text-right" : "text-left"}>{t("branchName")}</TableHead>
                <TableHead>{t("owners")}</TableHead>
                <TableHead>Staff Roles</TableHead>
                <TableHead>Shifts</TableHead>
                {getPermission && getPermission('branches', 'edit') && <TableHead className={isRTL ? "text-left" : "text-right"}>{t("actions")}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((branch) => {
                const owners = users.filter(u => u.role === "owner" && u.branch_ids.includes(branch.id));
                return (
                  <TableRow key={branch.id}>
                    <TableCell className={`font-medium ${isRTL ? "text-right" : "text-left"}`}>
                      <Link href={`/branches/${branch.id}`} className="text-primary underline hover:opacity-80 transition">
                        {branch.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {owners.length > 0 ? owners.map(o => o.first_name + " " + o.last_name).join(", ") : <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const staff = employees.filter(emp => emp.branch_ids.includes(branch.id));
                        const roleCounts: Record<string, number> = {};
                        staff.forEach(emp => {
                          if (emp.role) roleCounts[emp.role] = (roleCounts[emp.role] || 0) + 1;
                        });
                        const entries = Object.entries(roleCounts);
                        return entries.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {entries.map(([role, count]) => (
                              <span key={role} className="flex items-center gap-1">
                                <Badge variant="secondary">{role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}</Badge>
                                <span className="text-xs text-muted-foreground">x{count}</span>
                              </span>
                            ))}
                          </div>
                        ) : <span className="text-muted-foreground">-</span>;
                      })()}
                    </TableCell>
                    <TableCell>
                      {branch.shifts && branch.shifts.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {branch.shifts.map((s, idx) => (
                            <span key={idx} className="flex items-center gap-1">
                              <Badge variant="secondary">{s.name}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatTime12h(s.start)} - {formatTime12h(s.end)}
                              </span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    {getPermission && getPermission('branches', 'edit') && (
                      <TableCell className={isRTL ? "text-left" : "text-right"}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={isRTL ? "start" : "end"}>
                            <DropdownMenuItem onClick={() => handleEditClick(branch)}>{t("edit")}</DropdownMenuItem>
                            {getPermission && getPermission('branches', 'delete') && (
                              <DropdownMenuItem onClick={() => handleDeleteClick(branch.id)}>
                                {t("delete")}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {selectedBranch && (
          <EditBranchDialog branch={selectedBranch} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />
        )}
      </div>
    </div>
  )
}
