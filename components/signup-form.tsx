"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/auth-context"
import { Loader2 } from "lucide-react"

export function SignupForm() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { signup } = useAuth()

  // Update the handleSubmit function to include better error handling and debugging
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      // Log the API URL for debugging
      console.log("API URL:", process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api")

      await signup(username, email, password)
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Signup error details:", err)
      // More descriptive error message
      setError(err.message || "Failed to create account. Please check if the backend server is running.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-zinc-800/50 p-6 rounded-lg border border-zinc-700">
      {error && <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm">{error}</div>}

      <div className="space-y-2">
        <Label htmlFor="username" className="text-zinc-300">
          Username
        </Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="cooluser123"
          required
          className="bg-zinc-900 border-zinc-700 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-zinc-300">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="bg-zinc-900 border-zinc-700 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-zinc-300">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="bg-zinc-900 border-zinc-700 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-zinc-300">
          Confirm Password
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="bg-zinc-900 border-zinc-700 text-white"
        />
      </div>

      <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Sign up"
        )}
      </Button>
    </form>
  )
}
