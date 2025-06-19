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

export default function BranchesPage() {
  const { t, language } = useLanguage()
  const { branches, deleteBranch } = useBranch()
  const { isAdmin } = useAuth()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)

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

  return (
    <div className="flex-1 flex flex-col">
      <Header />
      <div className="space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{t("branches")}</h1>
          {isAdmin && <AddBranchDialog />}
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={isRTL ? "text-right" : "text-left"}>{t("branchName")}</TableHead>
                {isAdmin && <TableHead className={isRTL ? "text-left" : "text-right"}>{t("actions")}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className={`font-medium ${isRTL ? "text-right" : "text-left"}`}>{branch.name}</TableCell>
                  {isAdmin && (
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
                          <DropdownMenuItem onClick={() => handleDeleteClick(branch.id)}>
                            {t("delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
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
