import Link from "next/link"
import { redirect } from "next/navigation"
import { AuthError } from "next-auth"
import { signIn } from "@/auth"
import OAuthButtons from "./OAuthButtons"

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Invalid email or password.",
  OAuthAccountNotLinked: "This email is already linked to a different sign-in method.",
  Configuration: "This sign-in method isn't configured. Please try another option.",
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>
}) {
  const { error, callbackUrl } = await searchParams
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? "Something went wrong. Please try again.") : null
  const redirectTo = callbackUrl ?? "/"

  const hasGitHub = !!(process.env.GITHUB_ID && process.env.GITHUB_SECRET)
  const hasGoogle = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  const hasOAuth = hasGitHub || hasGoogle

  async function handleCredentials(formData: FormData) {
    "use server"
    try {
      await signIn("credentials", {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        redirectTo,
      })
    } catch (e) {
      if (e instanceof AuthError) {
        const params = new URLSearchParams({ error: "CredentialsSignin" })
        if (callbackUrl) params.set("callbackUrl", callbackUrl)
        redirect(`/auth/signin?${params}`)
      }
      throw e
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-xl font-bold tracking-wide text-white">
            AniTrack
          </Link>
          <p className="text-sm text-zinc-500 mt-1">Sign in to your account</p>
        </div>

        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col gap-5">
          {errorMessage && (
            <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
              {errorMessage}
            </p>
          )}

          {hasOAuth && (
            <OAuthButtons hasGitHub={hasGitHub} hasGoogle={hasGoogle} callbackUrl={redirectTo} />
          )}

          {hasOAuth && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-xs text-zinc-600">or</span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>
          )}

          <form action={handleCredentials} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-medium text-zinc-400">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-medium text-zinc-400">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
