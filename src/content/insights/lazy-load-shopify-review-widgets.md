---
title: "How to lazy-load Shopify review widgets without breaking them"
description: "Judge.me, Yotpo, Loox, and Stamped all ship widgets that load above the fold by default. Here's the Intersection Observer pattern that defers them safely."
primaryKeyword: "lazy load Shopify review widgets"
secondaryKeywords:
  - "Judge.me performance"
  - "Yotpo Shopify speed"
  - "Loox lazy load"
  - "Shopify review app performance"
category: performance
publishedDate: 2026-05-27
readingTime: 6
---

Product review widgets are one of the most common Shopify app categories, and one of the most common Core Web Vitals offenders. The problem is structural. A review widget needs to render below the product description, but the JavaScript that powers it typically loads on page-ready, blocking the main thread for 200-400ms before the shopper even scrolls.

The fix is to lazy-load the widget, only initializing it when the shopper is about to see it. This piece walks through the Intersection Observer pattern, app-specific notes for the four most popular review apps on Shopify, and what to test after you ship the change.

## Why this matters

Review widgets routinely show up in [Store Auditor's per-app audit](/how-it-works) as high-severity offenders. The reason is hidden in plain sight. The widget visually appears below the product description, but the script that builds it runs eagerly. Hundreds of milliseconds of main-thread work for content the shopper hasn't even scrolled to yet.

For mobile shoppers especially, this kills INP (Interaction to Next Paint). The "add to cart" button feels frozen because the browser is busy parsing review JavaScript instead of responding to taps.

## The Intersection Observer pattern

Here's the pattern that works for any review widget. The script only loads when the user scrolls within 200 pixels of the widget container.

```html
<div id="review-widget-mount"></div>

<script>
  const target = document.getElementById('review-widget-mount');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Load the review app's script tag here
          const script = document.createElement('script');
          script.src = 'https://cdn.example.com/reviews.js';
          script.async = true;
          document.head.appendChild(script);
          observer.disconnect();
        }
      });
    },
    { rootMargin: '200px' }
  );
  observer.observe(target);
</script>
```

The `rootMargin: '200px'` means the script starts loading when the widget is 200 pixels below the viewport, so by the time the shopper scrolls to it, the widget is ready. Adjust this value based on how fast your shoppers scroll. For mobile-heavy stores, 400px gives a smoother experience.

## App-specific implementations

### Judge.me

Judge.me's default install adds an inline script to your theme. Find the snippet that includes `judgeme.io/static/widget` and wrap its execution.

The cleanest approach is to use Judge.me's Theme App Extension blocks but defer the initialization. In the block settings, look for "Load behavior" and set it to "Lazy" if available. If the option isn't visible in your version, fall back to the Intersection Observer pattern above, pointing at `judgeme.io/static/widget`.

After deferring, [Store Auditor](https://apps.shopify.com/store-auditor) will typically show Judge.me's blocking time drop from 360ms to under 80ms.

### Yotpo

Yotpo's main widget script is `https://staticw2.yotpo.com/...`. Yotpo officially supports lazy initialization through their Settings page. Navigate to General Settings, Display, and toggle on "Lazy load main widget."

If you also use Yotpo's review carousel or visual UGC, those need separate lazy treatment. Wrap each carousel in its own Intersection Observer or use Yotpo's "delay widget initialization" option in the carousel-specific settings.

### Loox

Loox is generally the lightest of the four by default, but its photo grid can be heavy. Loox provides a "Performance Mode" toggle in their settings. Enable it. This switches the photo grid to lazy initialization automatically.

For the inline review stars on product cards (collection page), Loox uses a separate script that runs on page-ready. There's no built-in toggle for this. If you need to defer it, you'll need to override the inline tag with the Intersection Observer pattern.

### Stamped

Stamped's widget loads via `https://cdn.stamped.io/...`. Their app provides a "Defer widget loading" option under Settings, Widget. Toggle it on. For Stamped's full-page review browser (a separate widget), the lazy option is in the page-specific block settings.

## What to test after deploying

The risk with lazy loading is that the widget fails to render at all, or renders too late, or breaks on slow connections. Test these four scenarios.

**1. Scroll-through render.** On a slow 3G throttle in Chrome DevTools, scroll to the widget normally. It should render within 1-2 seconds of becoming visible.

**2. Jump-to-anchor.** If your URL includes `#reviews` (link from email campaigns), the page jumps directly to the widget on load. The Intersection Observer fires immediately, but make sure the script has time to download. Test this scenario specifically.

**3. Server-rendered SEO content.** Make sure the structured-data JSON-LD for reviews is server-rendered, not generated by the widget JavaScript. Google reads the JSON-LD before any JavaScript runs. If your reviews schema only appears after the widget initializes, you lose review snippets in search results.

**4. Re-audit.** Run a [Store Auditor scan](https://apps.shopify.com/store-auditor) before and after. You should see the review app's blocking time drop. If it doesn't, the widget is loading from a different script you missed.

## What this typically gets you

Across the 47 stores we audited recently, lazy-loading review widgets reduced mobile blocking time by 200-400ms on product pages. Combined with [migrating Klaviyo to Web Pixels](/insights/klaviyo-vs-web-pixels-performance), this is the single most common pair of fixes that moves a Shopify store from a failing Core Web Vitals score to a passing one.

The whole exercise typically takes 30-45 minutes once you know which review app is the offender. The diagnostic is the hardest part, which is why we built [Store Auditor](/how-it-works) to do it automatically.

For agency-level Shopify performance work, [Defyn Digital](https://defyn.com.au) handles this kind of optimization for clients regularly. We built Store Auditor out of our agency workflow, so the methodology you see in the app is the same one we apply to client storefronts.

## Related reading

- [Shopify Core Web Vitals: 2026 benchmarks](/insights/shopify-core-web-vitals-2026-benchmarks)
- [Klaviyo vs Web Pixels: which is faster](/insights/klaviyo-vs-web-pixels-performance)
- [How to find which Shopify apps are slowing your store](/find-slow-shopify-apps)
