---
title: "Shopify Lazy Load Images: Why loading='lazy' Breaks Your LCP Score"
description: "Shopify lazy load images incorrectly and your LCP tanks. Learn the above-fold rule that keeps hero images fast while deferring everything else for better Core Web Vitals."
primaryKeyword: "Shopify lazy load images"
secondaryKeywords:
  - "Shopify hero image loading"
  - "LCP optimization Shopify"
  - "above-fold image loading"
  - "Shopify image performance best practices"
  - "lazy loading attribute Shopify"
category: performance
publishedDate: 2026-07-04
readingTime: 9
---

Shopify lazy load images breaks your Largest Contentful Paint score when you apply the `loading='lazy'` attribute to hero images or other above-fold content, causing browsers to delay fetching the most important visual element until after layout calculations complete.

## Key takeaways

- The `loading='lazy'` attribute tells browsers to defer image fetching until the image enters the viewport, which adds 400 to 800 milliseconds of delay for above-fold content.
- Hero images and any content visible without scrolling must use `loading='eager'` or omit the loading attribute entirely to load immediately during page parse.
- Shopify's default image snippets often apply lazy loading indiscriminately, requiring theme code edits to exclude above-fold images from lazy loading logic.
- Stores that fix hero image lazy loading typically see LCP improvements of 0.6 to 1.2 seconds, moving scores from poor (above 2.5s) to good (under 2.5s) range.
- The correct pattern is eager loading for the first 1 to 3 images (hero, logo, first product card), then lazy loading for everything below the fold.

## How lazy loading works in browsers

The HTML `loading` attribute accepts three values: `lazy`, `eager`, and `auto`. When you set `loading='lazy'`, the browser adds the image to a deferred fetch queue. It waits until layout calculations determine the image is within a threshold distance from the viewport (typically 1250 to 3000 pixels depending on connection speed and browser heuristics) before initiating the network request.

This behavior saves bandwidth and reduces server load for long pages with dozens of images. Users scrolling through a product collection page only download images as they approach them, not all at once on page load.

The problem emerges when developers apply lazy loading to images that appear immediately on screen. The browser must first parse HTML, build the DOM, calculate layout positions, determine viewport boundaries, check each lazy image's position, then finally start fetching images that meet the threshold. This multi-step process adds 400 to 800 milliseconds compared to immediate fetching during HTML parse.

For hero images (the large banner image at the top of most Shopify homepages), this delay directly impacts LCP. The hero is usually the largest visual element, so any delay in loading it becomes your LCP time. Across the 80+ Shopify stores we have audited at [Defyn](https://defyn.com.au), hero image lazy loading consistently adds 0.8 to 1.4 seconds to mobile LCP scores.

## The above-fold rule for Shopify images

The above-fold rule is simple: any image visible without scrolling must load eagerly, everything else loads lazily.

On a typical Shopify homepage, above-fold content includes:

- Hero or banner image (usually 1 image, sometimes 2 to 3 in a slideshow)
- Site logo in the header
- First product card or featured collection image if it appears in the initial viewport

On product pages:

- Main product image (the first image in the gallery)
- Site logo
- Sometimes the first thumbnail if your layout shows thumbnails above the fold

On collection pages:

- Banner image if present
- Site logo
- First 2 to 4 product card images depending on grid layout and screen size

Everything below this threshold gets `loading='lazy'`. Product images further down the page, footer images, trust badges below the fold, related product images, all benefit from deferred loading.

The viewport height varies by device. Mobile viewports are typically 667 to 932 pixels tall. Desktop viewports range from 768 to 1080 pixels. Your above-fold image count should match the smallest common viewport for your traffic. If 60% of your traffic is mobile, optimize for mobile viewport height.

## Finding lazy loading in Shopify theme code

Shopify themes implement image rendering through Liquid snippets, usually named `image.liquid`, `responsive-image.liquid`, or similar. These snippets accept parameters and output `<img>` tags with appropriate attributes.

Search your theme code for files containing `loading=` or `loading:`. Common locations:

- `snippets/image.liquid`
- `snippets/responsive-image.liquid`  
- `sections/image-banner.liquid`
- `sections/hero.liquid`

A typical problematic snippet looks like this:

```liquid
<img
  src="{{ image | image_url: width: 1920 }}"
  alt="{{ image.alt }}"
  loading="lazy"
  width="{{ image.width }}"
  height="{{ image.height }}"
>
```

The `loading="lazy"` is hardcoded. Every image using this snippet loads lazily, including heroes.

Better snippets accept a loading parameter:

```liquid
<img
  src="{{ image | image_url: width: 1920 }}"
  alt="{{ image.alt }}"
  loading="{{ loading | default: 'lazy' }}"
  width="{{ image.width }}"
  height="{{ image.height }}"
>
```

This defaults to lazy but allows overrides. When rendering a hero, you pass `loading: 'eager'`:

```liquid
{% render 'image', image: section.settings.hero_image, loading: 'eager' %}
```

Some themes use conditional logic:

```liquid
{% if section.index == 1 %}
  <img loading="eager" ...>
{% else %}
  <img loading="lazy" ...>
{% endif %}
```

This loads the first section's images eagerly, assuming the first section is above-fold. This works for standard homepages but breaks if merchants reorder sections or use a non-image first section.

## Implementation steps for Shopify stores

Start by identifying your above-fold images. Load your homepage on a mobile device (or use Chrome DevTools device emulation at 375×667). Note which images appear without scrolling. Repeat for product and collection pages.

Edit your theme's image snippet to accept a loading parameter if it doesn't already. The pattern shown above (defaulting to lazy with override capability) works for most themes.

Find sections that render above-fold images. Common sections:

- `sections/image-banner.liquid` (homepage hero)
- `sections/slideshow.liquid` (hero carousels)  
- `sections/header.liquid` (logo)
- `sections/main-product.liquid` (main product image)
- `sections/main-collection-banner.liquid` (collection hero)

In each section's Liquid code, locate the image render call and add `loading: 'eager'`:

```liquid
{%- render 'image',
    image: section.settings.image,
    loading: 'eager',
    sizes: '100vw'
-%}
```

For product cards in collection grids, eager-load only the first row. If your grid shows 2 products per row on mobile, eager-load the first 2. If it shows 3 on desktop, consider device-specific logic or accept that desktop loads 1 extra image eagerly (negligible impact).

Test changes with Lighthouse in Chrome DevTools. Run 3 to 5 mobile audits and average the LCP scores. Compare before and after. You should see 0.6 to 1.2 second improvements if hero lazy loading was your primary issue.

For more context on mobile performance fixes, see our guide on [Shopify mobile speed fixes](/insights/shopify-mobile-speed-7-fixes). For LCP benchmarks across Shopify stores, check our [2026 Core Web Vitals benchmarks](/insights/shopify-core-web-vitals-2026-benchmarks).

## Fetchpriority and preload for critical images

Beyond removing lazy loading, you can further optimize hero images with `fetchpriority='high'` and preload hints.

The `fetchpriority` attribute tells browsers to prioritize this resource over others during the fetch phase. Add it to your hero image:

```liquid
<img
  src="{{ image | image_url: width: 1920 }}"
  loading="eager"
  fetchpriority="high"
  ...>
```

This ensures the hero image request happens early in the network waterfall, competing with CSS and JavaScript for bandwidth priority.

Preload hints go in the `<head>` section and tell browsers to fetch resources before the parser encounters them in the body:

```liquid
<link
  rel="preload"
  as="image"
  href="{{ section.settings.hero_image | image_url: width: 1920 }}"
  imagesrcset="
    {{ section.settings.hero_image | image_url: width: 375 }} 375w,
    {{ section.settings.hero_image | image_url: width: 750 }} 750w,
    {{ section.settings.hero_image | image_url: width: 1920 }} 1920w
  "
  imagesizes="100vw"
>
```

Preload is powerful but risky. Preloading too many resources wastes bandwidth on items that might not render (carousel images that never show, product images below the fold). Limit preload to the single most critical image: your hero.

Combining `loading='eager'`, `fetchpriority='high'`, and a preload hint typically shaves an additional 200 to 400 milliseconds off LCP compared to eager loading alone. Across audits we run at [Defyn](https://defyn.com.au), stores using all three techniques on hero images achieve mobile LCP scores between 1.8 and 2.3 seconds, while stores using only eager loading land between 2.1 and 2.6 seconds.

## Common questions

### How many images should load eagerly on a Shopify homepage?

Load 1 to 3 images eagerly on most Shopify homepages: the hero banner, the site logo, and possibly the first featured product image if it appears in the initial mobile viewport. Loading more than 3 images eagerly wastes bandwidth on content users might not see, while loading fewer risks delaying your LCP element. Count images visible at 375×667 mobile viewport size to determine your exact number.

### Does lazy loading affect SEO or Google rankings?

Lazy loading does not directly affect SEO crawling because Googlebot renders JavaScript and waits for lazy images to load. However, lazy loading on above-fold images degrades Core Web Vitals scores (specifically LCP), and Google uses Core Web Vitals as a ranking factor. Stores with poor LCP scores (above 2.5 seconds) may rank lower than competitors with good scores (under 2.5 seconds), all else equal. Fix hero lazy loading to improve both user experience and search rankings.

### Can I use JavaScript lazy loading libraries instead of the loading attribute?

JavaScript lazy loading libraries (like lazysizes or lozad) add more overhead than the native `loading='lazy'` attribute because they require downloading, parsing, and executing JavaScript before any lazy loading logic runs. This adds 100 to 300 milliseconds compared to native lazy loading. Modern browsers support the native loading attribute (95%+ coverage as of 2026), so JavaScript libraries are unnecessary for new Shopify stores. If you already use a JavaScript library, migrate to native lazy loading for better performance.

## Wrap-up

Shopify lazy load images correctly by applying the above-fold rule: eager loading for hero images and content visible without scrolling, lazy loading for everything else. This single change improves LCP by 0.6 to 1.2 seconds on most stores, moving scores from poor to good range. Edit your theme's image snippets to accept loading parameters, then pass `loading: 'eager'` to hero sections. Test with Lighthouse and verify LCP improvements. For stores needing deeper performance analysis, [Store Auditor](/how-it-works) identifies all lazy loading issues and provides fix priorities based on actual LCP impact.
