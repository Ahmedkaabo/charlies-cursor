"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"

export default function LoginPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login } = useAuth()
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (email === "admin@charlies.com" && password === "Medo123!'") {
      login("admin")
      router.push("/dashboard")
    } else {
      setError("Invalid email or password.")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-sm sm:max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-xl sm:text-2xl font-bold">Login to Charlie's Cafe</CardTitle>
          <CardDescription className="text-sm">Enter your credentials to access the payroll system.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm">
                {t("email")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-base" // Prevents zoom on iOS
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-sm">
                {t("password")}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-base" // Prevents zoom on iOS
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
