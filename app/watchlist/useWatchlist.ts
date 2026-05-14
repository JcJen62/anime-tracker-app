"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export interface WatchlistEntry {
  id: string
  animeId: number
  status: string
  rating: number | null
  episodesWatched: number
  updatedAt: string
  anime: {
    id: number
    title: string
    coverUrl: string
    score: number | null
    episodeCount: number | null
    genres: string[]
  }
}

interface UpdatePayload {
  animeId: number
  status: string
  rating: number | null
  episodesWatched: number
}

async function fetchWatchlist(status: string): Promise<WatchlistEntry[]> {
  const url = status
    ? `/api/v1/watchlist?status=${encodeURIComponent(status)}`
    : "/api/v1/watchlist"
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch watchlist")
  return res.json()
}

export function useWatchlistQuery(status: string) {
  return useQuery({
    queryKey: ["watchlist", status],
    queryFn: () => fetchWatchlist(status),
  })
}

export function useUpdateEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdatePayload) =>
      fetch("/api/v1/watchlist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then((r) => {
        if (!r.ok) throw new Error("Update failed")
        return r.json()
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
  })
}

export function useRemoveEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (animeId: number) =>
      fetch(`/api/v1/watchlist?animeId=${animeId}`, { method: "DELETE" }).then(
        (r) => {
          if (!r.ok) throw new Error("Delete failed")
          return r.json()
        }
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
  })
}
