import { ShieldCheck, Clock, Award, Sparkles } from "lucide-react"
import { Reveal } from "@/components/reveal"

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Certified Protection",
    blurb: "Manufacturer-approved films and coatings backed by a written warranty on every job.",
  },
  {
    icon: Clock,
    title: "On-Time Delivery",
    blurb: "Transparent timelines and live updates so your car is ready exactly when promised.",
  },
  {
    icon: Award,
    title: "Award-Winning Team",
    blurb: "Multi-award detailers with thousands of vehicles restored to showroom condition.",
  },
  {
    icon: Sparkles,
    title: "Premium Products",
    blurb: "We only use professional-grade compounds, ceramics and microfiber materials.",
  },
]

export function WhyChooseUs() {
  return (
    <section id="why" className="border-t border-white/5 py-28 md:py-32">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-4 font-heading text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-accent-red)]">
            Why Choose Us
          </p>
          <h2 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            Detailing Done The Right Way
          </h2>
          <p className="mt-5 text-[var(--color-body-text)]">
            From the first inspection to the final buff, every detail is handled with obsessive
            precision and genuine care for your vehicle.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-sm bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, blurb }, i) => (
            <Reveal
              key={title}
              delay={i * 90}
              className="group relative bg-[var(--color-ink)] p-8 transition-colors duration-300 hover:bg-[var(--color-ink-elevated)]"
            >
              <span className="absolute right-6 top-6 font-heading text-5xl font-bold text-white/5 transition-colors group-hover:text-[var(--color-accent-red)]/20">
                0{i + 1}
              </span>
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent-red)]/10 text-[var(--color-accent-red)] transition-all duration-300 group-hover:bg-[var(--color-accent-red)] group-hover:text-white">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-6 font-heading text-2xl font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm text-[var(--color-muted-text)]">{blurb}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
