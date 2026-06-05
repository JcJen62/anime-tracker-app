import Image from "next/image"

interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  image?: string
}

export default function EmptyState({
  title,
  description,
  action,
  image = "/images/empty-state.webp",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Image
        src={image}
        alt=""
        width={800}
        height={339}
        className="mb-6 w-full max-w-xs rounded-xl opacity-90"
      />
      <h3 className="text-lg font-semibold text-zinc-200">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-zinc-500 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
