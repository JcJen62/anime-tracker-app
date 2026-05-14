import { Suspense } from "react"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import LoadingSpinner from "@/components/LoadingSpinner"
import WatchlistClient from "./WatchlistClient"

export default async function WatchlistPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/api/auth/signin")

  return (
    <Suspense fallback={<div className="flex justify-center py-16"><LoadingSpinner /></div>}>
      <WatchlistClient />
    </Suspense>
  )
}
