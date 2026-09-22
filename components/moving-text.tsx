export function MovingText() {
  const items = [
    'DRIVE A NEW CAR EVERY DAY',
    'AUTOZONE DETAILING',
    'PRECISION • CARE • SHINE',
  ]

  return (
    <section aria-label="AutoZone highlights" className="overflow-hidden border-y border-white/5 bg-[#0d0c0f] py-6 md:py-9">
      <div className="marquee-track flex w-max items-center whitespace-nowrap">
        {[...items, ...items].map((text, index) => (
          <div key={`${text}-${index}`} className="flex items-center">
            <span
              className="font-heading text-[74px] font-semibold uppercase leading-none tracking-[-0.035em] text-[#25262a] sm:text-[100px] md:text-[135px] lg:text-[170px]"
              style={{ WebkitTextStroke: '0.5px #25262a' }}
            >
              {text}
            </span>
            <span className="mx-7 text-[44px] font-bold text-[#ea0a0b] sm:mx-10 md:text-[70px]">✦</span>
          </div>
        ))}
      </div>
    </section>
  )
}
