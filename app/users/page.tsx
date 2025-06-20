"use client"
import React from "react"
import { Header } from "@/components/header"
import { useLanguage } from "@/contexts/language-context"
import { UsersTable } from "@/components/users-table"
import { AddUserDialog } from "@/components/add-user-dialog"
import { useUser } from "@/contexts/user-context"
import { useAuth } from "@/contexts/auth-context"

export default function UsersPage() {
  const { t } = useLanguage()
  const { users } = useUser()
  const { isAdmin } = useAuth()

  if (!isAdmin) {
    return (
        <div className="flex-1 flex flex-col min-h-screen items-center justify-center">
            <Header/>
            <div className="text-center">
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground">You do not have permission to view this page.</p>
            </div>
        </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header />
      <div className="space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{t("users")}</h1>
          <AddUserDialog />
        </div>
        <UsersTable users={users} />
      </div>
    </div>
  )
} 