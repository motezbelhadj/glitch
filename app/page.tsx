import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MusicIcon } from "lucide-react"
import { FeaturedSection } from "@/components/featured-section"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex items-center mb-6">
            <MusicIcon className="h-12 w-12 mr-2 text-emerald-500" />
            <h1 className="text-5xl font-bold">GLITCH</h1>
          </div>
          <p className="text-xl text-zinc-400 max-w-2xl mb-8">
            Your new favorite way to discover, stream, and share music. Create playlists, follow artists, and enjoy a
            seamless listening experience.
          </p>
          <div className="flex gap-4">
            <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-600">
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Featured Section */}
        <FeaturedSection />
      </div>
    </div>
  )
}
