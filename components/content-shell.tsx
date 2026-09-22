import Link from 'next/link'
import Image from 'next/image'
import { PageHero } from './page-hero'
import { SiteHeader } from './site-header'
import { SiteFooter } from './site-footer'
export function ContentShell({title,eyebrow,children,image}: {title:string;eyebrow?:string;children:React.ReactNode;image?:string}){return <><SiteHeader/><main><PageHero title={title} eyebrow={eyebrow} image={image}/>{children}</main><SiteFooter/></>}
export function SectionTitle({eyebrow,title,copy}:{eyebrow:string;title:string;copy?:string}){return <div className="container py-20"><p className="eyebrow mb-4">{eyebrow}</p><h2 className="max-w-4xl text-5xl sm:text-6xl lg:text-7xl">{title}</h2>{copy&&<p className="mt-6 max-w-2xl text-[#a8a8ad]">{copy}</p>}</div>}
export function CTA(){return <section className="bg-[#ea0a0b] py-20"><div className="container flex flex-wrap items-center justify-between gap-8"><h2 className="max-w-2xl text-5xl text-[#0d0c0f]">Ready To Take Care Of Your Car?</h2><Link href="/quote" className="bg-[#0d0c0f] px-8 py-4 font-heading text-sm font-bold uppercase text-white">Book Now</Link></div></section>}
