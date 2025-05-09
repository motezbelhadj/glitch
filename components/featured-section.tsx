import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

// Mock data for featured songs
const featuredSongs = [
  {
    id: 1,
    title: "Neon Dreams",
    artist: "Synthwave Collective",
    cover: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 2,
    title: "Digital Horizon",
    artist: "Pixel Beats",
    cover: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 3,
    title: "Midnight Protocol",
    artist: "Cyber Echoes",
    cover: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 4,
    title: "Quantum Pulse",
    artist: "Binary Waves",
    cover: "/placeholder.svg?height=300&width=300",
  },
]

export function FeaturedSection() {
  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold mb-6">Featured Tracks</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {featuredSongs.map((song) => (
          <Card key={song.id} className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 transition-colors">
            <CardContent className="p-4">
              <div className="aspect-square relative mb-3 overflow-hidden rounded-md">
                <Image
                  src={song.cover || "/placeholder.svg"}
                  alt={song.title}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                />
              </div>
              <h3 className="font-semibold text-white truncate">{song.title}</h3>
              <p className="text-zinc-400 text-sm truncate">{song.artist}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
