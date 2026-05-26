# Store Auditor — marketing site

Astro 5 marketing site for **Store Auditor**, a Shopify performance audit app. Lives independently from the app repo (`ShopifyAuditor`) so SEO content, brand pages, and the app source never get tangled.

## Stack
- **Astro 5** — static site generation, zero JS by default, perfect Lighthouse.
- **Pure CSS** (scoped per-component) — no Tailwind, no React.
- **Inter Variable** loaded from `rsms.me` for typography.
- **Vercel** for hosting (single-region: `sfo1`).

## Local dev
```bash
npm install
npm run dev          # localhost:4321
npm run build        # writes dist/
npm run preview      # serves the built dist/
```

## Pages
| Path | Target keywords | Notes |
|---|---|---|
| `/` | "Shopify apps slowing store", "Shopify speed" | Hero, problem, how it works, differentiator, pricing tease, FAQ, CTA |
| `/how-it-works` | "Shopify performance audit", "Lighthouse Shopify" | Methodology deep-dive |
| `/pricing` | "Shopify performance app pricing" | Plans + comparison table |
| `/improve-shopify-speed` | "improve Shopify speed", "Shopify store slow" | 7-fix SEO content piece |
| `/find-slow-shopify-apps` | "which Shopify apps slow", "audit Shopify apps" | Manual vs automated method |

## SEO setup
- Sitemap auto-generated at `/sitemap-index.xml` by `@astrojs/sitemap`.
- `public/robots.txt` allows everything and points at the sitemap.
- Per-page meta: `<title>`, description, canonical, OG + Twitter cards, schema.org JSON-LD.
- `/` ships `SoftwareApplication` schema; `/improve-shopify-speed` and `/find-slow-shopify-apps` ship `Article` schema.

## Brand
The visual identity is carried verbatim from the Shopify app:
- Deep navy `#0B1220` background
- Orange `#F59E0B` spike (the "anomaly we flag")
- Green `#10B981` monitoring dot
- Pulse-waveform motif as the signature graphic

See `src/styles/global.css` for the token reference. Components are in `src/components/`.

## Deploying to Vercel

### First-time setup
1. Push this folder to a new GitHub repo (or use `vercel` CLI directly).
2. In Vercel: New Project → import the repo.
3. Vercel auto-detects Astro. No config tweaks needed.
4. Set custom domain once purchased (Vercel handles SSL).
5. Set environment variable `PUBLIC_SITE_URL=https://yourdomain.com` so canonical URLs render correctly.

### CLI deploy (one-off)
```bash
vercel --prod
```

## Where the CTA points
Every `Install on Shopify` button currently points to `https://apps.shopify.com/store-auditor`. That URL becomes live once Shopify approves the listing (currently under review). Until then, the link 404s — that's intentional: it's the URL we want indexed and recognized.

## Files worth knowing about
- `astro.config.mjs` — site URL + sitemap integration
- `vercel.json` — security headers + immutable cache on static assets
- `src/components/PulseLogo.astro` — the inline brand mark
- `src/components/Waveform.astro` — the signature spike graphic
- `src/components/AppList.astro` — sample per-app impact table
- `src/components/FAQ.astro` — accordion FAQ (uses `<details>`)
- `src/layouts/BaseLayout.astro` — shared shell with `<SeoMeta>` + Header + Footer

## What to do once a domain is bought
1. Buy the domain (suggestion: `storeauditor.au`, or `defyn.com.au/auditor` subpath).
2. Vercel → project → Settings → Domains → add it.
3. Update `PUBLIC_SITE_URL` env var to match.
4. Re-deploy.
5. Submit `https://yourdomain.com/sitemap-index.xml` to Google Search Console.

That's it. No DNS magic, no nameservers needed — Vercel handles all of it once you `CNAME` to `cname.vercel-dns.com`.
