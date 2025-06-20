"use client"

import { Header } from "@/components/header"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { UsersTable } from "@/components/users-table"
import { AddUserDialog } from "@/components/add-user-dialog"
import { useUser, UserProvider } from "@/contexts/user-context"

export default function UsersPage() {
  const { t } = useLanguage()
  const { users } = useUser()
  const { isAdmin } = useAuth()

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
          <AddUserDialog />
        </div>
        <UsersTable users={users} />
      </div>
    </div>
  )
}

// If not already wrapped, wrap this page in <UserProvider> at a higher level (e.g., _app or layout).
