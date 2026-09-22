import { Check } from "lucide-react"
import { Reveal } from "@/components/reveal"

const PLANS = [
  {
    name: "Express",
    price: "89",
    tagline: "Quick refresh for daily drivers",
    features: ["Exterior foam wash", "Wheel & tire clean", "Windows in & out", "Interior vacuum", "Tire dressing"],
    featured: false,
  },
  {
    name: "Premium",
    price: "199",
    tagline: "Our most popular full detail",
    features: [
      "Everything in Express",
      "Single-stage paint polish",
      "Interior steam cleaning",
      "Leather conditioning",
      "6-month sealant",
    ],
    featured: true,
  },
  {
    name: "Ultimate",
    price: "349",
    tagline: "Showroom-grade protection",
    features: [
      "Everything in Premium",
      "Multi-stage correction",
      "Ceramic coating",
      "Engine bay detail",
      "12-month warranty",
    ],
    featured: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="border-t border-white/5 py-28 md:py-32">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-4 font-heading text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-accent-red)]">
            Our Pricing
          </p>
          <h2 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            Packages For Every Budget
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <Reveal
              key={plan.name}
              delay={i * 110}
              className={`group relative flex flex-col p-8 transition-transform duration-300 hover:-translate-y-2 ${
                plan.featured
                  ? "bg-[var(--color-accent-red)] text-white"
                  : "border border-white/10 bg-[var(--color-ink-soft)]"
              }`}
            >
              {plan.featured && (
                <span className="absolute right-6 top-6 rounded-full bg-white px-3 py-1 font-heading text-xs font-semibold uppercase tracking-wide text-[var(--color-accent-red)]">
                  Popular
                </span>
              )}
              <h3 className="font-heading text-3xl font-semibold text-white">{plan.name}</h3>
              <p className={`mt-2 text-sm ${plan.featured ? "text-white/80" : "text-[var(--color-muted-text)]"}`}>
                {plan.tagline}
              </p>
              <div className="mt-8 flex items-end gap-1">
                <span className="font-heading text-2xl font-semibold text-white">$</span>
                <span className="font-heading text-7xl font-bold leading-none text-white">{plan.price}</span>
              </div>
              <ul className="mt-8 flex-1 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check
                      className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                        plan.featured ? "text-white" : "text-[var(--color-accent-red)]"
                      }`}
                    />
                    <span className={plan.featured ? "text-white/90" : "text-[var(--color-body-text)]"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className={`mt-8 inline-block py-4 text-center font-heading text-sm font-semibold uppercase tracking-wide transition-colors ${
                  plan.featured
                    ? "bg-white text-[var(--color-accent-red)] hover:bg-[var(--color-ink)] hover:text-white"
                    : "bg-[var(--color-accent-red)] text-white hover:bg-white hover:text-[var(--color-ink)]"
                }`}
              >
                Choose {plan.name}
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
