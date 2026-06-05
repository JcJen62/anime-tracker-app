"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import EmptyState from "@/components/EmptyState"
import LoadingSpinner from "@/components/LoadingSpinner"
import StatusTabs from "./StatusTabs"
import WatchlistCard from "./WatchlistCard"
import ImportPanel from "./ImportPanel"
import { useWatchlistQuery } from "./useWatchlist"

export default function WatchlistClient() {
  const searchParams = useSearchParams()
  const status = searchParams.get("status") ?? ""

  const { data: entries, isLoading, isError } = useWatchlistQuery(status)

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">My Watchlist</h1>

      <ImportPanel />

      <div className="mb-6">
        <StatusTabs />
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      )}

      {!isLoading && isError && (
        <p className="text-sm text-red-400 text-center py-16">
          Failed to load watchlist. Please refresh.
        </p>
      )}

      {!isLoading && !isError && entries?.length === 0 && (
        <EmptyState
          title="Nothing here yet"
          description={
            status
              ? "No anime with this status. Try a different filter."
              : "Search for anime and add them to your watchlist."
          }
          action={
            !status ? (
              <Link
                href="/search"
                className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                Browse Anime
              </Link>
            ) : undefined
          }
        />
      )}

      {entries && entries.length > 0 && (
        <div className="flex flex-col gap-2">
          {entries.map((entry) => (
            <WatchlistCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </main>
  )
}
