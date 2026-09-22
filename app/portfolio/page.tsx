import Image from "next/image";
import { ContentShell } from "@/components/content-shell";
const work = [
  ["Paint Correction", "/images/about-detailing.png"],
  ["Ceramic Coating", "/images/ceramic-coating.png"],
  ["Wheel Detailing", "/images/rims-tires.png"],
  ["Interior Care", "/images/cta-interior.png"],
  ["Wash & Finish", "/images/cta-wash.png"],
  ["Protection Film", "/images/protection-film.png"],
];
export default function Portfolio() {
  return (
    <ContentShell
      title="Portfolio"
      eyebrow="Our Work"
      image="/images/about-detailing.png"
    >
      <section className="container grid gap-3 pb-28 sm:grid-cols-2 lg:grid-cols-3">
        {work.map(([n, i]) => (
          <article
            key={n}
            className="group relative aspect-square overflow-hidden"
          >
            <Image
              src={i}
              alt={n}
              fill
              className="object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
            <h2 className="absolute bottom-6 left-6 text-3xl">{n}</h2>
          </article>
        ))}
      </section>
    </ContentShell>
  );
}
