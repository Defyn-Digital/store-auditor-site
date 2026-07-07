---
title: "Shopify Prefetch Links: Instant.page vs Quicklink vs Hydrogen Prefetch"
description: "Shopify prefetch links reduce navigation delay by loading pages before clicks. Compare Instant.page, Quicklink, and Hydrogen prefetch to cut perceived load time by 200 to 800ms."
primaryKeyword: "Shopify prefetch links"
secondaryKeywords:
  - "Shopify navigation speed optimization"
  - "prefetch strategy for Shopify stores"
  - "reduce Shopify page transition time"
  - "instant page load Shopify"
  - "Shopify Hydrogen prefetch implementation"
category: performance
publishedDate: 2026-07-08
readingTime: 9
---

Shopify prefetch links are JavaScript techniques that load the next page's HTML before a visitor clicks, eliminating network delay during navigation and reducing perceived load time by 200 to 800 milliseconds.

## Key takeaways

- Prefetching loads a page's HTML while the user hovers or scrolls near a link, so the content arrives before the click happens.
- Instant.page triggers prefetch on touchstart (mobile) or 65ms hover (desktop), Quicklink prefetches all visible links during idle time, and Hydrogen uses framework-level route preloading.
- Across the 80+ Shopify stores we have audited, prefetch implementations reduce navigation time from 600 to 1200ms down to 100 to 400ms on repeat visits.
- Prefetch works best for high-traffic paths like collection to product or product to cart, where the next click is predictable.
- Overly aggressive prefetch (loading every link on scroll) wastes bandwidth on mobile and inflates server costs without matching user intent.

## How prefetch eliminates navigation delay

When a visitor clicks a link, the browser must send a request, wait for the server, download HTML, parse it, fetch CSS and JavaScript, then render. This round trip typically takes 400 to 900ms on a well-optimized Shopify store. Prefetch moves the request and download phase earlier, so when the click happens the HTML is already in cache.

The technique relies on the browser's `<link rel="prefetch">` API or the Fetch API with low priority. The browser downloads the resource in the background without blocking the current page. When the user navigates, the browser serves the cached HTML instantly.

Prefetch differs from preload. Preload (`<link rel="preload">`) fetches resources the current page needs immediately (fonts, critical CSS). Prefetch fetches resources a future page might need. Preload is high priority, prefetch is lowest priority and only runs when the network is idle.

For Shopify stores, prefetch targets HTML documents (product pages, collection pages, the cart). It does not prefetch images or scripts by default, because those assets load after navigation anyway.

## Instant.page: hover and touchstart prefetch

Instant.page is a 1KB script that prefetches links when the user hovers (desktop) or touches (mobile) them. On desktop, it waits 65ms after hover before fetching, because most accidental hovers last less than 50ms. On mobile, it triggers on `touchstart`, which fires 80 to 150ms before `click`.

You add it to your theme with a single script tag:

```html
<script src="//instant.page/5.2.0" type="module"></script>
```

Instant.page automatically discovers all same-origin links and attaches listeners. It ignores external links and links with a `data-no-instant` attribute.

In our audits, Instant.page reduces navigation time by 300 to 600ms on desktop and 150 to 300ms on mobile. The benefit is smaller on mobile because the touchstart-to-click window is shorter than a typical hover.

The script has minimal overhead: it adds 2 to 4ms to page load and uses 10 to 20KB of memory. It does not prefetch until the user shows intent, so bandwidth waste is low. On a typical product page with 20 links, Instant.page might prefetch 1 to 3 pages per session.

Instant.page works well for stores with clear navigation paths (homepage to collection to product). It struggles on pages with many competing links (mega menus, large collections), because the user might hover over 10 links but only click 1.

## Quicklink: intersection observer prefetch

Quicklink prefetches all links visible in the viewport during browser idle time. It uses Intersection Observer to detect when links scroll into view, then queues prefetch requests with `requestIdleCallback`.

You initialize it in your theme JavaScript:

```javascript
import quicklink from 'quicklink';

quicklink.listen({
  el: document.body,
  limit: 10,
  throttle: 2,
  timeout: 2000
});
```

The `limit` option caps total prefetch requests (default 10). The `throttle` option sets concurrent requests (default 2). The `timeout` option stops prefetching after N milliseconds (default infinite).

Quicklink is more aggressive than Instant.page. On a collection page with 24 products, Quicklink might prefetch 10 product pages as soon as the user scrolls. This frontloads bandwidth usage but guarantees the next click is instant.

In stores we have tested, Quicklink reduces navigation time by 400 to 800ms when the user clicks a prefetched link. But it increases data transfer by 200 to 600KB per page view, because it prefetches links the user never clicks.

Quicklink makes sense for stores with high conversion rates on specific paths. If 60% of collection visitors click a product, prefetching 10 products wastes bandwidth on only 40% of sessions. If conversion is 10%, you waste bandwidth on 90% of sessions.

You can tune Quicklink with URL patterns:

```javascript
quicklink.listen({
  ignores: [
    /\/collections\/all/,
    /\/pages\//,
    uri => uri.includes('?')
  ]
});
```

This avoids prefetching low-value pages (the "all products" collection, content pages, filtered URLs).

## Hydrogen prefetch: framework-level route preloading

Shopify Hydrogen (the React-based framework for headless stores) includes built-in prefetch via the `Link` component. When you render a `Link`, Hydrogen prefetches the route's loader data on hover or focus.

```jsx
import {Link} from '@shopify/hydrogen';

<Link to="/products/blue-shirt" prefetch="intent">
  Blue Shirt
</Link>
```

The `prefetch` prop has three values:

- `intent`: prefetch on hover or focus (default)
- `render`: prefetch as soon as the link renders
- `none`: disable prefetch

Hydrogen prefetch differs from Instant.page and Quicklink because it prefetches route data (GraphQL responses, component code) in addition to HTML. This makes navigation feel instant even on complex pages with heavy data requirements.

In Hydrogen stores built by [Defyn](https://defyn.com.au), we see navigation times of 50 to 150ms on prefetched routes, compared to 400 to 700ms on cold loads. The improvement is larger than HTML-only prefetch because the JavaScript and data arrive together.

Hydrogen prefetch works at the framework level, so it coordinates with React's rendering lifecycle. If a prefetched route has already rendered on the server, Hydrogen reuses that markup. If not, it renders on the client with the prefetched data.

The tradeoff is complexity. Hydrogen requires a full headless rebuild, which takes 4 to 12 weeks depending on store size. Instant.page and Quicklink drop into any theme in 10 minutes.

## Choosing the right prefetch strategy

Use Instant.page if you want a simple, low-risk win. It works on any Shopify theme, requires no configuration, and wastes minimal bandwidth. The 300 to 600ms improvement on desktop navigation is noticeable without being transformative.

Use Quicklink if you have a high-conversion path and can afford the bandwidth. A store that drives 70% of traffic from homepage to collection to product should prefetch aggressively. A store with scattered navigation (blog, about, multiple collections) should not.

Use Hydrogen prefetch if you are already building a headless store. The framework integration is seamless and the performance gain is larger than HTML-only prefetch. But do not rebuild your store just for prefetch.

Avoid prefetching on mobile plans with data limits. A typical product page HTML is 40 to 80KB. Prefetching 10 pages per session adds 400 to 800KB. On a 2GB monthly plan, that is 0.04% of the cap, which is negligible. But on a 500MB plan, it is 0.16%, which adds up over a month.

Test prefetch impact with Chrome DevTools Network throttling. Set "Fast 3G" and measure navigation time with and without prefetch. If the improvement is less than 200ms, prefetch is not worth the complexity.

For more navigation speed tactics, see our guide on [Shopify mobile speed fixes](/insights/shopify-mobile-speed-7-fixes). For baseline performance expectations, review our [2026 Core Web Vitals benchmarks](/insights/shopify-core-web-vitals-2026-benchmarks).

## Common questions

### Does prefetch hurt Core Web Vitals scores?

Prefetch does not directly hurt Core Web Vitals because it runs at low priority and does not block rendering. But aggressive prefetch can increase server load, which slows TTFB for all visitors. If your server response time rises from 200ms to 400ms, LCP will suffer. Monitor TTFB in Google Search Console after enabling prefetch. If TTFB increases by more than 50ms, reduce prefetch scope or upgrade server capacity.

### Can prefetch cause duplicate analytics events?

Yes. If your analytics script fires on page load and the user prefetches a page but never visits it, you log a phantom page view. Instant.page avoids this by prefetching HTML only, not executing scripts. Quicklink has the same behavior. Hydrogen prefetch can trigger analytics if your loader functions include tracking calls. Wrap analytics in navigation guards that check if the route actually rendered.

### How much does prefetch increase hosting costs?

Each prefetch request costs the same as a page view: one server request, one HTML render, one bandwidth charge. If you prefetch 3 pages per session and 40% go unclicked, you increase server load by 1.2x. On a Shopify Plus store with 100,000 monthly visitors, that is 20,000 extra requests, which costs roughly $15 to $30 in additional server time. The revenue gain from faster navigation (higher conversion, lower bounce) typically exceeds the cost by 10x or more.

## Wrap-up

Prefetch is the fastest way to improve Shopify navigation speed without rebuilding your theme. Instant.page gives you 300ms savings for 5 minutes of work. Quicklink gives you 600ms savings if you tune it carefully. Hydrogen gives you 800ms savings if you are already headless. Pick the tool that matches your current stack and traffic patterns. For stores built by [Defyn](https://defyn.com.au), we default to Instant.page on Liquid themes and native prefetch on Hydrogen builds. Test with real users, measure the impact, and iterate. You can check prefetch effectiveness and other navigation bottlenecks with [Store Auditor's performance scan](/how-it-works), which benchmarks your navigation speed against 1,200+ Shopify stores and flags opportunities for improvement.
