"use client"

import { Header } from "@/components/header"
import { useLanguage } from "@/contexts/language-context"
import { StaffTable } from "@/components/staff-table"
import { AddEmployeeDialog } from "@/components/add-employee-dialog"
import { useEmployee } from "@/contexts/employee-context"
import { useAuth } from "@/contexts/auth-context"

export default function StaffPage() {
  const { t } = useLanguage()
  const { employees } = useEmployee()
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
  if (!getPermission('staff', 'view')) {
    return null
  }
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 space-y-4 p-3 sm:p-4 md:p-8 pt-4 sm:pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("staff")}</h1>
          {getPermission && getPermission('staff', 'add') && <AddEmployeeDialog />}
        </div>
        <StaffTable staff={employees} />
      </div>
    </div>
  )
}
