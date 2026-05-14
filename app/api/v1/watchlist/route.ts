import { NextRequest } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

const VALID_STATUSES = ["watching", "completed", "plan_to_watch", "on_hold", "dropped"] as const

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id)
    return Response.json({ error: "Unauthorized" }, { status: 401 })

  const statusParam = request.nextUrl.searchParams.get("status") ?? undefined
  const status = VALID_STATUSES.includes(statusParam as typeof VALID_STATUSES[number])
    ? statusParam
    : undefined

  try {
    const entries = await prisma.watchlistEntry.findMany({
      where: {
        userId: session.user.id,
        ...(status ? { status } : {}),
      },
      include: { anime: true },
      orderBy: { updatedAt: "desc" },
    })
    return Response.json(entries)
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id)
    return Response.json({ error: "Unauthorized" }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { animeId, status, rating, episodesWatched } = body as Record<string, unknown>

  if (!animeId || typeof animeId !== "number")
    return Response.json({ error: "animeId must be a number" }, { status: 400 })

  if (!VALID_STATUSES.includes(status as typeof VALID_STATUSES[number]))
    return Response.json(
      { error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
      { status: 400 }
    )

  const clampedRating =
    typeof rating === "number" ? Math.min(10, Math.max(1, Math.round(rating))) : null

  const clampedEpisodes =
    typeof episodesWatched === "number" ? Math.max(0, Math.round(episodesWatched)) : 0

  try {
    const entry = await prisma.watchlistEntry.upsert({
      where: { userId_animeId: { userId: session.user.id, animeId } },
      update: { status: status as string, rating: clampedRating, episodesWatched: clampedEpisodes },
      create: {
        userId: session.user.id,
        animeId,
        status: status as string,
        rating: clampedRating,
        episodesWatched: clampedEpisodes,
      },
    })
    return Response.json(entry)
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id)
    return Response.json({ error: "Unauthorized" }, { status: 401 })

  const animeId = Number(request.nextUrl.searchParams.get("animeId"))
  if (!animeId)
    return Response.json({ error: "animeId is required" }, { status: 400 })

  try {
    const { count } = await prisma.watchlistEntry.deleteMany({
      where: { userId: session.user.id, animeId },
    })
    if (count === 0)
      return Response.json({ error: "Entry not found" }, { status: 404 })
    return Response.json({ success: true })
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
