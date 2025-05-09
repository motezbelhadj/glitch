"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MusicIcon, LogOut, Music, Upload, ListMusic, User } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <MusicIcon className="h-8 w-8 mr-2 text-emerald-500" />
            <h1 className="text-2xl font-bold">GLITCH</h1>
          </div>
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

        <div className="bg-zinc-800/50 rounded-lg p-6 mb-8 border border-zinc-700">
          <h2 className="text-xl font-semibold mb-2">Welcome, {user.username}!</h2>
          <p className="text-zinc-400">
            This is your dashboard. Browse music, upload your own songs, and create playlists.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Music className="h-5 w-5 mr-2 text-emerald-500" />
                Browse Music
              </CardTitle>
              <CardDescription className="text-zinc-400">Discover famous songs</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-emerald-500 hover:bg-emerald-600">
                <Link href="/dashboard/songs">Browse Songs</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2 text-emerald-500" />
                Upload Music
              </CardTitle>
              <CardDescription className="text-zinc-400">Share your own songs</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-emerald-500 hover:bg-emerald-600">
                <Link href="/dashboard/songs/upload">Upload Song</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <ListMusic className="h-5 w-5 mr-2 text-emerald-500" />
                Playlists
              </CardTitle>
              <CardDescription className="text-zinc-400">Create and manage playlists</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-emerald-500 hover:bg-emerald-600">
                <Link href="/dashboard/playlists">My Playlists</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-emerald-500" />
                Profile
              </CardTitle>
              <CardDescription className="text-zinc-400">Manage your account</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-emerald-500 hover:bg-emerald-600">
                <Link href="/dashboard/profile">My Profile</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
