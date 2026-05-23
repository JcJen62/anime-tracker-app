"use client"

import { useState } from "react"
import { importAnimeList, type ImportResult } from "./importActions"

export default function ImportPanel() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  const titles = text
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean)

  async function handleImport() {
    if (!titles.length) return
    setLoading(true)
    setResult(null)
    try {
      const res = await importAnimeList(titles)
      setResult(res)
      setText("")
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setOpen(false)
    setResult(null)
    setText("")
  }

  return (
    <div className="mb-6">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="text-sm text-zinc-400 hover:text-white transition-colors border border-zinc-700 hover:border-zinc-500 rounded-lg px-3 py-1.5"
        >
          Import list
        </button>
      ) : (
        <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white">Import watched anime</p>
            <button
              onClick={handleClose}
              className="text-zinc-500 hover:text-white transition-colors text-lg leading-none"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-zinc-500">
            One title per line. Each will be searched on MyAnimeList and added as{" "}
            <span className="text-zinc-300">Completed</span>.
          </p>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
            rows={8}
            placeholder={"Fullmetal Alchemist: Brotherhood\nAttack on Titan\nDeath Note"}
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 resize-none disabled:opacity-50"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">
              {titles.length} title{titles.length !== 1 ? "s" : ""}
              {titles.length > 0 && ` · ~${Math.ceil(titles.length * 0.4)}s`}
            </span>
            <button
              onClick={handleImport}
              disabled={loading || titles.length === 0}
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Importing…" : "Import"}
            </button>
          </div>

          {result && (
            <div className="rounded-lg bg-zinc-800 border border-zinc-700 p-3 space-y-1.5 text-sm">
              {result.added.length > 0 && (
                <p className="text-green-400">
                  ✓ Added {result.added.length}: {result.added.join(", ")}
                </p>
              )}
              {result.skipped.length > 0 && (
                <p className="text-zinc-400">
                  — Skipped {result.skipped.length} already in watchlist:{" "}
                  {result.skipped.join(", ")}
                </p>
              )}
              {result.failed.length > 0 && (
                <p className="text-red-400">
                  ✗ Not found {result.failed.length}: {result.failed.join(", ")}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
