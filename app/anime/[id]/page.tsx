import Image from "next/image"
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { getAnime } from "@/lib/jikan"
import GenreTag from "@/components/GenreTag"
import WatchlistPanel from "./WatchlistPanel"

export default async function AnimePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const animeId = Number(id)

  if (isNaN(animeId)) notFound()

  const [anime, session] = await Promise.all([
    getAnime(animeId).catch(() => null),
    auth(),
  ])

  if (!anime) notFound()

  let entry = null
  if (session?.user?.id) {
    entry = await prisma.watchlistEntry.findUnique({
      where: { userId_animeId: { userId: session.user.id, animeId } },
      select: { status: true, rating: true, episodesWatched: true },
    })
  }

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row gap-8">
        {/* Cover */}
        <div className="shrink-0 w-full sm:w-56">
          <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800">
            <Image
              src={anime.coverUrl}
              alt={anime.title}
              fill
              sizes="(max-width: 640px) 100vw, 224px"
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5 min-w-0">
          <div>
            <h1 className="text-3xl font-bold text-white leading-tight">
              {anime.title}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-zinc-400">
              {anime.score != null && (
                <span className="text-yellow-400 font-semibold">
                  ★ {anime.score.toFixed(1)}
                </span>
              )}
              {anime.episodeCount != null && (
                <span>{anime.episodeCount} episodes</span>
              )}
            </div>
          </div>

          {anime.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {anime.genres.map((g) => (
                <GenreTag key={g} genre={g} />
              ))}
            </div>
          )}

          <WatchlistPanel
            animeId={animeId}
            episodeCount={anime.episodeCount}
            entry={entry}
            isLoggedIn={!!session?.user?.id}
          />

          {anime.synopsis && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
                Synopsis
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
                {anime.synopsis}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
