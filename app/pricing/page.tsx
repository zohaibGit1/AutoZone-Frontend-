import Link from "next/link";
import { ContentShell } from "@/components/content-shell";
const plans = [
  ["Essential", "$39", "Hand wash, wheels, jambs, vacuum and sealant."],
  [
    "Full Detail",
    "$189",
    "Wash, decontamination, polish, interior steam and protection.",
  ],
  [
    "Ceramic Package",
    "$599",
    "Full detail, paint correction, ceramic coating and check-up wash.",
  ],
];
export default function Pricing() {
  return (
    <ContentShell title="Pricing" eyebrow="Simple Packages">
      <section className="container grid gap-px bg-white/10 pb-28 md:grid-cols-3">
        {plans.map(([n, p, d], i) => (
          <article
            key={n}
            className={`bg-[#111015] p-8 md:p-10 ${i === 1 ? "border-t-4 border-[#ea0a0b]" : ""}`}
          >
            <p className="eyebrow text-[#ea0a0b]">
              {i === 1 ? "Popular" : "Package"}
            </p>
            <h2 className="mt-4 text-3xl">{n}</h2>
            <div className="mt-8 font-heading text-6xl font-bold text-white">
              {p}
            </div>
            <p className="mt-4 min-h-20 text-sm text-[#8b8b90]">{d}</p>
            <Link
              href="/quote"
              className="mt-8 inline-block bg-[#ea0a0b] px-7 py-3 font-heading text-sm font-bold uppercase text-white"
            >
              Book Now
            </Link>
          </article>
        ))}
      </section>
    </ContentShell>
  );
}
