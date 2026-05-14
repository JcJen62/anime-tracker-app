"use client"

import { useToast } from "@/lib/toast"

const TYPE_STYLES = {
  success: "bg-green-900/90 text-green-200 ring-green-700",
  error: "bg-red-900/90 text-red-200 ring-red-700",
  info: "bg-zinc-800/90 text-zinc-100 ring-zinc-700",
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start justify-between gap-3 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ring-1 backdrop-blur-sm ${TYPE_STYLES[toast.type]}`}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity mt-px"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
