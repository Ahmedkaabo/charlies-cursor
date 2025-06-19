"use client"

import { Header } from "@/components/header"
import { useLanguage } from "@/contexts/language-context"
import { StaffTable } from "@/components/staff-table"
import { AddEmployeeDialog } from "@/components/add-employee-dialog"
import { useEmployee } from "@/contexts/employee-context"

export default function StaffPage() {
  const { t } = useLanguage()
  const { employees } = useEmployee()

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 space-y-4 p-3 sm:p-4 md:p-8 pt-4 sm:pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("staff")}</h1>
          <AddEmployeeDialog />
        </div>
        <StaffTable staff={employees} />
      </div>
    </div>
  )
}
