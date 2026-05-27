---
title: "Theme App Extensions vs script tags: which Shopify install method is faster?"
description: "Theme App Extensions and ScriptTag are the two ways apps inject code into your storefront. The performance differences are real but often misunderstood."
primaryKeyword: "Shopify Theme App Extensions"
secondaryKeywords:
  - "Shopify ScriptTag"
  - "Theme App Extension performance"
  - "Shopify app installation methods"
  - "Shopify app blocks"
category: performance
publishedDate: 2026-05-27
readingTime: 7
---

Shopify apps inject code into your storefront in one of two ways. Theme App Extensions (TAE blocks) or ScriptTag API. Both have been around for years, but they have meaningfully different performance characteristics, and most merchants don't know which method their installed apps are using.

This piece explains the difference, shows how to identify which method each of your apps uses, and explains why the choice matters for your storefront speed.

## What each method does

**Theme App Extensions (TAE)** are a newer mechanism (released 2021, expanded since). Apps that use TAE register blocks that merchants can add to their theme through the theme editor. The block's code runs as a Liquid include, server-rendered into the page HTML, with associated JavaScript and CSS loaded by the theme.

**ScriptTag** is the legacy mechanism. Apps register a script URL with Shopify via the ScriptTag API, and Shopify auto-injects a `<script>` tag into every storefront page. The script runs entirely client-side after the page loads.

You can verify which method an app uses by checking your theme editor (TAE blocks appear in the Apps section of each section) and by inspecting your storefront's HTML for unexpected `<script>` tags.

## The performance differences

| Property | Theme App Extensions | ScriptTag |
|---|---|---|
| Loaded on | Pages where the merchant places the block | Every storefront page |
| Server-rendered HTML | Yes, via Liquid | No, JavaScript-injected |
| Bundling control | Merchant can defer / lazy-load via section settings | Merchant has no control |
| Removal on uninstall | Block disappears with app uninstall | Script auto-removes |
| Visibility in theme code | Yes, visible in theme editor | No, invisible until you read network requests |
| Below-fold by default | Often yes (section ordering) | Always above-fold by load order |

In practice, TAE blocks tend to perform better because:

1. They render server-side, so the initial HTML is complete and the LCP element doesn't depend on client JavaScript.
2. They're constrained to specific sections, so they don't bloat pages where they're not needed.
3. Merchants can rearrange them in the theme editor to push them below the fold.

ScriptTag scripts run on every page regardless of relevance. A ScriptTag installed by a "shipping rates calculator" runs on your collection pages, blog posts, and product pages where it has no business being.

## How to identify which method each app uses

Three ways to check.

**1. Theme editor.** Open your live theme in the customizer. Click any section. Scroll the section settings panel to the bottom. The "Apps" group shows TAE blocks active for that section. If an app appears here, it's using Theme App Extensions for at least part of its functionality.

**2. Browser dev tools.** Open your storefront in Chrome incognito, open DevTools, switch to the Network tab, filter to JavaScript. Reload the page. Look at the Initiator column for each script. Scripts initiated by `theme.liquid` or section files are TAE-loaded. Scripts initiated by Shopify's own script loader (look for a host like `cdn.shopify.com/s/files/...` followed by a Shopify-internal script) are usually ScriptTag-loaded.

**3. Store Auditor.** Our [audit tool](https://apps.shopify.com/store-auditor) shows the installation method for each detected app, so you can see at a glance which apps are using which mechanism.

## When ScriptTag is appropriate

There are legitimate uses for ScriptTag. A shop-wide analytics pixel that needs to capture pageviews on every page is genuinely a global concern. So is fraud detection.

What's NOT a legitimate ScriptTag use case:

- Review widgets that only render on product pages (should be TAE)
- Cart widgets (Shopify provides cart events and a cart UI extension API)
- Search overlays (use a search-specific app block)
- Subscription buttons (use the subscriptions API)
- Most marketing automation (use Web Pixels)

If you find apps using ScriptTag for something that should be TAE, contact the app developer. Many established apps have migrated to TAE in the past two years but didn't auto-migrate existing customers.

## How to migrate apps from ScriptTag to TAE

You typically can't do this yourself. The app developer has to publish a TAE block and provide an upgrade path. Some app developers do this automatically (uninstalling the old ScriptTag when you enable their TAE block). Others require manual intervention.

If you have an app whose ScriptTag is heavy and you want to push for a TAE version:

1. Check the app's documentation or release notes for "Theme App Extension" mentions.
2. If a TAE version exists, follow their migration guide. The pattern is usually: install the TAE block in your theme editor, then remove the legacy script tag from `theme.liquid` (if it was added there).
3. If a TAE version doesn't exist yet, you can ask the developer directly. Apps in active development often have a TAE version in the roadmap.
4. If the developer has abandoned the app or refuses to migrate, evaluate whether the app is still worth running. Old ScriptTag-only apps are typically the slowest scripts on stores we audit.

## What this means in practice

The fastest Shopify stores we audit through [Store Auditor](/how-it-works) have:

- 0 ScriptTag installations
- All marketing tracking running via Shopify Web Pixels
- Review widgets, recently-viewed, and other widgets running as TAE blocks below the fold
- A short list of installed apps, each providing measurable value

The slowest stores tend to have 10+ ScriptTag installations, often from apps the merchant uninstalled from the admin but whose ScriptTags weren't cleaned up by the app on uninstall. (This shouldn't happen, but in our audit data it absolutely does.)

If your Store Auditor scan shows "phantom" scripts loading from apps you don't recognize, those are almost always abandoned ScriptTags from old uninstalls. Contact Shopify support or use the [ScriptTag API](https://shopify.dev/docs/api/admin-rest/2024-01/resources/scripttag) directly to clean them up.

## How agencies handle this

At [Defyn Digital](https://defyn.com.au), the team behind Store Auditor, our standard performance engagement starts with a script tag audit, then a TAE block audit. The two together give you a complete picture of what code is running on your storefront and why.

If you want to do this yourself, the [Store Auditor app](https://apps.shopify.com/store-auditor) provides the same audit automatically and points at which apps are TAE vs. ScriptTag.

## Related reading

- [Shopify mobile speed: 7 tactical fixes that move LCP](/insights/shopify-mobile-speed-7-fixes)
- [How to find which Shopify apps are slowing your store](/find-slow-shopify-apps)
- [How Store Auditor's audit methodology works](/how-it-works)
