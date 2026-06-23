import Link from "next/link"
import { searchAnime, fetchAnimeByGenre, fetchTopAnime } from "@/lib/jikan"
import { GENRE_IDS, POPULAR_GENRES } from "@/lib/genres"
import AnimeCard from "@/components/AnimeCard"
import EmptyState from "@/components/EmptyState"
import PopularStrip from "@/components/PopularStrip"
import SearchInput from "./SearchInput"

const GRID_CLASS =
  "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-5 sm:gap-6"

type AnimeResult = Awaited<ReturnType<typeof searchAnime>>[number]

function GenreChips() {
  return (
    <div className="flex flex-wrap gap-2">
      {POPULAR_GENRES.map((genre) => (
        <Link
          key={genre}
          href={`/search?genre=${encodeURIComponent(genre)}`}
          className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-1.5 text-sm text-zinc-300 hover:border-indigo-500 hover:text-white transition-colors"
        >
          {genre}
        </Link>
      ))}
    </div>
  )
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const query = typeof params.q === "string" ? params.q.trim() : ""
  const genreParam = typeof params.genre === "string" ? params.genre : ""
  const genre = genreParam in GENRE_IDS ? genreParam : ""

  let results: AnimeResult[] = []
  let error: string | null = null

  try {
    if (query) {
      results = await searchAnime(query)
    } else if (genre) {
      results = await fetchAnimeByGenre(GENRE_IDS[genre])
    }
  } catch {
    error = "Failed to fetch results. The anime API may be temporarily unavailable — please try again."
  }

  const isBrowsing = !query && !genre

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Search Anime</h1>

      <SearchInput defaultValue={query} />

      {error && <p className="text-sm text-red-400 mt-6">{error}</p>}

      {/* Search results */}
      {!error && (query || genre) && results.length > 0 && (
        <>
          <p className="text-sm text-zinc-500 mt-6 mb-4">
            {genre
              ? `Top ${genre} anime`
              : `${results.length} results for "${query}"`}
          </p>
          <div className={GRID_CLASS}>
            {results.map((anime) => (
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
        </>
      )}

      {/* No results for a query/genre */}
      {!error && (query || genre) && results.length === 0 && (
        <EmptyState
          title="No results found"
          description={
            genre
              ? `Couldn't load ${genre} anime right now. Try again shortly.`
              : `Nothing matched "${query}". Try a different search term.`
          }
        />
      )}

      {/* Discovery view — no query yet */}
      {!error && isBrowsing && (
        <div className="mt-8 space-y-10">
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 mb-3">
              Browse by genre
            </h2>
            <GenreChips />
          </section>

          <PopularSection />
        </div>
      )}
    </main>
  )
}

async function PopularSection() {
  const popular = await fetchTopAnime(10)
  if (popular.length === 0) return null

  return (
    <section>
      <h2 className="text-xl font-bold text-white mb-4">Popular right now</h2>
      <PopularStrip anime={popular} />
    </section>
  )
}
