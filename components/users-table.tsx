"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { useState } from "react"
import { useBranch } from "@/contexts/branch-context"
import { useUser, User } from "@/contexts/user-context"
import { Badge } from "@/components/ui/badge"
import { EditUserDialog } from "./edit-user-dialog"

interface UsersTableProps {
  users: User[]
}

export function UsersTable({ users }: UsersTableProps) {
  const { t, language } = useLanguage()
  const { branches } = useBranch()
  const { deleteUser, updateUser } = useUser()
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const getBranchBadges = (branchIds: string[] = []) => {
    if (!branchIds || branchIds.length === 0) return <Badge variant="outline">No Branches</Badge>
    if (branches && branchIds.length === branches.length) return <Badge variant="secondary">All Branches</Badge>
    return branchIds.map((id) => {
      const branch = branches.find((b) => b.id === id)
      return branch ? <Badge key={id} variant="secondary">{branch.name}</Badge> : null
    })
  }

  return (
    <>
        <div className="border rounded-lg overflow-hidden">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>{t("name")}</TableHead>
                <TableHead>{t("email")}</TableHead>
                <TableHead>{t("role")}</TableHead>
                <TableHead>{t("branches")}</TableHead>
                <TableHead className="text-right">{t("actions")}</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {users.map((user) => (
                <TableRow key={user.id}>
                <TableCell>{user.firstName} {user.lastName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell><Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{t(user.role)}</Badge></TableCell>
                <TableCell className="space-x-1">{getBranchBadges(user.branchIds)}</TableCell>
                <TableCell className="text-right">
                    {user.role !== 'admin' && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingUser(user)}>{t("edit")}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteUser(user.id)} className="text-red-600">{t("delete")}</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    )}
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
        </div>
        {editingUser && (
            <EditUserDialog
                user={editingUser}
                open={!!editingUser}
                onOpenChange={(open) => !open && setEditingUser(null)}
                onSave={(updates) => {
                    updateUser(editingUser.id, updates)
                    setEditingUser(null)
                }}
            />
        )}
    </>
  )
} 