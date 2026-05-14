interface GenreTagProps {
  genre: string
  onClick?: () => void
  active?: boolean
}

export default function GenreTag({ genre, onClick, active }: GenreTagProps) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={[
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
          active
            ? "bg-indigo-600 text-white"
            : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700",
        ].join(" ")}
      >
        {genre}
      </button>
    )
  }

  return (
    <span className="inline-flex items-center rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
      {genre}
    </span>
  )
}
