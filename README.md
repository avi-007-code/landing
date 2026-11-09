# CampusLoop — Landing Pages

Next.js 16 (App Router) + Tailwind CSS v4 + TanStack Query. Built for the CampusLoop platform (student club & event management).

## Pages

### `/` — Main product landing page (business model)
- Hero with product dashboard visual
- Partner college logo cloud
- Animated stats band (TanStack Query data-driven where applicable)
- Features grid (“What we provide”)
- How it works
- Testimonials
- CTA + footer

Design language: deep ink navy, paper white, electric indigo brand. Professional, corporate, conversion-focused.

### `/[college]` — Campus homepage (energetic / creative)
- Big display hero (“THE STUDENTS ARE OUT.” style headlines)
- Marquee strip
- Events carousel (scroll-snap, TanStack Query-driven)
- Spotlight event band
- Clubs grid (TanStack Query-driven)

Design language: warm cream, warm ink, coral / lime / violet, Anton display type, hard offset shadows, stickers.

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- Main landing: `/`
- Campus pages: `/northwood`, `/crestview`, `/bellavista`, `/westbrook` (add more in `src/lib/data.ts`)

## Tech

- `next/font/google` — Anton (campus display), Sora (marketing display), Inter (body)
- Tailwind CSS v4 (`@theme` tokens in `src/app/globals.css`)
- `@tanstack/react-query` — client data fetching (`src/lib/queries.ts`)
- Mock data in `src/lib/data.ts` — swap for real API later

## Structure

```
src/
  app/
    page.tsx              # Main landing
    [college]/page.tsx    # Campus homepage (dynamic)
    layout.tsx / globals.css
  components/
    Providers.tsx         # QueryClientProvider
    marketing/            # Main page sections
    campus/               # Campus page sections
  lib/
    data.ts               # Types + mock colleges/clubs/events
    queries.ts            # TanStack Query keys & hooks
```
