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
  const { getPermission, isInitialized } = useAuth()

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
  if (!getPermission('users', 'view')) {
    return null
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header />
      <div className="space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{t("users")}</h1>
          {getPermission && getPermission('users', 'edit') && <AddUserDialog />}
        </div>
        <UsersTable users={users} />
      </div>
    </div>
  )
} 