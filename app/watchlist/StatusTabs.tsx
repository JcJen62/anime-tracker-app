"use client"

import { useRouter, useSearchParams } from "next/navigation"

const TABS = [
  { label: "All", value: "" },
  { label: "Watching", value: "watching" },
  { label: "Completed", value: "completed" },
  { label: "Plan to Watch", value: "plan_to_watch" },
  { label: "On Hold", value: "on_hold" },
  { label: "Dropped", value: "dropped" },
]

export default function StatusTabs() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get("status") ?? ""

  return (
    <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() =>
            router.push(tab.value ? `/watchlist?status=${tab.value}` : "/watchlist")
          }
          className={[
            "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            current === tab.value
              ? "bg-indigo-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100",
          ].join(" ")}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
