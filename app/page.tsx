import Link from "next/link"
import Image from "next/image"
import { auth } from "@/auth"

export default async function Home() {
  const session = await auth()

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <Image
        src="/images/hero.webp"
        alt="Anime Tracker"
        width={1600}
        height={679}
        priority
        className="mb-10 w-full max-w-4xl rounded-2xl shadow-lg shadow-black/40"
      />
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">
        Anime Tracker
      </h1>
      <p className="text-zinc-400 text-lg sm:text-xl mb-8 max-w-xl">
        Search for anime, track what you&apos;re watching, and get
        recommendations tailored to your taste.
      </p>
      <div className="flex gap-4">
        <Link
          href="/search"
          className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          Browse Anime
        </Link>
        {session ? (
          <Link
            href="/watchlist"
            className="rounded-full border border-zinc-700 px-6 py-2.5 text-sm font-semibold text-zinc-300 hover:border-zinc-500 transition-colors"
          >
            My Watchlist
          </Link>
        ) : (
          <Link
            href="/api/auth/signin"
            className="rounded-full border border-zinc-700 px-6 py-2.5 text-sm font-semibold text-zinc-300 hover:border-zinc-500 transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </main>
  )
}
