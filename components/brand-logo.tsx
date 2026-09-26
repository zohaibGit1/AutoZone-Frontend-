import Image from 'next/image'
import Link from 'next/link'

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  href?: string
  onClick?: () => void
  className?: string
}

const sizeMap = {
  sm: { imgSize: 36, textSize: 'text-xl', subSize: 'text-[9px]' },
  md: { imgSize: 46, textSize: 'text-2xl', subSize: 'text-[10px]' },
  lg: { imgSize: 64, textSize: 'text-3xl', subSize: 'text-xs' },
  xl: { imgSize: 96, textSize: 'text-4xl', subSize: 'text-sm' },
}

export function BrandLogo({
  size = 'md',
  showText = true,
  href = '/',
  onClick,
  className = '',
}: BrandLogoProps) {
  const config = sizeMap[size]

  const content = (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      <div className="relative shrink-0 overflow-hidden rounded-full transition-transform duration-300 group-hover:scale-105"
        style={{ width: config.imgSize, height: config.imgSize }}
      >
        <Image
          src="/images/autozone-logo.png"
          alt="AutoZone Detailing & Accessories"
          width={config.imgSize}
          height={config.imgSize}
          priority
          className="h-full w-full object-cover object-center"
        />
      </div>

      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <span className={`font-heading ${config.textSize} font-extrabold tracking-wider uppercase text-white transition-colors group-hover:text-zinc-100`}>
            AUTO<span className="text-[#ea0a0b]">ZONE</span>
          </span>
          <span className={`font-heading ${config.subSize} font-bold tracking-[0.22em] uppercase text-[#b9b9bd] mt-0.5`}>
            Detailing & Accessories
          </span>
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} onClick={onClick} className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    )
  }

  return content
}
