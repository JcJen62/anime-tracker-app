import { auth } from "@/auth"
import { redirect } from "next/navigation"
import WatchlistClient from "./WatchlistClient"

export default async function WatchlistPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/api/auth/signin")

  return <WatchlistClient />
}
