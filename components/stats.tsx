export function Stats() {
  return (
    <section className="bg-[#ea0a0b] py-16 text-white">
      <div className="container grid grid-cols-2 md:grid-cols-4">
        {[
          ["1200+", "Projects"],
          ["48", "People"],
          ["15", "Years"],
          ["6", "Offices"],
        ].map(([v, l]) => (
          <div
            key={l}
            className="border-white/25 px-5 py-5 text-center first:border-0 md:border-l"
          >
            <div className="font-heading text-6xl font-bold sm:text-7xl">
              {v}
            </div>
            <div className="mt-2 font-heading text-xs font-bold uppercase tracking-[.25em]">
              {l}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
