export function Marquee() {
  const phrase = "Drive A New Car Every Day"
  const items = Array.from({ length: 8 })

  return (
    <section aria-hidden="true" className="overflow-hidden border-y border-white/5 py-10">
      <div className="marquee-track flex w-max whitespace-nowrap">
        {items.map((_, i) => (
          <span
            key={i}
            className="mx-8 font-heading text-6xl font-semibold uppercase text-transparent sm:text-7xl lg:text-8xl"
            style={{ WebkitTextStroke: "1px #3a393f" }}
          >
            {phrase}
          </span>
        ))}
      </div>
    </section>
  )
}
