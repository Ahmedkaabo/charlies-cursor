"use client"

import { Header } from "@/components/header"
import { useLanguage } from "@/contexts/language-context"
import { useEmployee } from "@/contexts/employee-context"
import { UsersTable } from "@/components/users-table"
import { AddUserDialog } from "@/components/add-user-dialog"
import { useAuth } from "@/contexts/auth-context"

export default function UsersPage() {
  const { t } = useLanguage()
  const { employees } = useEmployee()
  const { isAdmin } = useAuth()

  const users = employees.filter((emp) => emp.email)

  return (
    <div className="flex-1 flex flex-col">
      {" "}
      {/* Removed padding from here */}
      <Header />
      <div className="space-y-4 p-4 md:p-8 pt-6">
        {" "}
        {/* Added padding to content below header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{t("users")}</h1>
          {isAdmin && <AddUserDialog />}
        </div>
        <UsersTable users={users} />
      </div>
    </div>
  )
}
