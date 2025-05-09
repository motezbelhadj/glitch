"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MusicIcon, ArrowLeft, Upload, Loader2 } from "lucide-react"
import { songsApi } from "@/lib/api"
import Link from "next/link"

export default function UploadSongPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [artist, setArtist] = useState("")
  const [album, setAlbum] = useState("")
  const [genre, setGenre] = useState("")
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [audioPreview, setAudioPreview] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  if (!isAuthenticated) {
    router.push("/login")
    return null
  }

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAudioFile(file)

      // Create audio preview URL
      const audioUrl = URL.createObjectURL(file)
      setAudioPreview(audioUrl)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setCoverImage(file)

      // Create image preview URL
      const imageUrl = URL.createObjectURL(file)
      setImagePreview(imageUrl)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!audioFile) {
      setError("Please select an audio file to upload")
      setIsLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("artist", artist)

      if (album) formData.append("album", album)
      if (genre) formData.append("genre", genre)

      formData.append("audio_file", audioFile)
      if (coverImage) formData.append("cover_image", coverImage)

      await songsApi.uploadSong(formData)
      router.push("/dashboard/songs")
    } catch (err) {
      console.error("Upload error:", err)
      setError("Failed to upload song. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link href="/dashboard" className="flex items-center">
            <MusicIcon className="h-8 w-8 mr-2 text-emerald-500" />
            <h1 className="text-2xl font-bold">GLITCH</h1>
          </Link>
          <Button asChild variant="ghost" className="text-zinc-400 hover:text-white">
            <Link href="/dashboard/songs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Songs
            </Link>
          </Button>
        </div>

        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Upload a New Song</h2>

          {error && <div className="bg-red-500/20 border border-red-500/50 p-4 mb-6 rounded-md">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-800/50 p-6 rounded-lg border border-zinc-700">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-zinc-300">
                Song Title *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter song title"
                required
                className="bg-zinc-900 border-zinc-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist" className="text-zinc-300">
                Artist *
              </Label>
              <Input
                id="artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Enter artist name"
                required
                className="bg-zinc-900 border-zinc-700 text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="album" className="text-zinc-300">
                  Album
                </Label>
                <Input
                  id="album"
                  value={album}
                  onChange={(e) => setAlbum(e.target.value)}
                  placeholder="Enter album name (optional)"
                  className="bg-zinc-900 border-zinc-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre" className="text-zinc-300">
                  Genre
                </Label>
                <Input
                  id="genre"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="Enter genre (optional)"
                  className="bg-zinc-900 border-zinc-700 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audioFile" className="text-zinc-300">
                Audio File *
              </Label>
              <div className="flex flex-col space-y-2">
                <Input
                  id="audioFile"
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioChange}
                  required
                  className="bg-zinc-900 border-zinc-700 text-white"
                />
                {audioPreview && (
                  <audio controls className="w-full mt-2">
                    <source src={audioPreview} />
                    Your browser does not support the audio element.
                  </audio>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImage" className="text-zinc-300">
                Cover Image
              </Label>
              <div className="flex flex-col space-y-2">
                <Input
                  id="coverImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="bg-zinc-900 border-zinc-700 text-white"
                />
                {imagePreview && (
                  <div className="mt-2 w-32 h-32 relative">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Cover preview"
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Song
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
