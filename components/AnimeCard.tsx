import Image from "next/image"
import Link from "next/link"
import StatusBadge from "./StatusBadge"

interface AnimeCardProps {
  id: number
  title: string
  coverUrl: string
  score?: number | null
  episodeCount?: number | null
  genres?: string[]
  status?: string | null
  rating?: number | null
}

export default function AnimeCard({
  id,
  title,
  coverUrl,
  score,
  episodeCount,
  genres,
  status,
  rating,
}: AnimeCardProps) {
  return (
    <Link
      href={`/anime/${id}`}
      className="group flex flex-col rounded-lg bg-zinc-900 overflow-hidden hover:ring-1 hover:ring-indigo-500 transition-all"
    >
      <div className="relative aspect-[2/3] w-full bg-zinc-800">
        <Image
          src={coverUrl}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 20vw"
          className="object-cover transition-opacity group-hover:opacity-90"
        />
        {score != null && (
          <div className="absolute top-2 left-2 rounded bg-black/70 px-1.5 py-0.5 text-xs font-semibold text-yellow-400">
            ★ {score.toFixed(1)}
          </div>
        )}
        {status && (
          <div className="absolute top-2 right-2">
            <StatusBadge status={status} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 p-3">
        <h3 className="text-sm sm:text-base font-medium text-zinc-100 line-clamp-2 leading-snug group-hover:text-white">
          {title}
        </h3>

        <div className="flex items-center justify-between mt-0.5">
          {episodeCount != null && (
            <span className="text-xs text-zinc-500">{episodeCount} eps</span>
          )}
          {rating != null && (
            <span className="text-xs font-semibold text-indigo-400">
              {rating}/10
            </span>
          )}
        </div>

        {genres && genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {genres.slice(0, 3).map((g) => (
              <span
                key={g}
                className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400"
              >
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
