"use client"

import { useEffect, useState, useTransition } from "react"
import Modal from "@/components/Modal"
import RatingPicker from "@/components/RatingPicker"
import StatusBadge from "@/components/StatusBadge"
import { useToast } from "@/lib/toast"
import { upsertWatchlistEntry, removeWatchlistEntry } from "./actions"

const STATUSES = [
  { value: "watching", label: "Watching" },
  { value: "completed", label: "Completed" },
  { value: "plan_to_watch", label: "Plan to Watch" },
  { value: "on_hold", label: "On Hold" },
  { value: "dropped", label: "Dropped" },
]

interface Entry {
  status: string
  rating: number | null
  episodesWatched: number
}

interface WatchlistPanelProps {
  animeId: number
  episodeCount: number | null
  entry: Entry | null
  isLoggedIn: boolean
}

export default function WatchlistPanel({
  animeId,
  episodeCount,
  entry,
  isLoggedIn,
}: WatchlistPanelProps) {
  const { addToast } = useToast()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Form state — synced from entry whenever modal opens
  const [status, setStatus] = useState(entry?.status ?? "plan_to_watch")
  const [rating, setRating] = useState<number | null>(entry?.rating ?? null)
  const [episodes, setEpisodes] = useState(entry?.episodesWatched ?? 0)

  useEffect(() => {
    if (open) {
      setStatus(entry?.status ?? "plan_to_watch")
      setRating(entry?.rating ?? null)
      setEpisodes(entry?.episodesWatched ?? 0)
    }
  }, [open, entry])

  function handleSave() {
    startTransition(async () => {
      const result = await upsertWatchlistEntry(animeId, {
        status,
        rating,
        episodesWatched: episodes,
      })
      if (result?.success) {
        addToast("Watchlist updated", "success")
        setOpen(false)
      }
    })
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await removeWatchlistEntry(animeId)
      if (result?.success) {
        addToast("Removed from watchlist", "info")
        setOpen(false)
      }
    })
  }

  if (!isLoggedIn) {
    return (
      <a
        href="/api/auth/signin"
        className="inline-flex items-center rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
      >
        Sign in to track this anime
      </a>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={[
          "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
          entry
            ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700"
            : "bg-indigo-600 hover:bg-indigo-500 text-white",
        ].join(" ")}
      >
        {entry ? (
          <>
            <StatusBadge status={entry.status} />
            <span className="text-zinc-400 font-normal">· Edit</span>
          </>
        ) : (
          "+ Add to Watchlist"
        )}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={entry ? "Edit watchlist entry" : "Add to watchlist"}
      >
        <div className="flex flex-col gap-5">
          {/* Status */}
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

          {/* Rating */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
              Your Rating
            </label>
            <RatingPicker value={rating} onChange={setRating} disabled={isPending} />
          </div>

          {/* Episodes watched */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
              Episodes Watched
              {episodeCount != null && (
                <span className="ml-1 normal-case text-zinc-500">
                  / {episodeCount}
                </span>
              )}
            </label>
            <input
              type="number"
              min={0}
              max={episodeCount ?? undefined}
              value={episodes}
              onChange={(e) => setEpisodes(Math.max(0, Number(e.target.value)))}
              disabled={isPending}
              className="w-24 rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            {entry ? (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isPending}
                className="text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
              >
                Remove from watchlist
              </button>
            ) : (
              <span />
            )}
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
