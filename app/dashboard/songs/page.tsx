"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MusicIcon, LogOut, Plus, ThumbsUp, ThumbsDown, Loader2, Heart } from "lucide-react"
import { songsApi } from "@/lib/api"
import { AudioPlayer } from "@/components/audio-player"
import { SearchBar } from "@/components/search-bar"
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
  // Make these fields optional with default values
  like_count?: number
  dislike_count?: number
  is_liked?: boolean
  is_disliked?: boolean
}

export default function SongsPage() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [famousSongs, setFamousSongs] = useState<Song[]>([])
  const [userSongs, setUserSongs] = useState<Song[]>([])
  const [searchResults, setSearchResults] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("famous")
  const [searchQuery, setSearchQuery] = useState("")

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
      console.log("Fetching songs...")

      // Fetch famous songs
      const famousSongsData = await songsApi.getAllSongs({ is_famous: "true" })
      console.log("Famous songs fetched:", famousSongsData)
      setFamousSongs(famousSongsData)

      // Fetch user's uploaded songs
      const userSongsData = await songsApi.getAllSongs({ uploader: "me" })
      console.log("User songs fetched:", userSongsData)
      setUserSongs(userSongsData)
    } catch (err) {
      console.error("Error fetching songs:", err)
      setError("Failed to load songs. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)

    if (!query.trim()) {
      setSearchResults([])
      setActiveTab("famous")
      return
    }

    setIsSearching(true)
    setActiveTab("search")

    try {
      const results = await songsApi.searchSongs(query)
      setSearchResults(results)
    } catch (err) {
      console.error("Error searching songs:", err)
      setError("Failed to search songs. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  const playSong = (song: Song) => {
    setCurrentSong(song)
  }

  // Update the handleLike function with better debugging and error handling
  const handleLike = async (song: Song, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent card click (which would play the song)
    console.log(`Liking song: ${song.id} - ${song.title}`)

    try {
      console.log("Before API call - Current like status:", song.is_liked)
      const response = await songsApi.likeSong(song.id)
      console.log("Like API response:", response)

      // Update song in all lists
      const updateSongInList = (list: Song[]) => {
        return list.map((s) => {
          if (s.id === song.id) {
            const wasLiked = s.is_liked || false
            console.log(`Song ${s.id} was liked: ${wasLiked}, updating to: ${!wasLiked}`)
            return {
              ...s,
              is_liked: !wasLiked,
              is_disliked: false,
              like_count: wasLiked ? (s.like_count || 0) - 1 : (s.like_count || 0) + 1,
              dislike_count: s.is_disliked ? (s.dislike_count || 0) - 1 : s.dislike_count || 0,
            }
          }
          return s
        })
      }

      console.log("Updating song lists")
      setFamousSongs(updateSongInList(famousSongs))
      setUserSongs(updateSongInList(userSongs))
      setSearchResults(updateSongInList(searchResults))

      // Update current song if it's the one being liked
      if (currentSong && currentSong.id === song.id) {
        console.log("Updating current song after like")
        const wasLiked = currentSong.is_liked || false
        setCurrentSong({
          ...currentSong,
          is_liked: !wasLiked,
          is_disliked: false,
          like_count: wasLiked ? (currentSong.like_count || 0) - 1 : (currentSong.like_count || 0) + 1,
          dislike_count: currentSong.is_disliked
            ? (currentSong.dislike_count || 0) - 1
            : currentSong.dislike_count || 0,
        })
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

      // Update song in all lists
      const updateSongInList = (list: Song[]) => {
        return list.map((s) => {
          if (s.id === song.id) {
            const wasDisliked = s.is_disliked || false
            console.log(`Song ${s.id} was disliked: ${wasDisliked}, updating to: ${!wasDisliked}`)
            return {
              ...s,
              is_disliked: !wasDisliked,
              is_liked: false,
              dislike_count: wasDisliked ? (s.dislike_count || 0) - 1 : (s.dislike_count || 0) + 1,
              like_count: s.is_liked ? (s.like_count || 0) - 1 : s.like_count || 0,
            }
          }
          return s
        })
      }

      console.log("Updating song lists")
      setFamousSongs(updateSongInList(famousSongs))
      setUserSongs(updateSongInList(userSongs))
      setSearchResults(updateSongInList(searchResults))

      // Update current song if it's the one being disliked
      if (currentSong && currentSong.id === song.id) {
        console.log("Updating current song after dislike")
        const wasDisliked = currentSong.is_disliked || false
        setCurrentSong({
          ...currentSong,
          is_disliked: !wasDisliked,
          is_liked: false,
          dislike_count: wasDisliked ? (currentSong.dislike_count || 0) - 1 : (currentSong.dislike_count || 0) + 1,
          like_count: currentSong.is_liked ? (currentSong.like_count || 0) - 1 : currentSong.like_count || 0,
        })
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
            <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
              <Link href="/dashboard/songs/liked">
                <Heart className="h-4 w-4 mr-2" />
                Liked Songs
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

        <div className="mb-6">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search songs by title, artist, album or genre..."
            className="w-full max-w-2xl mx-auto"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList className="bg-zinc-800">
              <TabsTrigger value="famous">Famous Songs</TabsTrigger>
              <TabsTrigger value="my-songs">My Songs</TabsTrigger>
              {searchQuery && <TabsTrigger value="search">Search Results</TabsTrigger>}
            </TabsList>
            <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
              <Link href="/dashboard/songs/upload">
                <Plus className="h-4 w-4 mr-2" />
                Upload Song
              </Link>
            </Button>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 p-4 mb-6 rounded-md">
              <p>{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSongs}
                className="mt-2 bg-transparent border-red-500 text-red-200 hover:bg-red-500/20"
              >
                Try Again
              </Button>
            </div>
          )}

          <TabsContent value="famous" className="mt-0">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-emerald-500" />
                <p>Loading famous songs...</p>
              </div>
            ) : famousSongs.length === 0 ? (
              <div className="text-center py-12 text-zinc-400">No famous songs available yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {famousSongs.map((song) => (
                  <SongCard key={song.id} song={song} onPlay={playSong} onLike={handleLike} onDislike={handleDislike} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-songs" className="mt-0">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-emerald-500" />
                <p>Loading your songs...</p>
              </div>
            ) : userSongs.length === 0 ? (
              <div className="text-center py-12 text-zinc-400">
                You haven't uploaded any songs yet. Click "Upload Song" to get started.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {userSongs.map((song) => (
                  <SongCard key={song.id} song={song} onPlay={playSong} onLike={handleLike} onDislike={handleDislike} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="search" className="mt-0">
            {isSearching ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-emerald-500" />
                <p>Searching songs...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-12 text-zinc-400">No songs found matching "{searchQuery}".</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {searchResults.map((song) => (
                  <SongCard key={song.id} song={song} onPlay={playSong} onLike={handleLike} onDislike={handleDislike} />
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

interface SongCardProps {
  song: Song
  onPlay: (song: Song) => void
  onLike: (song: Song, event: React.MouseEvent) => void
  onDislike: (song: Song, event: React.MouseEvent) => void
}

function SongCard({ song, onPlay, onLike, onDislike }: SongCardProps) {
  // Ensure these properties exist with defaults
  const likeCount = song.like_count || 0
  const dislikeCount = song.dislike_count || 0
  const isLiked = song.is_liked || false
  const isDisliked = song.is_disliked || false

  return (
    <Card
      className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 transition-colors cursor-pointer"
      onClick={() => onPlay(song)}
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
            className={`px-2 ${isLiked ? "text-emerald-500" : "text-zinc-400 hover:text-white"}`}
            onClick={(e) => onLike(song, e)}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            <span>{likeCount}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`px-2 ${isDisliked ? "text-red-500" : "text-zinc-400 hover:text-white"}`}
            onClick={(e) => onDislike(song, e)}
          >
            <ThumbsDown className="h-4 w-4 mr-1" />
            <span>{dislikeCount}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
