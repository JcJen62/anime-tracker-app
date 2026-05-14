"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

interface EntryData {
  status: string
  rating: number | null
  episodesWatched: number
}

export async function upsertWatchlistEntry(animeId: number, data: EntryData) {
  const session = await auth()
  if (!session?.user?.id) redirect("/api/auth/signin")

  await prisma.watchlistEntry.upsert({
    where: { userId_animeId: { userId: session.user.id, animeId } },
    update: {
      status: data.status,
      rating: data.rating,
      episodesWatched: data.episodesWatched,
    },
    create: {
      userId: session.user.id,
      animeId,
      status: data.status,
      rating: data.rating,
      episodesWatched: data.episodesWatched,
    },
  })

  revalidatePath(`/anime/${animeId}`)
  return { success: true }
}

export async function removeWatchlistEntry(animeId: number) {
  const session = await auth()
  if (!session?.user?.id) redirect("/api/auth/signin")

  await prisma.watchlistEntry.deleteMany({
    where: { userId: session.user.id, animeId },
  })

  revalidatePath(`/anime/${animeId}`)
  return { success: true }
}
