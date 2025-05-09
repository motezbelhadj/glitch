"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react"

interface Song {
  id: string
  title: string
  artist: string
  audio_file: string
  cover_image?: string
}

interface AudioPlayerProps {
  song?: Song | null
  playlist?: Song[]
  onNext?: () => void
  onPrevious?: () => void
}

export function AudioPlayer({ song, playlist = [], onNext, onPrevious }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Reset player state when song changes
    if (audioRef.current) {
      setIsPlaying(false)
      setCurrentTime(0)
      audioRef.current.currentTime = 0

      // Auto-play when a new song is selected
      if (song) {
        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true)
            })
            .catch((error) => {
              console.log("Auto-play prevented:", error)
            })
        }
      }
    }
  }, [song])

  useEffect(() => {
    // Update audio volume when volume state changes
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (!audioRef.current) return
    setCurrentTime(audioRef.current.currentTime)
  }

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return
    setDuration(audioRef.current.duration)
  }

  const handleEnded = () => {
    setIsPlaying(false)
    if (onNext) onNext()
  }

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return
    const newTime = value[0]
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (isMuted && newVolume > 0) {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  // Determine if next/previous buttons should be enabled
  const hasMultipleSongs = playlist.length > 1
  const canNavigate = hasMultipleSongs && onNext !== undefined && onPrevious !== undefined

  if (!song) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-4 text-center text-zinc-500">
        No song selected
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-4">
      <audio
        ref={audioRef}
        src={song.audio_file}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4 w-full md:w-1/4">
          <div className="w-12 h-12 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
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
          <div className="truncate">
            <div className="font-medium text-white truncate">{song.title}</div>
            <div className="text-sm text-zinc-400 truncate">{song.artist}</div>
          </div>
        </div>

        <div className="flex flex-col items-center w-full md:w-2/4">
          <div className="flex items-center space-x-4 mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrevious}
              disabled={!canNavigate}
              className={`text-zinc-400 hover:text-white ${!canNavigate ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <SkipBack size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="text-white bg-zinc-800 hover:bg-zinc-700 rounded-full h-10 w-10"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onNext}
              disabled={!canNavigate}
              className={`text-zinc-400 hover:text-white ${!canNavigate ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <SkipForward size={20} />
            </Button>
          </div>

          <div className="flex items-center w-full space-x-2">
            <span className="text-xs text-zinc-400 w-10 text-right">{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="w-full"
            />
            <span className="text-xs text-zinc-400 w-10">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-1/4 justify-end">
          <Button variant="ghost" size="icon" onClick={toggleMute} className="text-zinc-400 hover:text-white">
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </Button>
          <Slider value={[volume]} min={0} max={1} step={0.01} onValueChange={handleVolumeChange} className="w-24" />
        </div>
      </div>
    </div>
  )
}
