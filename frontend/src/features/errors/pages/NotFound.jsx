import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-background via-background to-background dark:from-background dark:via-neutral-950 dark:to-black px-4">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-border/60 bg-card/80 shadow-[0_18px_60px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:bg-card/40 dark:border-border/40">
        <div className="pointer-events-none absolute -top-24 -right-24 size-56 rounded-full bg-gradient-to-br from-primary/20 via-sky-500/15 to-emerald-400/15 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 px-8 py-10 text-center sm:px-10 sm:py-12">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground dark:bg-background/40">
            404 • Not Found
          </p>

          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl bg-gradient-to-r from-primary via-sky-500 to-emerald-400 bg-clip-text text-transparent">
              Oops! Page not found.
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              The page you are looking for does not exist or has been moved.
            </p>
          </div>

          <div className="mt-2 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button
              className="w-full sm:w-auto"
              size="lg"
              onClick={() => navigate('/')}
            >
              Go to Home
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              size="lg"
              onClick={() => navigate('/auth')}
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound