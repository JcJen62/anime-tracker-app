"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { searchAnimeFirst } from "@/lib/jikan"

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

  const limited = titles.slice(0, 50)

  for (const rawTitle of limited) {
    const title = rawTitle.trim()
    if (!title) continue

    try {
      await sleep(350)

      const anime = await searchAnimeFirst(title)

      if (!anime) {
        result.failed.push(title)
        continue
      }

      const existing = await prisma.watchlistEntry.findUnique({
        where: { userId_animeId: { userId: session.user.id, animeId: anime.id } },
      })

      if (existing) {
        result.skipped.push(title)
        continue
      }

      await prisma.watchlistEntry.create({
        data: {
          userId: session.user.id,
          animeId: anime.id,
          status: "completed",
          episodesWatched: anime.episodeCount ?? 0,
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
