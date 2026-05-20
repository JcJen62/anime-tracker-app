import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import StatusBadge from "@/components/StatusBadge"
import EmptyState from "@/components/EmptyState"

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/api/auth/signin")

  const entries = await prisma.watchlistEntry.findMany({
    where: { userId: session.user.id },
    include: {
      anime: { select: { id: true, title: true, coverUrl: true, genres: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  // Status counts
  const statusCounts = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.status] = (acc[e.status] ?? 0) + 1
    return acc
  }, {})

  // Mean rating
  const ratings = entries.flatMap((e) => (e.rating != null ? [e.rating] : []))
  const meanRating =
    ratings.length > 0
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : null

  const totalEpisodes = entries.reduce((sum, e) => sum + e.episodesWatched, 0)

  // Genre breakdown — weight each genre by rating (fallback 5 if unrated)
  const genreScores: Record<string, number> = {}
  for (const entry of entries) {
    const genres = entry.anime.genres as string[]
    const weight = entry.rating ?? 5
    for (const g of genres) {
      genreScores[g] = (genreScores[g] ?? 0) + weight
    }
  }
  const topGenres = Object.entries(genreScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
  const maxGenreScore = topGenres[0]?.[1] ?? 1

  const stats = [
    { label: "Total", value: entries.length },
    { label: "Watching", value: statusCounts.watching ?? 0 },
    { label: "Completed", value: statusCounts.completed ?? 0 },
    { label: "Plan to Watch", value: statusCounts.plan_to_watch ?? 0 },
    { label: "Mean Rating", value: meanRating ?? "—" },
    { label: "Episodes", value: totalEpisodes },
  ]

  const recentActivity = entries.slice(0, 10)

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      {/* User header */}
      <div className="flex items-center gap-4 mb-10">
        {session.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt="avatar"
            className="h-16 w-16 rounded-full ring-2 ring-zinc-700"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-zinc-800 flex items-center justify-center text-2xl font-bold text-zinc-400">
            {session.user.name?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-white">
            {session.user.name ?? "Anonymous"}
          </h1>
          {session.user.email && (
            <p className="text-sm text-zinc-500">{session.user.email}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
        {stats.map(({ label, value }) => (
          <div key={label} className="rounded-xl bg-zinc-900 p-4 text-center">
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-zinc-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {entries.length === 0 ? (
        <EmptyState
          title="Nothing tracked yet"
          description="Add anime to your watchlist and your stats will appear here."
          action={
            <Link
              href="/search"
              className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              Browse Anime
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Genre breakdown */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">
              Top Genres
            </h2>
            {topGenres.length === 0 ? (
              <p className="text-sm text-zinc-600">No genre data yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {topGenres.map(([genre, score]) => (
                  <div key={genre}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-300">{genre}</span>
                      <span className="text-zinc-600">{score}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-800">
                      <div
                        className="h-1.5 rounded-full bg-indigo-500 transition-all"
                        style={{ width: `${(score / maxGenreScore) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent activity */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">
              Recent Activity
            </h2>
            <div className="flex flex-col gap-1">
              {recentActivity.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/anime/${entry.animeId}`}
                  className="flex items-center gap-3 rounded-lg p-2 -mx-2 hover:bg-zinc-800/60 transition-colors"
                >
                  <div className="relative h-12 w-8 shrink-0 rounded overflow-hidden bg-zinc-800">
                    <Image
                      src={entry.anime.coverUrl}
                      alt={entry.anime.title}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-200 truncate leading-snug">
                      {entry.anime.title}
                    </p>
                    <div className="mt-0.5">
                      <StatusBadge status={entry.status} />
                    </div>
                  </div>
                  <span className="text-xs text-zinc-600 shrink-0">
                    {timeAgo(new Date(entry.updatedAt))}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
