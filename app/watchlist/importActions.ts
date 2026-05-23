"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

const JIKAN_BASE = "https://api.jikan.moe/v4"

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export type ImportResult = {
  added: string[]
  skipped: string[]
  failed: string[]
}

export async function importAnimeList(titles: string[]): Promise<ImportResult> {
  const session = await auth()
  if (!session?.user?.id) redirect("/api/auth/signin")

  const result: ImportResult = { added: [], skipped: [], failed: [] }

  for (const rawTitle of titles) {
    const title = rawTitle.trim()
    if (!title) continue

    try {
      await sleep(350)

      const res = await fetch(
        `${JIKAN_BASE}/anime?q=${encodeURIComponent(title)}&limit=1&sfw=true`
      )

      if (!res.ok) {
        result.failed.push(title)
        continue
      }

      const { data } = await res.json()

      if (!data?.length) {
        result.failed.push(title)
        continue
      }

      const a = data[0]
      const animeData = {
        id: a.mal_id as number,
        title: a.title as string,
        coverUrl: (a.images.jpg.large_image_url || a.images.jpg.image_url) as string,
        synopsis: (a.synopsis ?? null) as string | null,
        episodeCount: (a.episodes ?? null) as number | null,
        score: (a.score ?? null) as number | null,
        genres: (a.genres as Array<{ name: string }>).map((g) => g.name),
      }

      const existing = await prisma.watchlistEntry.findUnique({
        where: { userId_animeId: { userId: session.user.id, animeId: animeData.id } },
      })

      if (existing) {
        result.skipped.push(title)
        continue
      }

      await prisma.anime.upsert({
        where: { id: animeData.id },
        update: { ...animeData, cachedAt: new Date() },
        create: animeData,
      })

      await prisma.watchlistEntry.create({
        data: {
          userId: session.user.id,
          animeId: animeData.id,
          status: "completed",
          episodesWatched: animeData.episodeCount ?? 0,
        },
      })

      result.added.push(title)
    } catch {
      result.failed.push(title)
    }
  }

  revalidatePath("/watchlist")
  return result
}
