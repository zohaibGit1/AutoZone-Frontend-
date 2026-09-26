import Image from 'next/image'

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
          <div
            key={`${text}-${index}`}
            className="flex items-center font-heading text-[74px] font-semibold uppercase leading-none tracking-[-0.035em] text-[#25262a] sm:text-[100px] md:text-[135px] lg:text-[170px]"
          >
            <span style={{ WebkitTextStroke: '0.5px #25262a' }}>
              {text}
            </span>
            <span
              className="inline-flex items-center justify-center shrink-0 mx-8 sm:mx-12 md:mx-16 lg:mx-20 rounded-full overflow-hidden"
              style={{ width: '0.52em', height: '0.52em' }}
            >
              <Image
                src="/images/autozone-logo.png"
                alt="AutoZone Detailing & Accessories"
                width={88}
                height={88}
                className="h-full w-full object-contain rounded-full"
              />
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
