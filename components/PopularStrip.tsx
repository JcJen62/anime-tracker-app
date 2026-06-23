import Image from "next/image"
import Link from "next/link"
import AnimeCard from "@/components/AnimeCard"

interface PopularAnime {
  id: number
  title: string
  coverUrl: string
  score?: number | null
  episodeCount?: number | null
  genres?: string[]
}

const GRID_CLASS =
  "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-5 sm:gap-6"

export default function PopularStrip({ anime }: { anime: PopularAnime[] }) {
  const items = anime.slice(0, 10)
  if (items.length === 0) return null

  return (
    <>
      {/* Desktop (lg+): hover/focus accordion. Pure CSS, no JS. */}
      <div className="hidden lg:flex gap-2 h-[420px]" role="list">
        {items.map((a) => (
          <Link
            key={a.id}
            href={`/anime/${a.id}`}
            role="listitem"
            aria-label={a.title}
            className="group relative flex-1 hover:flex-[5] focus:flex-[5] overflow-hidden rounded-xl bg-zinc-900 transition-[flex-grow] duration-300 ease-out motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Image
              src={a.coverUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 35vw, 1px"
              className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

            {a.score != null && (
              <div className="absolute top-3 left-3 rounded bg-black/70 px-1.5 py-0.5 text-xs font-semibold text-yellow-400">
                ★ {a.score.toFixed(1)}
              </div>
            )}

            {/* Collapsed spine: vertical title */}
            <div className="absolute inset-0 flex items-end justify-center pb-4 transition-opacity duration-200 group-hover:opacity-0 group-focus:opacity-0">
              <span className="[writing-mode:vertical-rl] rotate-180 max-h-[85%] overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold text-zinc-100 drop-shadow">
                {a.title}
              </span>
            </div>

            {/* Expanded: full details, fade in once open */}
            <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 transition-opacity duration-300 delay-100 group-hover:opacity-100 group-focus:opacity-100">
              <h3 className="text-base font-semibold text-white line-clamp-2 leading-snug">
                {a.title}
              </h3>
              {a.episodeCount != null && (
                <p className="mt-1 text-xs text-zinc-300">{a.episodeCount} eps</p>
              )}
              {a.genres && a.genres.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {a.genres.slice(0, 3).map((g) => (
                    <span
                      key={g}
                      className="rounded-full bg-white/15 px-2 py-0.5 text-xs text-zinc-100 backdrop-blur-sm"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Below lg: the regular grid. Same cover URLs → no double image download. */}
      <div className={`${GRID_CLASS} lg:hidden`}>
        {items.map((a) => (
          <AnimeCard
            key={a.id}
            id={a.id}
            title={a.title}
            coverUrl={a.coverUrl}
            score={a.score}
            episodeCount={a.episodeCount}
            genres={a.genres}
          />
        ))}
      </div>
    </>
  )
}
