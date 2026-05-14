import { NextRequest } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id)
    return Response.json({ error: "Unauthorized" }, { status: 401 })

  const status = request.nextUrl.searchParams.get("status") ?? undefined

  const entries = await prisma.watchlistEntry.findMany({
    where: {
      userId: session.user.id,
      ...(status ? { status } : {}),
    },
    include: { anime: true },
    orderBy: { updatedAt: "desc" },
  })

  return Response.json(entries)
}

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id)
    return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { animeId, status, rating, episodesWatched } = body

  if (!animeId || !status)
    return Response.json({ error: "animeId and status are required" }, { status: 400 })

  const entry = await prisma.watchlistEntry.upsert({
    where: { userId_animeId: { userId: session.user.id, animeId } },
    update: { status, rating: rating ?? null, episodesWatched: episodesWatched ?? 0 },
    create: {
      userId: session.user.id,
      animeId,
      status,
      rating: rating ?? null,
      episodesWatched: episodesWatched ?? 0,
    },
  })

  return Response.json(entry)
}

export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id)
    return Response.json({ error: "Unauthorized" }, { status: 401 })

  const animeId = Number(request.nextUrl.searchParams.get("animeId"))
  if (!animeId)
    return Response.json({ error: "animeId is required" }, { status: 400 })

  await prisma.watchlistEntry.deleteMany({
    where: { userId: session.user.id, animeId },
  })

  return Response.json({ success: true })
}
