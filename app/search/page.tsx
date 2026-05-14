import { searchAnime } from "@/lib/jikan"
import AnimeCard from "@/components/AnimeCard"
import EmptyState from "@/components/EmptyState"
import SearchInput from "./SearchInput"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { q } = await searchParams
  const query = typeof q === "string" ? q.trim() : ""

  type AnimeResult = Awaited<ReturnType<typeof searchAnime>>[number]
  let results: AnimeResult[] = []
  let error: string | null = null

  if (query) {
    try {
      results = await searchAnime(query)
    } catch {
      error = "Failed to fetch results. The anime API may be temporarily unavailable — please try again."
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Search Anime</h1>

      <SearchInput defaultValue={query} />

      {error && (
        <p className="text-sm text-red-400 mb-4">{error}</p>
      )}

      {!query && !error && (
        <EmptyState
          title="Find your next watch"
          description="Type a title, genre, or keyword above to search."
        />
      )}

      {query && !error && results.length === 0 && (
        <EmptyState
          title="No results found"
          description={`Nothing matched "${query}". Try a different search term.`}
        />
      )}

      {results.length > 0 && (
        <>
          <p className="text-sm text-zinc-500 mb-4">
            {results.length} results for &quot;{query}&quot;
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
    </main>
  )
}
