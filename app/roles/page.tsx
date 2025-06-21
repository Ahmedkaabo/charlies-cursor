"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

const MODULES = ["dashboard", "payroll", "staff", "branches", "users", "roles"]

export default function RolesPage() {
  const { isAdmin } = useAuth()
  const [roles, setRoles] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [savingRole, setSavingRole] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [userPermsDraft, setUserPermsDraft] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!isAdmin) return
    fetchData()
  }, [isAdmin])

  async function fetchData() {
    setLoading(true)
    const { data: rolesData } = await supabase.from("roles").select("*")
    const { data: usersData } = await supabase.from("users").select("id, first_name, last_name, email, role, permissions")
    setRoles(rolesData || [])
    setUsers(usersData || [])
    setLoading(false)
  }

  async function handleRoleToggle(roleName: string, module: string, type: 'view' | 'edit') {
    setSavingRole(roleName)
    const role = roles.find((r) => r.name === roleName)
    const currentPerm = role.permissions?.[module] || { view: false, edit: false }
    const newPerms = {
      ...role.permissions,
      [module]: {
        ...currentPerm,
        [type]: !currentPerm[type]
      }
    }
    await supabase.from("roles").update({ permissions: newPerms }).eq("name", roleName)
    await fetchData()
    setSavingRole(null)
  }

  function startEditUser(user: any) {
    setEditingUser(user.id)
    setUserPermsDraft(user.permissions || {})
  }

  function handleUserPermToggle(module: string) {
    setUserPermsDraft((prev) => ({ ...prev, [module]: !prev[module] }))
  }

  async function saveUserPerms(user: any) {
    await supabase.from("users").update({ permissions: userPermsDraft }).eq("id", user.id)
    setEditingUser(null)
    await fetchData()
  }

  async function resetUserPerms(user: any) {
    await supabase.from("users").update({ permissions: null }).eq("id", user.id)
    setEditingUser(null)
    await fetchData()
  }

  if (!isAdmin) {
    return (
      <div className="flex-1 flex flex-col min-h-screen items-center justify-center">
        <Header />
        <div className="flex flex-col items-center justify-center flex-1">
          <h1 className="text-3xl font-bold mb-4 text-red-600">Access Denied</h1>
          <p className="text-lg text-muted-foreground mb-8">You do not have permission to view this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header />
      <div className="space-y-8 p-4 md:p-8 pt-6">
        <h1 className="text-2xl font-bold mb-4">Roles</h1>
        {/* Roles Table - Permissions as rows, Roles as columns */}
        <div className="border rounded-lg overflow-hidden mb-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permission</TableHead>
                {roles.map((role) => (
                  <TableHead key={role.name} className="text-left">
                    <div className="flex flex-col items-start">
                      <Badge variant={role.name === 'admin' ? 'default' : 'secondary'}>{role.name}</Badge>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {MODULES.map((mod) => (
                <TableRow key={mod}>
                  <TableCell className="font-medium">{mod.charAt(0).toUpperCase() + mod.slice(1)}</TableCell>
                  {roles.map((role) => (
                    <TableCell key={role.name} className="text-left">
                      <div className="flex flex-row items-center gap-4">
                        <label className="flex items-center gap-1">
                          <Checkbox
                            checked={!!role.permissions?.[mod]?.view}
                            onCheckedChange={() => handleRoleToggle(role.name, mod, 'view')}
                            disabled={role.name === 'admin' || savingRole === role.name}
                          />
                          <span className="text-xs">View</span>
                        </label>
                        <label className="flex items-center gap-1">
                          <Checkbox
                            checked={!!role.permissions?.[mod]?.edit}
                            onCheckedChange={() => handleRoleToggle(role.name, mod, 'edit')}
                            disabled={role.name === 'admin' || savingRole === role.name}
                          />
                          <span className="text-xs">Edit</span>
                        </label>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
} 