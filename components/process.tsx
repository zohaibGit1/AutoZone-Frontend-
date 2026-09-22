import { Reveal } from "@/components/reveal"

const STEPS = [
  {
    step: "01",
    title: "Inspection",
    blurb: "We assess paint depth, swirls and defects under professional lighting.",
  },
  {
    step: "02",
    title: "Preparation",
    blurb: "A thorough foam wash, decontamination and clay treatment for a clean surface.",
  },
  {
    step: "03",
    title: "Correction",
    blurb: "Multi-stage machine polishing removes swirls and restores deep gloss.",
  },
  {
    step: "04",
    title: "Protection",
    blurb: "Ceramic coating or PPF is applied and cured to lock in the finish.",
  },
]

export function Process() {
  return (
    <section id="process" className="relative overflow-hidden bg-[var(--color-ink-soft)] py-28 md:py-32">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <Reveal className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-4 font-heading text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-accent-red)]">
              How It Works
            </p>
            <h2 className="max-w-xl text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
              Our Four-Step Detailing Process
            </h2>
          </div>
          <p className="max-w-sm text-[var(--color-body-text)]">
            A proven workflow refined over 15 years of professional detailing keeps results
            consistent on every single vehicle.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ step, title, blurb }, i) => (
            <Reveal key={step} delay={i * 100} className="group relative">
              <div className="mb-6 h-px w-full bg-white/10">
                <div className="h-px w-0 bg-[var(--color-accent-red)] transition-all duration-700 group-hover:w-full" />
              </div>
              <span className="font-heading text-6xl font-bold text-[var(--color-accent-red)]">{step}</span>
              <h3 className="mt-4 font-heading text-2xl font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm text-[var(--color-muted-text)]">{blurb}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
