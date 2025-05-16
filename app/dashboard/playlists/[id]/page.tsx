"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MusicIcon, LogOut, Plus, ArrowLeft, Trash2, ImageIcon, Pencil, ThumbsUp, ThumbsDown } from "lucide-react"
import { playlistApi, songsApi } from "@/lib/api"
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
  like_count: number
  dislike_count: number
  is_liked: boolean
  is_disliked: boolean
}

interface Playlist {
  id: string
  name: string
  description?: string
  cover_image?: string
  is_public: boolean
  songs: Song[]
}

export default function PlaylistDetailPage() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const params = useParams()
  const playlistId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [availableSongs, setAvailableSongs] = useState<Song[]>([])
  const [searchResults, setSearchResults] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState("")
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    } else {
      fetchPlaylist()
      fetchAvailableSongs()
    }
  }, [isAuthenticated, router, playlistId])

  // Update current song index when current song changes
  useEffect(() => {
    if (currentSong && playlist) {
      const index = playlist.songs.findIndex((song) => song.id === currentSong.id)
      setCurrentSongIndex(index)
    }
  }, [currentSong, playlist])

  const fetchPlaylist = async () => {
    setIsLoading(true)
    setError("")
    try {
      const data = await playlistApi.getPlaylistById(playlistId)
      setPlaylist(data)
      if (data.cover_image) {
        setCoverImagePreview(data.cover_image)
      }
    } catch (err) {
      console.error("Error fetching playlist:", err)
      setError("Failed to load playlist. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAvailableSongs = async () => {
    try {
      // Fetch all songs that could be added to the playlist
      const songs = await songsApi.getAllSongs()
      setAvailableSongs(songs)
    } catch (err) {
      console.error("Error fetching available songs:", err)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)

    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)

    try {
      const results = await songsApi.searchSongs(query)
      // Filter out songs that are already in the playlist
      const filteredResults = playlist
        ? results.filter((song: Song) => !playlist.songs.some((playlistSong) => playlistSong.id === song.id))
        : results
      setSearchResults(filteredResults)
    } catch (err) {
      console.error("Error searching songs:", err)
    } finally {
      setIsSearching(false)
    }
  }

  const addSongToPlaylist = async (songId: string) => {
    try {
      await playlistApi.addSongToPlaylist(playlistId, songId)
      fetchPlaylist() // Refresh playlist data

      // Update search results to remove the added song
      setSearchResults((prev) => prev.filter((song) => song.id !== songId))
    } catch (err) {
      console.error("Error adding song to playlist:", err)
      setError("Failed to add song to playlist. Please try again.")
    }
  }

  const removeSongFromPlaylist = async (songId: string) => {
    try {
      await playlistApi.removeSongFromPlaylist(playlistId, songId)
      fetchPlaylist() // Refresh playlist data
    } catch (err) {
      console.error("Error removing song from playlist:", err)
      setError("Failed to remove song from playlist. Please try again.")
    }
  }

  const playSong = (song: Song) => {
    setCurrentSong(song)
  }

  const handleNextSong = () => {
    if (!playlist || playlist.songs.length === 0 || currentSongIndex === -1) return

    const nextIndex = (currentSongIndex + 1) % playlist.songs.length
    setCurrentSong(playlist.songs[nextIndex])
  }

  const handlePreviousSong = () => {
    if (!playlist || playlist.songs.length === 0 || currentSongIndex === -1) return

    const prevIndex = (currentSongIndex - 1 + playlist.songs.length) % playlist.songs.length
    setCurrentSong(playlist.songs[prevIndex])
  }

  const handleCoverImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return

    const file = e.target.files[0]

    // Create a preview
    const imageUrl = URL.createObjectURL(file)
    setCoverImagePreview(imageUrl)

    // Upload the image
    await uploadCoverImage(file)
  }

  const uploadCoverImage = async (file: File) => {
    if (!playlist) return

    setIsUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("cover_image", file)

      await playlistApi.updatePlaylistCover(playlistId, formData)
      fetchPlaylist() // Refresh playlist data
    } catch (err) {
      console.error("Error uploading cover image:", err)
      setError("Failed to upload cover image. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  // Update the handleLike function with better debugging and error handling
  const handleLike = async (song: Song, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent card click (which would play the song)
    console.log(`Liking song: ${song.id} - ${song.title}`)

    try {
      console.log("Before API call - Current like status:", song.is_liked)
      const response = await songsApi.likeSong(song.id)
      console.log("Like API response:", response)

      // Update song in playlist
      if (playlist) {
        console.log("Updating playlist songs after like")
        const updatedSongs = playlist.songs.map((s) => {
          if (s.id === song.id) {
            const wasLiked = s.is_liked
            console.log(`Song ${s.id} was liked: ${wasLiked}, updating to: ${!wasLiked}`)
            return {
              ...s,
              is_liked: !wasLiked,
              is_disliked: false,
              like_count: wasLiked ? s.like_count - 1 : s.like_count + 1,
              dislike_count: s.is_disliked ? s.dislike_count - 1 : s.dislike_count,
            }
          }
          return s
        })

        console.log("Setting updated playlist")
        setPlaylist({
          ...playlist,
          songs: updatedSongs,
        })
      }

      // Update current song if it's the one being liked
      if (currentSong && currentSong.id === song.id) {
        console.log("Updating current song after like")
        const wasLiked = currentSong.is_liked
        setCurrentSong({
          ...currentSong,
          is_liked: !wasLiked,
          is_disliked: false,
          like_count: wasLiked ? currentSong.like_count - 1 : currentSong.like_count + 1,
          dislike_count: currentSong.is_disliked ? currentSong.dislike_count - 1 : currentSong.dislike_count,
        })
      }

      // Force a re-render
      console.log("Forcing re-render")
      setIsLoading(false)
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

      // Update song in playlist
      if (playlist) {
        console.log("Updating playlist songs after dislike")
        const updatedSongs = playlist.songs.map((s) => {
          if (s.id === song.id) {
            const wasDisliked = s.is_disliked
            console.log(`Song ${s.id} was disliked: ${wasDisliked}, updating to: ${!wasDisliked}`)
            return {
              ...s,
              is_disliked: !wasDisliked,
              is_liked: false,
              dislike_count: wasDisliked ? s.dislike_count - 1 : s.dislike_count + 1,
              like_count: s.is_liked ? s.like_count - 1 : s.like_count,
            }
          }
          return s
        })

        console.log("Setting updated playlist")
        setPlaylist({
          ...playlist,
          songs: updatedSongs,
        })
      }

      // Update current song if it's the one being disliked
      if (currentSong && currentSong.id === song.id) {
        console.log("Updating current song after dislike")
        const wasDisliked = currentSong.is_disliked
        setCurrentSong({
          ...currentSong,
          is_disliked: !wasDisliked,
          is_liked: false,
          dislike_count: wasDisliked ? currentSong.dislike_count - 1 : currentSong.dislike_count + 1,
          like_count: currentSong.is_liked ? currentSong.like_count - 1 : currentSong.like_count,
        })
      }

      // Force a re-render
      console.log("Forcing re-render")
      setIsLoading(false)
    } catch (err) {
      console.error("Error disliking song:", err)
      setError(`Failed to dislike song: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  if (!user) {
    return null
  }

  // Filter out songs that are already in the playlist
  const songsNotInPlaylist = playlist
    ? availableSongs.filter((song) => !playlist.songs.some((playlistSong) => playlistSong.id === song.id))
    : []

  // Use search results if there's a search query, otherwise use filtered available songs
  const songsToDisplay = searchQuery ? searchResults : songsNotInPlaylist

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
              <Link href="/dashboard/playlists">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Playlists
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

        {error && <div className="bg-red-500/20 border border-red-500/50 p-4 mb-6 rounded-md">{error}</div>}

        {isLoading ? (
          <div className="text-center py-12">Loading playlist...</div>
        ) : !playlist ? (
          <div className="text-center py-12 text-zinc-400">Playlist not found.</div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="w-full md:w-1/3 lg:w-1/4">
                <div
                  className="aspect-square relative overflow-hidden rounded-md bg-zinc-800 group cursor-pointer"
                  onClick={handleCoverImageClick}
                >
                  {coverImagePreview ? (
                    <>
                      <Image
                        src={coverImagePreview || "/placeholder.svg"}
                        alt={playlist.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Pencil className="h-12 w-12 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-emerald-900 flex flex-col items-center justify-center text-white">
                      <ImageIcon className="h-12 w-12 mb-2" />
                      <span className="text-sm">Add Cover Image</span>
                    </div>
                  )}

                  {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                      <div className="text-white text-center">
                        <svg
                          className="animate-spin h-8 w-8 mx-auto mb-2"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Uploading...</span>
                      </div>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <p className="text-xs text-center mt-2 text-zinc-400">Click to change cover image</p>
              </div>

              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">{playlist.name}</h2>
                {playlist.description && <p className="text-zinc-400 mb-4">{playlist.description}</p>}
                <div className="flex items-center justify-between mb-6">
                  <p className="text-zinc-400">{playlist.songs.length} songs</p>

                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-emerald-500 hover:bg-emerald-600">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Songs
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-800 border-zinc-700 text-white max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Add Songs to Playlist</DialogTitle>
                      </DialogHeader>

                      <div className="mt-4 mb-4">
                        <SearchBar onSearch={handleSearch} placeholder="Search for songs to add..." />
                      </div>

                      <div className="max-h-[60vh] overflow-y-auto">
                        {isSearching ? (
                          <div className="text-center py-4">
                            <svg
                              className="animate-spin h-6 w-6 mx-auto mb-2"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            <p>Searching songs...</p>
                          </div>
                        ) : songsToDisplay.length === 0 ? (
                          <div className="text-center py-4 text-zinc-400">
                            {searchQuery
                              ? `No songs found matching "${searchQuery}" that aren't already in this playlist.`
                              : "No more songs available to add."}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {songsToDisplay.map((song) => (
                              <Card key={song.id} className="bg-zinc-700/50 border-zinc-600 flex">
                                <CardContent className="p-3 flex items-center justify-between w-full">
                                  <div className="flex items-center">
                                    <div className="w-10 h-10 bg-zinc-600 rounded overflow-hidden flex-shrink-0 mr-3">
                                      {song.cover_image ? (
                                        <img
                                          src={song.cover_image || "/placeholder.svg"}
                                          alt={song.title}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-emerald-900 flex items-center justify-center text-white text-sm">
                                          {song.title[0]}
                                        </div>
                                      )}
                                    </div>
                                    <div className="truncate">
                                      <div className="font-medium text-white truncate">{song.title}</div>
                                      <div className="text-xs text-zinc-400 truncate">{song.artist}</div>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    className="bg-emerald-500 hover:bg-emerald-600"
                                    onClick={() => addSongToPlaylist(song.id)}
                                  >
                                    Add
                                  </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            {playlist.songs.length === 0 ? (
              <div className="text-center py-12 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <p className="text-zinc-400 mb-4">This playlist is empty.</p>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-emerald-500 hover:bg-emerald-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Song
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {playlist.songs.map((song) => (
                  <Card key={song.id} className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center flex-1 cursor-pointer" onClick={() => playSong(song)}>
                        <div className="w-12 h-12 bg-zinc-800 rounded overflow-hidden flex-shrink-0 mr-4">
                          {song.cover_image ? (
                            <img
                              src={song.cover_image || "/placeholder.svg"}
                              alt={song.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-emerald-900 flex items-center justify-center text-white text-xl">
                              {song.title[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white">{song.title}</div>
                          <div className="text-sm text-zinc-400">{song.artist}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`px-2 ${song.is_liked ? "text-emerald-500" : "text-zinc-400 hover:text-white"}`}
                          onClick={(e) => handleLike(song, e)}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          <span>{song.like_count}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className={`px-2 ${song.is_disliked ? "text-red-500" : "text-zinc-400 hover:text-white"}`}
                          onClick={(e) => handleDislike(song, e)}
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          <span>{song.dislike_count}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-zinc-400 hover:text-red-500"
                          onClick={() => removeSongFromPlaylist(song.id)}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <AudioPlayer
        song={currentSong}
        playlist={playlist?.songs || []}
        onNext={handleNextSong}
        onPrevious={handlePreviousSong}
      />
    </div>
  )
}
