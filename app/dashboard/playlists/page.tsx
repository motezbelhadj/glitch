"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MusicIcon, LogOut, Plus, Loader2 } from "lucide-react"
import { playlistApi } from "@/lib/api"
import Image from "next/image"
import Link from "next/link"

interface Playlist {
  id: string
  name: string
  description?: string
  cover_image?: string
  is_public: boolean
  songs: any[]
}

export default function PlaylistsPage() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState("")
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    } else {
      fetchPlaylists()
    }
  }, [isAuthenticated, router])

  const fetchPlaylists = async () => {
    setIsLoading(true)
    setError("")
    try {
      console.log("Attempting to fetch playlists...")
      const data = await playlistApi.getAllPlaylists()
      console.log("Playlists fetched successfully:", data)
      setPlaylists(data)
    } catch (err: any) {
      console.error("Error fetching playlists:", err)
      setError(`Failed to load playlists: ${err.message || "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) return

    setIsCreating(true)
    setError("")

    try {
      console.log("Creating new playlist:", { name: newPlaylistName, description: newPlaylistDescription })

      const newPlaylist = await playlistApi.createPlaylist({
        name: newPlaylistName,
        description: newPlaylistDescription,
        is_public: true,
      })

      console.log("Playlist created successfully:", newPlaylist)

      setNewPlaylistName("")
      setNewPlaylistDescription("")
      setIsDialogOpen(false)

      // Refresh the playlists list
      fetchPlaylists()
    } catch (err: any) {
      console.error("Error creating playlist:", err)
      setError(`Failed to create playlist: ${err.message || "Unknown error"}`)
    } finally {
      setIsCreating(false)
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

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Playlists</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-500 hover:bg-emerald-600">
                <Plus className="h-4 w-4 mr-2" />
                Create Playlist
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-800 border-zinc-700 text-white">
              <DialogHeader>
                <DialogTitle>Create New Playlist</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="playlist-name">Playlist Name</Label>
                  <Input
                    id="playlist-name"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="My Awesome Playlist"
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="playlist-description">Description (Optional)</Label>
                  <Textarea
                    id="playlist-description"
                    value={newPlaylistDescription}
                    onChange={(e) => setNewPlaylistDescription(e.target.value)}
                    placeholder="Describe your playlist..."
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>
                <Button
                  onClick={createPlaylist}
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                  disabled={isCreating || !newPlaylistName.trim()}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Playlist"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 p-4 mb-6 rounded-md">
            <p>{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPlaylists}
              className="mt-2 bg-transparent border-red-500 text-red-200 hover:bg-red-500/20"
            >
              Try Again
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-emerald-500" />
            <p>Loading playlists...</p>
          </div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-12 bg-zinc-800/50 rounded-lg border border-zinc-700">
            <p className="text-zinc-400 mb-4">You don't have any playlists yet.</p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-emerald-500 hover:bg-emerald-600">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Playlist
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {playlists.map((playlist) => (
              <Link href={`/dashboard/playlists/${playlist.id}`} key={playlist.id}>
                <Card className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="aspect-square relative mb-3 overflow-hidden rounded-md">
                      {playlist.cover_image ? (
                        <Image
                          src={playlist.cover_image || "/placeholder.svg"}
                          alt={playlist.name}
                          fill
                          className="object-cover transition-transform hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-emerald-900 flex items-center justify-center text-white text-4xl">
                          {playlist.name[0]}
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-white truncate">{playlist.name}</h3>
                    <p className="text-zinc-400 text-sm truncate">{playlist.songs.length} songs</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
