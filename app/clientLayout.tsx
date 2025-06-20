"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { LanguageProvider, useLanguage } from "@/contexts/language-context" // Import useLanguage
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import { EmployeeProvider } from "@/contexts/employee-context"
import { BranchProvider } from "@/contexts/branch-context"
import { redirect, usePathname } from "next/navigation"
import { useEffect } from "react"
import { Toaster } from "@/components/ui/toaster"
import { UserProvider } from "@/contexts/user-context"

const inter = Inter({ subsets: ["latin"] })

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth()
  const pathname = usePathname()
  const { language } = useLanguage() // Get language from context

  useEffect(() => {
    if (!isLoggedIn && pathname !== "/login") {
      redirect("/login")
    }
    if (isLoggedIn && pathname === "/login") {
      redirect("/dashboard")
    }
  }, [isLoggedIn, pathname])

  if (!isLoggedIn && pathname !== "/login") {
    return null
  }

  // Determine sidebar side based on language
  const sidebarSide = language === "ar" ? "right" : "left"

  // Render children directly if on login page, otherwise render with sidebar structure
  if (pathname === "/login") {
    return <>{children}</>
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar side={sidebarSide} /> {/* Pass side prop */}
        <SidebarInset side={sidebarSide} className="flex-1 overflow-hidden">
          {children}
        </SidebarInset>{" "}
        {/* Pass side prop */}
      </div>
    </SidebarProvider>
  )
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <AuthProvider>
            <UserProvider>
              <BranchProvider>
                <EmployeeProvider>
                  <AuthWrapper>{children}</AuthWrapper>
                  <Toaster />
                </EmployeeProvider>
              </BranchProvider>
            </UserProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
