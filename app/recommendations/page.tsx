import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { fetchAnimeByGenre } from "@/lib/jikan"
import AnimeCard from "@/components/AnimeCard"
import EmptyState from "@/components/EmptyState"

// Jikan v4 genre IDs for common anime genres
const GENRE_IDS: Record<string, number> = {
  "Action": 1,
  "Adventure": 2,
  "Comedy": 4,
  "Drama": 8,
  "Fantasy": 10,
  "Horror": 14,
  "Mystery": 7,
  "Romance": 22,
  "Sci-Fi": 24,
  "Slice of Life": 36,
  "Sports": 30,
  "Supernatural": 37,
  "Suspense": 41,
  "Mecha": 18,
  "Music": 19,
  "Historical": 13,
  "School": 23,
  "Psychological": 40,
  "Martial Arts": 17,
  "Military": 38,
  "Isekai": 62,
  "Mahou Shoujo": 16,
  "Space": 29,
  "Vampire": 32,
  "Harem": 35,
  "Shounen": 27,
  "Shoujo": 25,
  "Seinen": 42,
  "Josei": 43,
}

export default async function RecommendationsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/api/auth/signin")

  const [ratedEntries, allEntries] = await Promise.all([
    prisma.watchlistEntry.findMany({
      where: { userId: session.user.id, status: "completed", rating: { gte: 6 } },
      include: { anime: { select: { genres: true } } },
    }),
    prisma.watchlistEntry.findMany({
      where: { userId: session.user.id },
      select: { animeId: true },
    }),
  ])

  if (ratedEntries.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-2">For You</h1>
        <EmptyState
          title="Not enough data yet"
          description="Complete and rate at least one anime 6 or higher to get personalised recommendations."
          action={
            <Link
              href="/watchlist"
              className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              Go to Watchlist
            </Link>
          }
        />
      </main>
    )
  }

  // Build genre weights from highly-rated completed entries
  const genreWeights: Record<string, number> = {}
  for (const entry of ratedEntries) {
    const genres = Array.isArray(entry.anime.genres) ? (entry.anime.genres as string[]) : []
    const weight = entry.rating!
    for (const g of genres) {
      genreWeights[g] = (genreWeights[g] ?? 0) + weight
    }
  }

  // Pick top 3 genres that have a known Jikan ID
  const topGenres = Object.entries(genreWeights)
    .sort((a, b) => b[1] - a[1])
    .filter(([genre]) => genre in GENRE_IDS)
    .slice(0, 3)

  if (topGenres.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-2">For You</h1>
        <EmptyState
          title="Can't build recommendations yet"
          description="Your completed anime don't have enough genre data. Try rating more titles."
        />
      </main>
    )
  }

  // Fetch candidates from Jikan for each top genre (responses cached 24 h)
  const watchlistIds = new Set(allEntries.map((e) => e.animeId))
  const candidateArrays = await Promise.all(
    topGenres.map(([genre]) => fetchAnimeByGenre(GENRE_IDS[genre]))
  )

  // De-duplicate and filter out anything already in the user's watchlist
  const seen = new Set<number>()
  const candidates = candidateArrays.flat().filter((anime) => {
    if (seen.has(anime.id) || watchlistIds.has(anime.id)) return false
    seen.add(anime.id)
    return true
  })

  // Score each candidate: weighted genre overlap normalised to 0–100
  const totalWeight = Object.values(genreWeights).reduce((a, b) => a + b, 0)
  const scored = candidates
    .map((anime) => {
      const matchScore =
        anime.genres.reduce((sum, g) => sum + (genreWeights[g] ?? 0), 0) /
        totalWeight *
        100
      return { ...anime, matchScore: Math.round(matchScore) }
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 20)

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">For You</h1>
        <p className="text-sm text-zinc-500">
          Based on {ratedEntries.length} completed{" "}
          {ratedEntries.length === 1 ? "anime" : "anime"} · top genres:{" "}
          {topGenres.map(([g]) => g).join(", ")}
        </p>
      </div>

      {scored.length === 0 ? (
        <EmptyState
          title="No new recommendations"
          description="You've already seen everything in your top genres. Try completing more anime!"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {scored.map((anime) => (
            <AnimeCard
              key={anime.id}
              id={anime.id}
              title={anime.title}
              coverUrl={anime.coverUrl}
              score={anime.score}
              episodeCount={anime.episodeCount}
              genres={anime.genres}
            />
          ))}
        </div>
      )}
    </main>
  )
}
