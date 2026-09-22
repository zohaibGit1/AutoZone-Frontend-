# DetailX Next.js Frontend Clone

A frontend-only Next.js implementation inspired by the DetailX car-detailing demo.

## Stack
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Lucide icons
- Local image assets

## Run
```bash
pnpm install
pnpm dev
```

Then open http://localhost:3000

## Included routes
- /
- /about
- /services
- /team
- /faqs
- /pricing
- /contact
- /quote
- /booking
- /cars
- /portfolio
- /shop
- /shop/cart
- /shop/checkout
- /shop/wishlist
- /blog
- /blog/[slug]
- /tools/typography

## Design notes
The frontend follows the visual system of the referenced DetailX demo: dark automotive presentation, large condensed uppercase headings, red accent, full-width imagery, service cards, CTA split panels, testimonials, statistics, articles, contact form and dark footer.

Images in `public/images` are local project assets. They can be replaced with licensed/original images without changing the layout.

The forms and shop pages are frontend demonstrations only; connect them to your backend, email provider, CMS or commerce system when needed.
