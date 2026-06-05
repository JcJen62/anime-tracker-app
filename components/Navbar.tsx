import Link from "next/link"
import Image from "next/image"
import { auth, signIn, signOut } from "@/auth"

export default async function Navbar() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold tracking-wide text-white">
            <Image
              src="/images/logo.png"
              alt="AniTrack logo"
              width={28}
              height={28}
              className="rounded-md"
              priority
            />
            AniTrack
          </Link>
          <div className="hidden sm:flex items-center gap-4">
            <Link href="/search" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Search
            </Link>
            {session && (
              <>
                <Link href="/watchlist" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Watchlist
                </Link>
                <Link href="/recommendations" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  For You
                </Link>
                <Link href="/profile" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Profile
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? "avatar"}
                  width={28}
                  height={28}
                  className="rounded-full ring-1 ring-zinc-700"
                />
              )}
              <form
                action={async () => {
                  "use server"
                  await signOut({ redirectTo: "/" })
                }}
              >
                <button
                  type="submit"
                  className="text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <form
              action={async () => {
                "use server"
                await signIn()
              }}
            >
              <button
                type="submit"
                className="rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                Sign in
              </button>
            </form>
          )}
        </div>
      </nav>
    </header>
  )
}
