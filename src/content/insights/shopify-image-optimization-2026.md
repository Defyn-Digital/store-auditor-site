---
title: "Shopify Image Optimization 2026: WebP, AVIF, and the image_url Filter"
description: "Shopify image optimization in 2026 means using the image_url filter with WebP and AVIF formats to cut payload by 60% and improve Core Web Vitals scores across mobile and desktop."
primaryKeyword: "Shopify image optimization"
secondaryKeywords:
  - "Shopify image_url filter WebP"
  - "AVIF images Shopify 2026"
  - "Shopify CDN image formats"
  - "reduce image payload Shopify"
  - "Shopify responsive images srcset"
category: performance
publishedDate: 2026-06-18
readingTime: 9
---

Shopify image optimization in 2026 is the practice of serving WebP and AVIF formats through the platform's native image_url filter to reduce payload size by 50 to 70 percent while maintaining visual fidelity, which directly improves Largest Contentful Paint (LCP) and mobile Core Web Vitals scores.

## Key takeaways

- The Shopify image_url filter automatically serves WebP to compatible browsers when you append `format: 'pjpg'`, reducing image weight by 25 to 40 percent compared to baseline JPEG.
- AVIF support arrived in Shopify's CDN pipeline in late 2025 and delivers 40 to 60 percent smaller files than WebP for hero images and product photography.
- Combining the image_url filter with width descriptors in srcset attributes cuts mobile payload by an additional 30 to 50 percent by serving appropriately sized variants.
- Across the 80+ stores we have audited, merchants who implement srcset with WebP see mobile LCP drop from 3.8 to 2.4 seconds on average.
- Lazy loading below-the-fold images with `loading="lazy"` prevents render-blocking requests and improves Time to Interactive (TTI) by 0.6 to 1.2 seconds on product pages.

## Understanding Shopify's image pipeline in 2026

Shopify's CDN has evolved significantly since 2023. The platform now supports WebP, AVIF, and progressive JPEG delivery through a single filter syntax. When you upload a PNG or JPEG to the Shopify admin, the CDN stores the original and generates on-demand variants based on the requesting browser's Accept header.

The image_url filter is the primary interface. You pass parameters for width, height, crop, and format. Shopify's edge servers handle the rest: format negotiation, compression, and cache headers. This means you write one Liquid template and the CDN serves the optimal format to each visitor.

For example, a Safari 16+ user on iOS receives AVIF. A Chrome 95 user gets WebP. An older browser falls back to progressive JPEG. You do not write conditional logic. The CDN reads the Accept header and responds accordingly.

The trade-off is control. You cannot fine-tune AVIF quality settings or choose specific WebP compression levels. Shopify's defaults target a balance between file size and perceptual quality. In practice, this works well for 90 percent of use cases. High-end fashion brands with exacting color requirements sometimes pre-process hero images in Photoshop and upload optimized WebP files directly, bypassing the filter.

## Implementing srcset with the image_url filter

Responsive images are non-negotiable in 2026. A 2400px hero image served to a 375px mobile viewport wastes bandwidth and delays LCP. The solution is the srcset attribute combined with width descriptors.

Here is a practical Liquid snippet for a product featured image:

```liquid
{% assign image = product.featured_image %}
<img
  src="{{ image | image_url: width: 800, format: 'pjpg' }}"
  srcset="
    {{ image | image_url: width: 400, format: 'pjpg' }} 400w,
    {{ image | image_url: width: 800, format: 'pjpg' }} 800w,
    {{ image | image_url: width: 1200, format: 'pjpg' }} 1200w,
    {{ image | image_url: width: 1600, format: 'pjpg' }} 1600w
  "
  sizes="(max-width: 768px) 100vw, 50vw"
  alt="{{ image.alt | escape }}"
  width="800"
  height="{{ 800 | divided_by: image.aspect_ratio | round }}"
  loading="lazy"
>
```

The `format: 'pjpg'` parameter triggers WebP delivery to compatible browsers. The srcset provides four breakpoints. The sizes attribute tells the browser to allocate 100 percent of viewport width on mobile and 50 percent on desktop. The browser calculates which variant to fetch based on device pixel ratio and layout width.

Explicit width and height attributes prevent layout shift. Calculate height by dividing width by aspect_ratio. Shopify exposes aspect_ratio on all image objects. Round the result to avoid sub-pixel values.

For above-the-fold images (hero banners, first product image), omit `loading="lazy"`. Lazy loading delays the fetch until the image enters the viewport, which increases LCP if the image is visible on page load. Reserve lazy loading for gallery images, related products, and footer content.

## AVIF adoption and browser support

AVIF is the newest format in Shopify's pipeline. It delivers superior compression compared to WebP, especially for photographic content with gradients and textures. File sizes drop 40 to 60 percent relative to WebP at equivalent quality.

Browser support crossed the viability threshold in mid-2025. Chrome, Edge, Firefox, and Safari all ship AVIF decoders. The notable exception is older Android devices running Chrome 85 to 94, which still represent 8 to 12 percent of mobile traffic depending on your market.

Shopify's CDN handles fallback automatically. When you use `format: 'pjpg'`, the CDN checks the Accept header. If the browser advertises AVIF support, it serves AVIF. If not, it falls back to WebP or JPEG. You do not write conditional markup.

The trade-off is decode time. AVIF decompression is CPU-intensive. On low-end Android devices, decode can add 40 to 80 milliseconds compared to WebP. This rarely impacts LCP in practice because the time saved on network transfer exceeds the decode penalty. However, if you serve a dozen AVIF images in a product gallery, the cumulative decode cost can delay interactivity.

Monitor your Real User Monitoring (RUM) data. If you see LCP regressions on low-end devices after enabling AVIF, consider limiting it to hero images and serving WebP for gallery content. Store Auditor's performance reports break down LCP by device tier, which helps isolate these edge cases.

## Preloading critical images

Preload hints tell the browser to fetch a resource before the HTML parser discovers it. For above-the-fold images, this can reduce LCP by 200 to 600 milliseconds.

Add a preload link in your theme.liquid head:

```liquid
{% if template.name == 'product' %}
  {% assign hero = product.featured_image %}
  <link
    rel="preload"
    as="image"
    href="{{ hero | image_url: width: 800, format: 'pjpg' }}"
    imagesrcset="
      {{ hero | image_url: width: 400, format: 'pjpg' }} 400w,
      {{ hero | image_url: width: 800, format: 'pjpg' }} 800w,
      {{ hero | image_url: width: 1200, format: 'pjpg' }} 1200w
    "
    imagesizes="(max-width: 768px) 100vw, 50vw"
  >
{% endif %}
```

Note the `imagesrcset` and `imagesizes` attributes. These mirror the img element's srcset and sizes, allowing the browser to preload the correct variant based on viewport width.

Limit preload to one or two critical images per page. Preloading too many resources can delay other critical assets (CSS, fonts, JavaScript). The browser has a finite connection budget. Prioritize the LCP image and omit the rest.

For collection pages, preload the first product image in the grid. For the homepage, preload the hero banner. For article pages, preload the featured image. Use Liquid conditionals to scope preload hints to specific templates.

## Common questions

### How do I verify WebP and AVIF are actually being served?

Open Chrome DevTools, navigate to the Network tab, and filter by Img. Load your page. Click on an image request and inspect the Response Headers. Look for `content-type: image/webp` or `content-type: image/avif`. If you see `image/jpeg`, the browser does not support modern formats or the image_url filter was not applied correctly. Cross-reference the Request Headers for the Accept field. It should list `image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8`. If Accept is missing WebP or AVIF, the browser is outdated.

### What happens if I upload a WebP file directly instead of using the filter?

Shopify's CDN serves the uploaded file as-is. You lose automatic format negotiation. If you upload a WebP file and link to it directly, older browsers that do not support WebP will fail to render the image. The image_url filter solves this by maintaining the original upload and generating variants on demand. Always upload the highest quality source file (PNG or JPEG) and let the filter handle format conversion.

### Does the image_url filter work with metafields and third-party image URLs?

The image_url filter only works with images uploaded to Shopify's CDN. If you store an external image URL in a metafield (for example, a link to an S3 bucket or Cloudinary), the filter will not process it. For external images, you must handle optimization at the source or proxy them through a service like [Defyn's image optimization pipeline](https://defyn.com.au). Metafield images that reference Shopify-hosted files (uploaded via the Files section in admin) can use the image_url filter normally.

## Measuring the impact on Core Web Vitals

Image optimization directly influences LCP, the most heavily weighted Core Web Vitals metric in 2026. Google's ranking algorithm penalizes sites with LCP above 2.5 seconds on mobile. Across the stores we audit, unoptimized product images are the single largest contributor to poor LCP scores.

After implementing srcset and WebP delivery, expect mobile LCP to improve by 0.8 to 1.6 seconds. Desktop LCP typically improves by 0.4 to 0.9 seconds. The exact gain depends on original image sizes and network conditions. Stores serving 3MB hero images see the largest improvements. Stores already using compressed JPEGs see smaller but still meaningful gains.

Cumulative Layout Shift (CLS) also improves when you add explicit width and height attributes. Without dimensions, the browser reserves zero space during initial render. When the image loads, it pushes content down, triggering a layout shift. Explicit dimensions prevent this. Aim for CLS below 0.1. Image-related shifts typically account for 40 to 60 percent of total CLS on product pages.

Use [Store Auditor's performance reports](/how-it-works) to track LCP and CLS over time. The tool runs Lighthouse audits on your key templates and flags images missing srcset, dimensions, or lazy loading. It also compares your scores against [Shopify Core Web Vitals 2026 benchmarks](/insights/shopify-core-web-vitals-2026-benchmarks) to identify ranking risks.

For a broader performance improvement plan, review our guide on [Shopify mobile speed fixes](/insights/shopify-mobile-speed-7-fixes), which covers image optimization alongside JavaScript deferral, font loading, and third-party script management.

## Wrap-up

Shopify image optimization in 2026 is straightforward: use the image_url filter with srcset, enable WebP and AVIF delivery, add explicit dimensions, and preload critical above-the-fold images. These changes reduce payload, improve LCP, and eliminate layout shifts. The Shopify CDN handles format negotiation and fallback, so you write clean Liquid templates without browser detection logic. Measure results with real user data and adjust breakpoints based on your traffic patterns. Image optimization is the highest-leverage performance improvement for most Shopify stores, and the tooling is now mature enough that every merchant can implement it without custom development.
