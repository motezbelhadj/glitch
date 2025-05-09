"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MusicIcon, LogOut, ArrowLeft, User, Save, Loader2 } from "lucide-react"
import { userApi } from "@/lib/api"
import Link from "next/link"

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    } else {
      fetchUserProfile()
    }
  }, [isAuthenticated, router])

  const fetchUserProfile = async () => {
    setIsLoading(true)
    setError("")
    try {
      const userData = await userApi.getProfile()
      setUsername(userData.username || "")
      setFirstName(userData.first_name || "")
      setLastName(userData.last_name || "")
      setEmail(userData.email || "")
    } catch (err) {
      console.error("Error fetching user profile:", err)
      setError("Failed to load user profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")
    setSuccessMessage("")

    try {
      await userApi.updateProfile({
        username,
        first_name: firstName,
        last_name: lastName,
      })
      setSuccessMessage("Profile updated successfully!")
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("Failed to update profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link href="/dashboard" className="flex items-center">
            <MusicIcon className="h-8 w-8 mr-2 text-emerald-500" />
            <h1 className="text-2xl font-bold">GLITCH</h1>
          </Link>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" className="text-zinc-400 hover:text-white">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="text-zinc-400 hover:text-white"
              onClick={() => {
                logout()
                router.push("/")
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-emerald-500" />
                My Profile
              </CardTitle>
              <CardDescription className="text-zinc-400">Manage your account information</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-emerald-500" />
                  <p className="text-zinc-400">Loading profile...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm">
                      {error}
                    </div>
                  )}

                  {successMessage && (
                    <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded text-emerald-200 text-sm">
                      {successMessage}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-zinc-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-zinc-900 border-zinc-700 text-zinc-400"
                    />
                    <p className="text-xs text-zinc-500">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-zinc-300">
                      Username
                    </Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Your username"
                      required
                      className="bg-zinc-900 border-zinc-700 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-zinc-300">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Your first name"
                        className="bg-zinc-900 border-zinc-700 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-zinc-300">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Your last name"
                        className="bg-zinc-900 border-zinc-700 text-white"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-800/50 border-zinc-700 mt-6">
            <CardHeader>
              <CardTitle className="text-red-400">Danger Zone</CardTitle>
              <CardDescription className="text-zinc-400">Irreversible account actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="w-full">
                Delete Account
              </Button>
              <p className="text-xs text-zinc-500 mt-2">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
