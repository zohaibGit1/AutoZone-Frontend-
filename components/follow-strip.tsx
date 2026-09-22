export function FollowStrip() {
  return (
    <section className="py-24 text-center">
      <a
        href="#"
        className="group inline-flex flex-col items-center gap-5"
        aria-label="Follow us on Instagram"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 text-white transition-colors group-hover:border-[var(--color-accent-red)] group-hover:bg-[var(--color-accent-red)]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          </svg>
        </span>
        <span className="font-heading text-sm font-semibold uppercase tracking-[0.3em] text-white">
          Follow Us
        </span>
      </a>
    </section>
  )
}
