"use client"

import { Header } from "@/components/header"
import { useLanguage } from "@/contexts/language-context"
import { useEmployee } from "@/contexts/employee-context"
import { ManagersTable } from "@/components/managers-table"
import { AddManagerDialog } from "@/components/add-manager-dialog"
import { useAuth } from "@/contexts/auth-context"

export default function ManagersPage() {
  const { t } = useLanguage()
  const { employees } = useEmployee()
  const { isAdmin } = useAuth()

  const managers = employees.filter((emp) => emp.role === "manager")

  return (
    <div className="flex-1 flex flex-col">
      {" "}
      {/* Removed padding from here */}
      <Header />
      <div className="space-y-4 p-4 md:p-8 pt-6">
        {" "}
        {/* Added padding to content below header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{t("managers")}</h1>
          {isAdmin && <AddManagerDialog />}
        </div>
        <ManagersTable managers={managers} />
      </div>
    </div>
  )
}
