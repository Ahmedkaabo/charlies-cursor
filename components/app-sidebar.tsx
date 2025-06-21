"use client"

import type * as React from "react"
import { BarChart3, Calendar, Users, Building2, GitBranch, UserCog, Shield } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar, // Import useSidebar
} from "@/components/ui/sidebar"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context" // Import useAuth

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {} // Define props interface

const rolePermissions: Record<string, string[]> = {
  admin: ["dashboard", "payroll", "staff", "branches", "users", "roles"],
  manager: ["payroll", "staff"],
  // Add more roles and their permissions here
}

export function AppSidebar({ ...props }: AppSidebarProps) {
  const { t } = useLanguage()
  const { isAdmin, isManager, currentUser, hasPermission } = useAuth() // Get user roles and current user
  const { isMobile, setOpenMobile } = useSidebar()
  const pathname = usePathname()

  const userRole = currentUser?.role || "viewer"
  const allowedPages = rolePermissions[userRole] || []

  const allNavItems = [
    { title: "dashboard", url: "/dashboard", icon: BarChart3 },
    { title: "payroll", url: "/payroll", icon: Calendar },
    { title: "staff", url: "/staff", icon: Users },
    { title: "branches", url: "/branches", icon: GitBranch },
    { title: "users", url: "/users", icon: UserCog },
    { title: "Roles", url: "/roles", icon: Shield },
  ]

  const navigationItems = allNavItems.filter(item => hasPermission(item.title.toLowerCase()))

  const handleMenuItemClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" onClick={handleMenuItemClick}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Charlie's Cafe</span>
                  <span className="truncate text-xs">Management System</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className={isActive ? "bg-muted text-foreground" : ""}>
                      <Link href={item.url} onClick={handleMenuItemClick}>
                        <item.icon />
                        <span>{t(item.title)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
