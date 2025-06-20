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
  const { allBranches } = useBranch()
  const { deleteUser } = useUser()
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const getBranchBadges = (branch_ids: string[] = [], role: string) => {
    if (role === "admin") {
      return <Badge variant="default">All Branches</Badge>
    }
    
    if (!branch_ids || branch_ids.length === 0) return <Badge variant="outline">No Branches</Badge>
    if (allBranches && branch_ids.length === allBranches.length) return <Badge variant="secondary">All Branches</Badge>
    return branch_ids.map((id) => {
      const branch = allBranches.find((b) => b.id === id)
      return branch ? <Badge key={id} variant="secondary">{branch.name}</Badge> : null
    })
  }
  
  const handleDelete = async (userId: string) => {
    try {
      await deleteUser(userId);
    } catch (error) {
      console.error("Failed to delete user", error);
      // Optionally: add toast notifications for user feedback
    }
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
                <TableCell>{user.first_name} {user.last_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell><Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{t(user.role)}</Badge></TableCell>
                <TableCell className="space-x-1">{getBranchBadges(user.branch_ids, user.role)}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-red-600">{t("delete")}</DropdownMenuItem>
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
            />
        )}
    </>
  )
} 