---
title: "Shopify Server Side Rendering: Liquid vs Hydrogen vs Client-Only"
description: "Shopify server side rendering compared across Liquid, Hydrogen, and client-only storefronts, with the Web Vitals trade-offs of each so you can pick the fastest model."
primaryKeyword: "Shopify server side rendering"
secondaryKeywords:
  - "Shopify Liquid vs Hydrogen"
  - "Shopify headless performance"
  - "Shopify client side rendering LCP"
  - "Shopify hydration cost"
  - "Shopify rendering model Web Vitals"
category: performance
publishedDate: 2026-08-17
readingTime: 8
---

Where your storefront HTML gets built, on Shopify's servers or in the shopper's browser, sets the ceiling on every Core Web Vitals score you will ever record.

## Key takeaways

- Liquid is server side rendering by default. Shopify builds the HTML, caches it at the edge, and the browser gets a paintable page on the first response.
- Hydrogen is also server rendered, but you own the server. That buys flexibility and costs you Shopify's edge cache unless you configure caching properly.
- Client-only storefronts, where an empty div boots a JavaScript bundle that then fetches products, are the slowest model on mobile and the hardest to fix.
- The rendering model sets your floor for Largest Contentful Paint and your ceiling for Interaction to Next Paint. Apps and images move you within that range, not outside it.
- Most stores do not have a rendering problem. They have a Liquid store with too much JavaScript layered on top, which produces client-side symptoms on a server-rendered page.

## What server side rendering actually means on Shopify

Server side rendering means the HTML a shopper receives already contains the content. The product title, the price, the image tag, the description: all of it is in the first response. The browser can parse and paint immediately.

Client side rendering means the first response contains almost nothing. The browser downloads a JavaScript bundle, executes it, the bundle calls an API for product data, and only then does anything appear. The shopper watches a blank screen or a skeleton for that entire sequence.

On Shopify, the default is server rendering. Liquid templates run on Shopify's infrastructure, and by the time the response leaves Shopify's edge it is finished HTML. There is no rendering step left for the browser other than painting. Every Shopify merchant gets that starting position without doing anything.

The confusion comes from the fact that a server-rendered page can still behave like a client-rendered one. If your theme ships 900 KB of JavaScript that reflows the page after load, the HTML arrived fast and then got undone. That is a different problem from choosing a rendering model.

## Liquid: server rendered and edge cached

Liquid storefronts have two advantages that are difficult to beat.

The first is that Shopify does the rendering on hardware you do not pay for or maintain. The second, and the more important one, is [Shopify's edge cache](/insights/shopify-cdn-edge-caching). A cached Liquid page is served from a location near the shopper without touching an origin server at all. Time to First Byte on a warm cache hit is typically in the 50 to 200 ms range in our audit work. Nothing you build yourself will reliably beat that.

The trade-off is control. Liquid runs where Shopify runs it, with the data Shopify exposes.

### What breaks Liquid performance in practice

Liquid rarely fails on its own. It fails when other things sit on top of it:

- Third-party scripts loaded in the head, blocking the parse of HTML that was already fast.
- App blocks that render placeholder markup, then rewrite it with JavaScript after load, causing layout shift.
- Theme JavaScript that re-implements navigation on the client, discarding the server-rendered advantage on every page after the first.

If your Liquid store has poor Web Vitals, the rendering model is not the cause. Work through the [mobile speed fixes](/insights/shopify-mobile-speed-7-fixes) first.

## Hydrogen: server rendered, but you own the server

Hydrogen is Shopify's React framework for headless storefronts, and it is genuinely server rendered. React components execute on the server, HTML streams to the browser, and the client hydrates it into an interactive app.

That gives you real advantages. You can compose data from multiple sources, build interactions that Liquid struggles with, and stream content so the shopper sees the header and hero before slower parts of the page finish. It also moves responsibility onto you.

Hydrogen runs on Oxygen or another host, which means caching is now your job. A misconfigured Hydrogen deployment that renders every request fresh will have worse TTFB than the Liquid store it replaced, even though both are server rendered. We regularly see uncached headless builds land in the 400 to 900 ms TTFB range where the Liquid original sat comfortably under 200 ms.

Hydration is the other cost. The server sends fast HTML, then the client downloads and executes the React bundle to make it interactive. Between paint and hydration, the page looks ready but does not respond. That gap is exactly what Interaction to Next Paint measures, and it is why a heavy React storefront can score well on LCP and badly on INP. Check both against your [Core Web Vitals benchmarks](/insights/shopify-core-web-vitals-2026-benchmarks) rather than celebrating one metric.

Hydrogen is the right choice when you need what it offers. It is the wrong choice as a performance upgrade on its own.

## Client-only: the model to avoid

The third pattern is a storefront that ships a near-empty HTML document and builds everything in the browser. Sometimes that is a deliberate single-page-app build. More often it happens by accident, when a store adds enough client-rendered app widgets that the meaningful content ends up assembled in JavaScript.

```html
<!-- What the shopper's browser receives first -->
<div id="root"></div>
<script src="/bundle.js" defer></script>
```

Everything the shopper came for is behind that script tag. On a mid-range Android phone on a real mobile connection, that means download time, parse time, execution time, and a round trip for product data before the first pixel of content appears. Largest Contentful Paint on this model routinely lands past 4 seconds in our testing, which is a failing grade before you have touched a single image.

It is also the hardest model to repair. With a slow Liquid page you can defer a script. With a client-only page the content itself depends on the bundle, so there is nothing to defer. The fix is architectural.

The accidental version is more common and more fixable. If your product page renders server side but the price, reviews, and variant selector appear a second later, that is partial client rendering caused by apps. [Find which apps are responsible](/find-slow-shopify-apps) before blaming the theme.

## Choosing a model, and what to check either way

Stay on Liquid unless you have a specific requirement it cannot meet. It is server rendered, edge cached, and free of hydration cost. Move to Hydrogen when you need custom data composition or interactions Liquid cannot express, and go in knowing you have taken on caching and hydration as your problems. Never let a storefront drift into client-only rendering for content shoppers need to see.

Whichever model you run, verify the same three things. View source and confirm your product title and price are in the HTML, not injected later. Measure TTFB from a location far from your origin to check that caching is real. Then measure INP on a throttled mobile profile, because that is where hydration cost and app scripts show up.

Teams weighing a headless migration for speed reasons usually find the Liquid store was fine and the app stack was not. The team at [Defyn Digital](https://defyn.com.au) works through that measurement before recommending a replatform, because a rebuild that keeps the same JavaScript keeps the same problem.

## Common questions

### Is Shopify server side rendered by default?

Yes. Standard Shopify storefronts use Liquid templates that render on Shopify's servers, and the response is cached at the edge. The browser receives complete HTML containing your product content and can paint it immediately, with no JavaScript required for the content to appear. That is why most stores with poor Web Vitals have a JavaScript problem layered on top of good server rendering rather than a rendering problem.

### Is Hydrogen faster than Liquid?

Not automatically, and often not at all. Both are server rendered, so both send real HTML. Liquid gets Shopify's edge cache for free, while a Hydrogen storefront must be configured to cache properly or it renders every request fresh and posts worse Time to First Byte. Hydrogen also adds hydration, where the React bundle downloads and executes before the page becomes interactive, which can hurt Interaction to Next Paint. Choose Hydrogen for capability, not for speed.

### Why does my product page look slow even though the HTML is server rendered?

Because something is undoing the head start. The usual causes are render-blocking scripts in the head, app blocks that replace server-rendered markup after load, and theme JavaScript that re-renders sections on the client. The HTML arrived quickly and the browser then spent a second reworking it. Audit which scripts and apps run on that page, defer everything that does not affect the first screen, and re-measure before changing anything structural.

## Wrap-up

Your rendering model sets the boundaries of what your Core Web Vitals can be, and Shopify hands most merchants the best model available without asking. Liquid is server rendered and edge cached. Hydrogen is server rendered with caching and hydration as your responsibility. Client-only rendering is the one to avoid, whether you chose it or drifted into it. Before concluding that a replatform is the answer, confirm your content is in the HTML, confirm your cache is working, and confirm which apps add client-side work after paint. That last one is usually where the seconds hide.
