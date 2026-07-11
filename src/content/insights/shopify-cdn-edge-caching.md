---
title: "Shopify CDN Caching: How Edge Cache Works and What Breaks It"
description: "Shopify CDN caching delivers pages from 300+ edge locations, but apps and dynamic content often bypass the cache. Learn what invalidates edge cache and how to preserve fast delivery."
primaryKeyword: "Shopify CDN caching"
secondaryKeywords:
  - "Shopify edge cache invalidation"
  - "Fastly CDN Shopify performance"
  - "Shopify cache hit ratio"
  - "dynamic content breaks Shopify cache"
  - "Shopify CDN cache control headers"
category: performance
publishedDate: 2026-07-12
readingTime: 9
---

Shopify CDN caching is the system that stores copies of your store pages across 300+ Fastly edge locations worldwide, delivering content to customers from the nearest server instead of fetching it from origin on every request.

## Key takeaways

- Shopify uses Fastly's CDN to cache rendered HTML at edge locations, reducing origin server load and improving response times for repeat visitors.
- The edge cache automatically invalidates when you publish theme changes, update product data, or modify collections, forcing fresh renders from origin.
- Apps that inject dynamic content (cart counters, personalized recommendations, recently viewed items) often set cache-control headers that bypass edge caching entirely.
- A typical Shopify store sees cache hit ratios between 40% and 75%, with app-heavy stores landing at the lower end of that range.
- Preserving edge cache requires moving dynamic elements to client-side JavaScript that fetches data after the cached HTML loads.

## How Shopify's edge cache layer works

Shopify partners with Fastly to operate a global CDN with points of presence across North America, Europe, Asia, and Oceania. When a customer requests a product page, the CDN checks if it has a cached copy of that exact URL. If yes (a cache hit), Fastly serves the stored HTML without touching Shopify's origin servers. If no (a cache miss), Fastly fetches the page from origin, stores a copy, then serves it to the customer.

The cache key includes the full URL path and specific query parameters. A request for `/products/blue-widget` gets cached separately from `/products/blue-widget?variant=12345`. Shopify also factors in currency, language, and market parameters when multi-currency or Shopify Markets are active.

Cache duration varies by page type. Product pages, collection pages, and blog posts typically cache for several hours to days. The homepage often has a shorter cache lifetime because it changes more frequently. Cart pages and checkout never cache because they contain customer-specific data.

Across the 80+ stores we have audited at [Defyn](https://defyn.com.au), cache hit ratios range from 35% to 78%. Stores with fewer apps and less personalization land at the higher end. Stores with recommendation engines, dynamic pricing, or extensive app integrations see more cache bypasses.

### Cache control headers and origin decisions

Shopify's origin servers set `Cache-Control` headers that tell Fastly how long to store each response. A typical product page might return:

```
Cache-Control: public, max-age=3600, s-maxage=7200
```

The `s-maxage` directive applies to shared caches (the CDN), while `max-age` applies to browser caches. This example tells Fastly to cache for 2 hours and browsers to cache for 1 hour.

When Shopify serves a response with `Cache-Control: private` or `no-cache`, Fastly does not store it. This happens when the page contains customer-specific content or when an app explicitly requests no caching.

## What invalidates the edge cache

Shopify automatically purges cached pages when you make changes that affect rendered output. Publishing a theme update clears the entire cache for that theme. Updating a product title, price, or inventory triggers a purge for that product page and any collections containing that product.

Changing a collection's sort order or adding products to it invalidates the collection page cache. Modifying navigation menus purges pages that render those menus. Blog post edits clear the cache for that post and the blog index.

This automatic invalidation ensures customers never see stale data, but it also means frequent edits reduce cache effectiveness. A store that updates product prices hourly will have low cache hit ratios because pages constantly regenerate.

### App-triggered cache bypasses

Apps break caching in three common ways. First, apps that inject server-side content often set `Cache-Control: private` to prevent edge caching. A personalized recommendation app that renders different products for each customer cannot use shared caching without showing the wrong recommendations.

Second, apps that add query parameters create new cache keys. An app that appends `?customer_id=789` to every URL fragments the cache, storing separate copies for each customer. With 10,000 active customers, a single product page spawns 10,000 cache entries, most served once then evicted.

Third, apps that modify response headers can override Shopify's caching directives. An app that sets `Vary: Cookie` tells Fastly to cache separately for every unique cookie combination, effectively disabling shared caching.

We documented the performance impact of different app integration methods in [theme app extensions vs script tags](/insights/theme-app-extensions-vs-script-tags). Script tags that inject content server-side tend to break caching more aggressively than client-side extensions.

## Optimizing for edge cache hits

The most effective optimization is moving dynamic content to client-side rendering. Instead of generating personalized product recommendations on the server, serve a cached HTML shell and fetch recommendations via JavaScript after page load.

A typical pattern:

```liquid
<div id="recommendations" data-product-id="{{ product.id }}">
  <!-- Placeholder content or loading state -->
</div>

<script>
  fetch('/apps/recommendations?product_id=' + document.getElementById('recommendations').dataset.productId)
    .then(response => response.json())
    .then(data => {
      document.getElementById('recommendations').innerHTML = data.html;
    });
</script>
```

This approach lets Shopify cache the product page HTML while still delivering personalized content. The initial page load serves from edge cache (fast), then JavaScript fetches dynamic data (acceptable delay for secondary content).

### Reducing cache-busting query parameters

Audit your URL structure for unnecessary parameters. Marketing tracking parameters like `?utm_source=email` should not affect page content, but they create separate cache entries unless normalized.

Shopify automatically strips common tracking parameters before checking cache, but custom parameters from apps may not get normalized. An app that adds `?timestamp=1234567890` to every link will fragment your cache.

Work with app developers to move tracking data to cookies or localStorage instead of URL parameters. If parameters are necessary, ensure the app sets appropriate `Vary` headers so Fastly knows which parameters matter for caching.

### Monitoring cache performance

Shopify does not expose cache hit ratios in the admin, but you can infer cache behavior from response headers. The `CF-Cache-Status` header (Shopify uses Fastly, but the header name stuck from earlier CDN providers) indicates whether a request hit cache:

- `HIT`: Served from edge cache
- `MISS`: Fetched from origin, now cached
- `BYPASS`: Not cacheable, went straight to origin

Use browser dev tools to inspect response headers for key pages. If you see `BYPASS` frequently, investigate which apps or customizations are setting `Cache-Control: private`.

The impact on real-world performance shows up in Time to First Byte (TTFB). Cached responses typically return in 50 to 150ms. Origin responses take 300 to 800ms depending on page complexity. We covered TTFB optimization techniques in [Shopify mobile speed fixes](/insights/shopify-mobile-speed-7-fixes).

## Common questions

### How long does Shopify cache pages at the edge?

Cache duration varies by page type and content freshness. Product pages typically cache for 2 to 6 hours. Collection pages cache for 1 to 4 hours. The homepage often caches for 30 to 60 minutes because it changes more frequently. Shopify automatically purges cached pages when you update the underlying data, so actual cache lifetime depends on how often you edit products, collections, and theme files. A store that rarely changes content will see longer effective cache durations than a store with hourly updates.

### Can I manually purge Shopify's CDN cache?

Shopify does not provide a manual cache purge button in the admin. The system automatically invalidates cache when you make changes through the admin or API. If you need to force a cache refresh, publish a theme change (even a minor one like adding a space to a template comment) to clear the entire theme cache. For individual products, edit and save the product to purge that page. This limitation exists because Shopify manages cache invalidation automatically to prevent merchants from accidentally serving stale data.

### Why do some apps break edge caching?

Apps that generate customer-specific content (personalized recommendations, dynamic pricing, recently viewed items) cannot safely use shared edge caching because the CDN would serve one customer's personalized content to another customer. These apps set `Cache-Control: private` or `no-cache` headers to force every request to origin, where the app can generate unique content per customer. The performance tradeoff is necessary for correctness, but it means app-heavy stores see lower cache hit ratios and slower TTFB than stores with minimal dynamic content.

## Wrap-up

Shopify's edge cache delivers significant performance benefits when preserved, but apps and dynamic content frequently bypass caching to ensure correctness. The key to maintaining high cache hit ratios is moving personalization and dynamic elements to client-side JavaScript that fetches data after the cached HTML loads. Audit your response headers to identify cache bypasses, work with app developers to optimize integration methods, and minimize URL parameter fragmentation. For stores with complex app ecosystems, expect cache hit ratios between 40% and 60%, which still provides meaningful performance improvements over serving every request from origin.

Need to identify which apps are breaking your cache? [Store Auditor](/how-it-works) analyzes response headers and app integration patterns to show exactly what is bypassing edge cache and costing you performance.
