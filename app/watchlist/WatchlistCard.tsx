"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import Modal from "@/components/Modal"
import RatingPicker from "@/components/RatingPicker"
import StatusBadge from "@/components/StatusBadge"
import { useToast } from "@/lib/toast"
import { useUpdateEntry, useRemoveEntry, type WatchlistEntry } from "./useWatchlist"

const STATUSES = [
  { value: "watching", label: "Watching" },
  { value: "completed", label: "Completed" },
  { value: "plan_to_watch", label: "Plan to Watch" },
  { value: "on_hold", label: "On Hold" },
  { value: "dropped", label: "Dropped" },
]

export default function WatchlistCard({ entry }: { entry: WatchlistEntry }) {
  const { addToast } = useToast()
  const updateEntry = useUpdateEntry()
  const removeEntry = useRemoveEntry()

  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(entry.status)
  const [rating, setRating] = useState<number | null>(entry.rating)
  const [episodes, setEpisodes] = useState(entry.episodesWatched)

  useEffect(() => {
    if (open) {
      setStatus(entry.status)
      setRating(entry.rating)
      setEpisodes(entry.episodesWatched)
    }
  }, [open, entry])

  const isPending = updateEntry.isPending || removeEntry.isPending

  function handleSave() {
    updateEntry.mutate(
      { animeId: entry.animeId, status, rating, episodesWatched: episodes },
      {
        onSuccess: () => {
          addToast("Watchlist updated", "success")
          setOpen(false)
        },
        onError: () => addToast("Failed to update entry", "error"),
      }
    )
  }

  function handleRemove() {
    removeEntry.mutate(entry.animeId, {
      onSuccess: () => {
        addToast("Removed from watchlist", "info")
        setOpen(false)
      },
      onError: () => addToast("Failed to remove entry", "error"),
    })
  }

  const { anime } = entry

  return (
    <>
      <div className="flex gap-4 rounded-xl bg-zinc-900 p-3 hover:bg-zinc-800/60 transition-colors">
        {/* Cover */}
        <Link href={`/anime/${anime.id}`} className="shrink-0">
          <div className="relative h-24 w-16 rounded-lg overflow-hidden bg-zinc-800">
            <Image
              src={anime.coverUrl}
              alt={anime.title}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
        </Link>

        {/* Info */}
        <div className="flex flex-1 flex-col justify-between min-w-0">
          <div>
            <Link
              href={`/anime/${anime.id}`}
              className="text-sm font-medium text-zinc-100 hover:text-white line-clamp-2 leading-snug"
            >
              {anime.title}
            </Link>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <StatusBadge status={entry.status} />
              {entry.rating != null && (
                <span className="text-xs font-semibold text-indigo-400">
                  {entry.rating}/10
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-zinc-500">
              {entry.episodesWatched}
              {anime.episodeCount != null ? ` / ${anime.episodeCount} eps` : " eps watched"}
            </span>
            <button
              onClick={() => setOpen(true)}
              className="text-xs text-zinc-500 hover:text-zinc-200 transition-colors"
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Edit entry">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
              Your Rating
            </label>
            <RatingPicker value={rating} onChange={setRating} disabled={isPending} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
              Episodes Watched
              {anime.episodeCount != null && (
                <span className="ml-1 normal-case text-zinc-500">
                  / {anime.episodeCount}
                </span>
              )}
            </label>
            <input
              type="number"
              min={0}
              max={anime.episodeCount ?? undefined}
              value={episodes}
              onChange={(e) => setEpisodes(Math.max(0, Number(e.target.value)))}
              disabled={isPending}
              className="w-24 rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleRemove}
              disabled={isPending}
              className="text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
            >
              Remove from watchlist
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
              >
                {isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
