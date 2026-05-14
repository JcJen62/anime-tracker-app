const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  watching: {
    label: "Watching",
    className: "bg-blue-500/20 text-blue-300 ring-blue-500/30",
  },
  completed: {
    label: "Completed",
    className: "bg-green-500/20 text-green-300 ring-green-500/30",
  },
  plan_to_watch: {
    label: "Plan to Watch",
    className: "bg-zinc-500/20 text-zinc-300 ring-zinc-500/30",
  },
  dropped: {
    label: "Dropped",
    className: "bg-red-500/20 text-red-300 ring-red-500/30",
  },
  on_hold: {
    label: "On Hold",
    className: "bg-yellow-500/20 text-yellow-300 ring-yellow-500/30",
  },
}

export default function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-zinc-500/20 text-zinc-300 ring-zinc-500/30",
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${config.className}`}
    >
      {config.label}
    </span>
  )
}
