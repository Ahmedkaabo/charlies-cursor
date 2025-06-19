"use client"

import { Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useLanguage } from "@/contexts/language-context"
import { ProfileDropdown } from "./profile-dropdown"

export function Header() {
  const { language, setLanguage } = useLanguage()

  return (
    <header className="flex h-14 sm:h-16 shrink-0 items-center gap-2 border-b px-3 sm:px-4">
      <SidebarTrigger className="-ml-1 h-8 w-8 sm:h-10 sm:w-10" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <div className="flex items-center gap-2 sm:gap-4 flex-1">{/* Spacer for mobile */}</div>

      {/* Language Toggle */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
            <Languages className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setLanguage("en")}>English</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLanguage("ar")}>العربية</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile Dropdown */}
      <ProfileDropdown />
    </header>
  )
}
