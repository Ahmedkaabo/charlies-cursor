"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { LogOut, User, UserCog } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function ProfileDropdown() {
  const { logout, currentUser } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            {currentUser?.role === "admin" ? <UserCog className="h-5 w-5" /> : <User className="h-5 w-5" />}
            <span className="sr-only">Profile menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            {currentUser?.first_name} {currentUser?.last_name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>{t("profile")}</span>
          </DropdownMenuItem>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t("logout")}</span>
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent className="max-w-sm text-center p-6">
        <AlertDialogHeader className="flex flex-col items-center justify-center text-center">
          <div className="rounded-full border border-gray-200 p-4 bg-gray-100 mb-4">
            <LogOut className="h-8 w-8 text-gray-500" />
          </div>
          <AlertDialogTitle className="text-2xl font-bold">{t("areYouSure")}</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground mt-2">
            {t("logoutConfirmation")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex sm:justify-center gap-2 mt-6">
          <AlertDialogCancel className="w-full sm:w-auto px-6 py-2.5">{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLogout}
            className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white"
          >
            {t("logout")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
