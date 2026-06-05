import prisma from "@/lib/prisma"

const JIKAN_BASE = "https://api.jikan.moe/v4"

interface JikanAnimeData {
  mal_id: number
  title: string
  images: { jpg: { large_image_url: string; image_url: string } }
  synopsis: string | null
  episodes: number | null
  score: number | null
  genres: Array<{ mal_id: number; name: string }>
}

function toRecord(a: JikanAnimeData) {
  return {
    id: a.mal_id,
    title: a.title,
    coverUrl: a.images.jpg.large_image_url || a.images.jpg.image_url,
    synopsis: a.synopsis,
    episodeCount: a.episodes,
    score: a.score,
    genres: a.genres.map((g) => g.name),
  }
}

async function upsertAnime(a: JikanAnimeData) {
  const data = toRecord(a)
  await prisma.anime.upsert({
    where: { id: data.id },
    update: { ...data, cachedAt: new Date() },
    create: data,
  })
}

export async function searchAnimeFirst(query: string) {
  const url = `${JIKAN_BASE}/anime?q=${encodeURIComponent(query)}&limit=1&sfw=true`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return null
  const { data }: { data: JikanAnimeData[] } = await res.json()
  if (!data.length) return null
  await upsertAnime(data[0])
  return toRecord(data[0])
}

export async function searchAnime(query: string) {
  const url = `${JIKAN_BASE}/anime?q=${encodeURIComponent(query)}&limit=20&sfw=true`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`Jikan search failed: ${res.status}`)
  const { data }: { data: JikanAnimeData[] } = await res.json()

  await Promise.all(data.map(upsertAnime))
  return data.map(toRecord)
}

export async function fetchTopAnime(limit = 12) {
  const url = `${JIKAN_BASE}/top/anime?filter=bypopularity&limit=${limit}&sfw=true`
  const res = await fetch(url, { next: { revalidate: 86400 } })
  if (!res.ok) return []
  const { data }: { data: JikanAnimeData[] } = await res.json()
  await Promise.all(data.map(upsertAnime))
  return data.map(toRecord)
}

export async function fetchAnimeByGenre(genreId: number) {
  const url = `${JIKAN_BASE}/anime?genres=${genreId}&order_by=score&sort=desc&limit=20&sfw=true`
  const res = await fetch(url, { next: { revalidate: 86400 } })
  if (!res.ok) return []
  const { data }: { data: JikanAnimeData[] } = await res.json()
  await Promise.all(data.map(upsertAnime))
  return data.map(toRecord)
}

export async function getAnime(id: number) {
  const cached = await prisma.anime.findUnique({ where: { id } })
  if (cached) return { ...cached, genres: cached.genres as string[] }

  const res = await fetch(`${JIKAN_BASE}/anime/${id}`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) throw new Error(`Jikan fetch failed: ${res.status}`)
  const { data }: { data: JikanAnimeData } = await res.json()

  await upsertAnime(data)
  return toRecord(data)
}
