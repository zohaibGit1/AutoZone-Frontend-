import Image from "next/image";
import { ContentShell } from "@/components/content-shell";
const cars = [
  ["Performance Coupe", "/images/hero-car.png"],
  ["Luxury Sedan", "/images/cta-interior.png"],
  ["Premium SUV", "/images/ceramic-coating.png"],
  ["Classic Sports Car", "/images/rims-tires.png"],
];
export default function Cars() {
  return (
    <ContentShell
      title="All Cars"
      eyebrow="Automotive Care"
      image="/images/hero-car.png"
    >
      <section className="container grid gap-6 pb-28 sm:grid-cols-2 lg:grid-cols-4">
        {cars.map(([n, i]) => (
          <article key={n} className="group">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={i}
                alt={n}
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
              />
            </div>
            <h2 className="mt-4 text-2xl">{n}</h2>
            <p className="mt-1 text-sm text-[#8b8b90]">
              View detailing and protection options.
            </p>
          </article>
        ))}
      </section>
    </ContentShell>
  );
}
