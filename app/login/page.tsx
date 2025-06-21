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
  const [loading, setLoading] = useState(false)
  const { loginWithCredentials } = useAuth()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await loginWithCredentials(email, password)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-sm sm:max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-xl sm:text-2xl font-bold">Login to Charlie's Cafe</CardTitle>
          <CardDescription className="text-sm">Enter your credentials to access the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm">{t("email")}</Label>
              <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required className="text-base" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-sm">{t("password")}</Label>
              <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required className="text-base" />
            </div>
            {error && <p className="text-sm font-medium text-red-500 text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("loggingIn") : t("login")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
