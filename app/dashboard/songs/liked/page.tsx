"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MusicIcon, LogOut, ArrowLeft, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react"
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
  like_count: number
  dislike_count: number
  is_liked: boolean
  is_disliked: boolean
}

export default function LikedSongsPage() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [likedSongs, setLikedSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    } else {
      fetchLikedSongs()
    }
  }, [isAuthenticated, router])

  // Update current song index when current song changes
  useEffect(() => {
    if (currentSong) {
      const index = likedSongs.findIndex((song) => song.id === currentSong.id)
      setCurrentSongIndex(index)
    }
  }, [currentSong, likedSongs])

  const fetchLikedSongs = async () => {
    setIsLoading(true)
    setError("")
    try {
      console.log("Fetching liked songs...")
      const data = await songsApi.getLikedSongs()
      console.log("Liked songs fetched:", data)
      setLikedSongs(data)
    } catch (err) {
      console.error("Error fetching liked songs:", err)
      setError("Failed to load liked songs. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const playSong = (song: Song) => {
    setCurrentSong(song)
  }

  const handleNextSong = () => {
    if (likedSongs.length === 0 || currentSongIndex === -1) return

    const nextIndex = (currentSongIndex + 1) % likedSongs.length
    setCurrentSong(likedSongs[nextIndex])
  }

  const handlePreviousSong = () => {
    if (likedSongs.length === 0 || currentSongIndex === -1) return

    const prevIndex = (currentSongIndex - 1 + likedSongs.length) % likedSongs.length
    setCurrentSong(likedSongs[prevIndex])
  }

  // Update the handleLike function with better debugging and error handling
  const handleLike = async (song: Song, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent card click (which would play the song)
    console.log(`Liking song: ${song.id} - ${song.title}`)

    try {
      console.log("Before API call - Current like status:", song.is_liked)
      const response = await songsApi.likeSong(song.id)
      console.log("Like API response:", response)

      // If unliked, remove from list
      if (song.is_liked) {
        console.log("Song was liked, removing from liked songs list")
        setLikedSongs((prev) => prev.filter((s) => s.id !== song.id))
      }

      // Update current song if it's the one being liked
      if (currentSong && currentSong.id === song.id) {
        console.log("Updating current song after like")
        const wasLiked = currentSong.is_liked
        if (wasLiked) {
          console.log("Current song was liked, setting to null")
          setCurrentSong(null)
        }
      }
    } catch (err) {
      console.error("Error liking song:", err)
      setError(`Failed to like song: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  // Update the handleDislike function with better debugging and error handling
  const handleDislike = async (song: Song, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent card click (which would play the song)
    console.log(`Disliking song: ${song.id} - ${song.title}`)

    try {
      console.log("Before API call - Current dislike status:", song.is_disliked)
      const response = await songsApi.dislikeSong(song.id)
      console.log("Dislike API response:", response)

      // If disliked, remove from liked list
      console.log("Removing song from liked songs list after dislike")
      setLikedSongs((prev) => prev.filter((s) => s.id !== song.id))

      // Update current song if it's the one being disliked
      if (currentSong && currentSong.id === song.id) {
        console.log("Current song was disliked, setting to null")
        setCurrentSong(null)
      }
    } catch (err) {
      console.error("Error disliking song:", err)
      setError(`Failed to dislike song: ${err instanceof Error ? err.message : String(err)}`)
    }
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
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" className="text-zinc-400 hover:text-white">
              <Link href="/dashboard/songs">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Songs
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

        <div className="flex items-center mb-6">
          <ThumbsUp className="h-6 w-6 mr-2 text-emerald-500" />
          <h2 className="text-2xl font-bold">Liked Songs</h2>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 p-4 mb-6 rounded-md">
            <p>{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLikedSongs}
              className="mt-2 bg-transparent border-red-500 text-red-200 hover:bg-red-500/20"
            >
              Try Again
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-emerald-500" />
            <p>Loading liked songs...</p>
          </div>
        ) : likedSongs.length === 0 ? (
          <div className="text-center py-12 bg-zinc-800/50 rounded-lg border border-zinc-700">
            <p className="text-zinc-400 mb-4">You haven't liked any songs yet.</p>
            <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
              <Link href="/dashboard/songs">Browse Songs</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {likedSongs.map((song) => (
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

                  <div className="flex justify-between mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-2 text-emerald-500"
                      onClick={(e) => handleLike(song, e)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      <span>{song.like_count}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-2 text-zinc-400 hover:text-white"
                      onClick={(e) => handleDislike(song, e)}
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      <span>{song.dislike_count}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AudioPlayer song={currentSong} playlist={likedSongs} onNext={handleNextSong} onPrevious={handlePreviousSong} />
    </div>
  )
}
