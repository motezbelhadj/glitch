"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MusicIcon, LogOut, Plus } from "lucide-react"
import { songsApi } from "@/lib/api"
import { AudioPlayer } from "@/components/audio-player"
import Image from "next/image"
import Link from "next/link"

interface Song {
  id: string
  title: string
  artist: string
  album?: string
  genre?: string
  audio_file: string
  cover_image?: string
  is_famous: boolean
  uploader_username?: string
}

export default function SongsPage() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [famousSongs, setFamousSongs] = useState<Song[]>([])
  const [userSongs, setUserSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    } else {
      fetchSongs()
    }
  }, [isAuthenticated, router])

  const fetchSongs = async () => {
    setIsLoading(true)
    setError("")
    try {
      // Fetch famous songs
      const famousSongsData = await songsApi.getAllSongs({ is_famous: "true" })
      setFamousSongs(famousSongsData)

      // Fetch user's uploaded songs
      const userSongsData = await songsApi.getAllSongs({ uploader: "me" })
      setUserSongs(userSongsData)
    } catch (err) {
      console.error("Error fetching songs:", err)
      setError("Failed to load songs. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const playSong = (song: Song) => {
    setCurrentSong(song)
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white pb-24">
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

        <Tabs defaultValue="famous" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList className="bg-zinc-800">
              <TabsTrigger value="famous">Famous Songs</TabsTrigger>
              <TabsTrigger value="my-songs">My Songs</TabsTrigger>
            </TabsList>
            <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
              <Link href="/dashboard/songs/upload">
                <Plus className="h-4 w-4 mr-2" />
                Upload Song
              </Link>
            </Button>
          </div>

          {error && <div className="bg-red-500/20 border border-red-500/50 p-4 mb-6 rounded-md">{error}</div>}

          <TabsContent value="famous" className="mt-0">
            {isLoading ? (
              <div className="text-center py-12">Loading famous songs...</div>
            ) : famousSongs.length === 0 ? (
              <div className="text-center py-12 text-zinc-400">No famous songs available yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {famousSongs.map((song) => (
                  <Card
                    key={song.id}
                    className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 transition-colors cursor-pointer"
                    onClick={() => playSong(song)}
                  >
                    <CardContent className="p-4">
                      <div className="aspect-square relative mb-3 overflow-hidden rounded-md">
                        {song.cover_image ? (
                          <Image
                            src={song.cover_image || "/placeholder.svg"}
                            alt={song.title}
                            fill
                            className="object-cover transition-transform hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-emerald-900 flex items-center justify-center text-white text-4xl">
                            {song.title[0]}
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-white truncate">{song.title}</h3>
                      <p className="text-zinc-400 text-sm truncate">{song.artist}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-songs" className="mt-0">
            {isLoading ? (
              <div className="text-center py-12">Loading your songs...</div>
            ) : userSongs.length === 0 ? (
              <div className="text-center py-12 text-zinc-400">
                You haven't uploaded any songs yet. Click "Upload Song" to get started.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {userSongs.map((song) => (
                  <Card
                    key={song.id}
                    className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 transition-colors cursor-pointer"
                    onClick={() => playSong(song)}
                  >
                    <CardContent className="p-4">
                      <div className="aspect-square relative mb-3 overflow-hidden rounded-md">
                        {song.cover_image ? (
                          <Image
                            src={song.cover_image || "/placeholder.svg"}
                            alt={song.title}
                            fill
                            className="object-cover transition-transform hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-emerald-900 flex items-center justify-center text-white text-4xl">
                            {song.title[0]}
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-white truncate">{song.title}</h3>
                      <p className="text-zinc-400 text-sm truncate">{song.artist}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AudioPlayer song={currentSong} />
    </div>
  )
}
