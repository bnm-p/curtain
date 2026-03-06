import Link from "next/link"

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 text-center">
      <h1 className="text-5xl font-bold tracking-tight">@bnm/curtain</h1>
      <p className="max-w-md text-lg text-fd-muted-foreground">
        Page transition system for Next.js App Router.
      </p>
      <Link
        href="/docs"
        className="rounded-md bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground"
      >
        Get started
      </Link>
    </main>
  )
}
