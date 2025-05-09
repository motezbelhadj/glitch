import { LoginForm } from "@/components/login-form"
import { MusicIcon } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-black p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center mb-6">
            <MusicIcon className="h-8 w-8 mr-2 text-emerald-500" />
            <h1 className="text-3xl font-bold text-white">GLITCH</h1>
          </Link>
          <h2 className="text-2xl font-semibold text-white mb-2">Welcome back</h2>
          <p className="text-zinc-400 text-center">Log in to continue your music journey</p>
        </div>

        <LoginForm />

        <div className="text-center mt-6">
          <p className="text-zinc-400">
            Don't have an account?{" "}
            <Link href="/signup" className="text-emerald-500 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
