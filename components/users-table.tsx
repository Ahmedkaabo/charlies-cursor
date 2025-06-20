import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { useState } from "react"
import { useBranch } from "@/contexts/branch-context"
import { EditUserDialog } from "./edit-user-dialog"
import { useUser } from "@/contexts/user-context"
import { Badge } from "@/components/ui/badge"
import { AddUserDialog } from "./add-user-dialog"

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  branchIds: string[]
}

interface UsersTableProps {
  users: User[]
}

export function UsersTable({ users }: UsersTableProps) {
  const { t, language } = useLanguage()
  const { branches } = useBranch()
  const { updateUser } = useUser()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const isRTL = language === "ar"

  const getBranchBadges = (branchIds: string[]) => {
    if (branchIds.length === branches.length && branches.length > 0 && branchIds.every(id => branches.some(b => b.id === id))) {
      return <Badge variant="secondary">All Branches</Badge>
    }
    return branchIds
      .map((id) => {
        const branch = branches.find((b) => b.id === id)
        return branch ? <Badge key={id} variant="secondary">{branch.name}</Badge> : null
      })
  }

  // Sort users so admin@charlies.com is always first
  const sortedUsers = [...users].sort((a, b) => {
    if (a.email === 'admin@charlies.com') return -1;
    if (b.email === 'admin@charlies.com') return 1;
    return 0;
  })

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex justify-end p-2">
        <AddUserDialog />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={isRTL ? "text-right" : "text-left"}>{t("firstName")}</TableHead>
            <TableHead className={isRTL ? "text-right" : "text-left"}>{t("lastName")}</TableHead>
            <TableHead className={isRTL ? "text-right" : "text-left"}>{t("email")}</TableHead>
            <TableHead className={isRTL ? "text-right" : "text-left"}>{t("branches")}</TableHead>
            <TableHead className={`text-center ${isRTL ? "text-left" : "text-right"}`}>{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedUsers.map((user) => {
            const isAdminUser = user.email === 'admin@charlies.com';
            return (
              <TableRow key={user.id}>
                <TableCell className={isRTL ? "text-right" : "text-left"}>{user.firstName}</TableCell>
                <TableCell className={isRTL ? "text-right" : "text-left"}>{user.lastName}</TableCell>
                <TableCell className={isRTL ? "text-right" : "text-left"}>{user.email}</TableCell>
                <TableCell className={isRTL ? "text-right" : "text-left"}>{getBranchBadges(user.branchIds)}</TableCell>
                <TableCell className={`text-center ${isRTL ? "text-left" : "text-right"}`}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isRTL ? "start" : "end"}>
                      <DropdownMenuItem onClick={() => setSelectedUser(user)} disabled={isAdminUser}>
                        {t("edit")}
                      </DropdownMenuItem>
                      {!isAdminUser && (
                        <DropdownMenuItem>{t("delete")}</DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      {selectedUser && (
        <EditUserDialog
          user={selectedUser}
          open={!!selectedUser}
          onOpenChange={(open) => setSelectedUser(open ? selectedUser : null)}
          onSave={updateUser}
          branches={branches}
        />
      )}
    </div>
  )
} 