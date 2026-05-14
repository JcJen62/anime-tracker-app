"use client"

import { useState } from "react"

function ratingColor(n: number): string {
  if (n <= 3) return "bg-red-600 text-white ring-red-500"
  if (n <= 5) return "bg-orange-500 text-white ring-orange-400"
  if (n <= 7) return "bg-yellow-500 text-black ring-yellow-400"
  if (n <= 9) return "bg-green-500 text-white ring-green-400"
  return "bg-emerald-400 text-black ring-emerald-300"
}

function ratingHover(n: number): string {
  if (n <= 3) return "hover:bg-red-600/30 hover:text-red-300"
  if (n <= 5) return "hover:bg-orange-500/30 hover:text-orange-300"
  if (n <= 7) return "hover:bg-yellow-500/30 hover:text-yellow-300"
  if (n <= 9) return "hover:bg-green-500/30 hover:text-green-300"
  return "hover:bg-emerald-400/30 hover:text-emerald-300"
}

interface RatingPickerProps {
  value: number | null
  onChange: (rating: number | null) => void
  disabled?: boolean
}

export default function RatingPicker({ value, onChange, disabled }: RatingPickerProps) {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
        const isSelected = value === n
        const isHighlighted = hovered !== null ? n <= hovered : value !== null ? n <= value : false

        return (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onChange(value === n ? null : n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(null)}
            className={[
              "w-8 h-8 rounded text-sm font-semibold transition-all ring-1 ring-inset disabled:opacity-40 disabled:cursor-not-allowed",
              isSelected
                ? `${ratingColor(n)} ring-2`
                : isHighlighted && hovered !== null
                ? `${ratingColor(n)} opacity-70`
                : `bg-zinc-800 text-zinc-400 ring-zinc-700 ${ratingHover(n)}`,
            ].join(" ")}
          >
            {n}
          </button>
        )
      })}
      {value !== null && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(null)}
          className="ml-1 text-xs text-zinc-500 hover:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          clear
        </button>
      )}
    </div>
  )
}
