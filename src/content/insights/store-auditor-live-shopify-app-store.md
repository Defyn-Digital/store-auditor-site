---
title: "Store Auditor is live on the Shopify App Store"
description: "Store Auditor is approved and available in the Shopify App Store. Here is what it does, how the per-app attribution works, and how to run your first audit free."
primaryKeyword: "Store Auditor Shopify app"
secondaryKeywords:
  - "Shopify performance audit app"
  - "Shopify app store launch"
  - "per-app performance attribution"
  - "Shopify speed audit tool"
category: general
publishedDate: 2026-05-27
readingTime: 5
---

Store Auditor is now approved and live in the Shopify App Store. You can [install it free today](https://apps.shopify.com/store-auditor). This post explains what it does, why we built it, and how to get your first audit in about 90 seconds.

## What Store Auditor does

Every Shopify app you install adds scripts to your storefront. Marketing apps add tracking pixels. Review apps add widgets. Chat apps add scripts. Page builders add layout JavaScript. Individually each one feels small. Stacked together they bury your storefront under seconds of blocking time on mobile, which is exactly where most of your traffic and most of your bounces live.

The existing performance tools tell you that "third-party scripts are slow". True, but not actionable. You still do not know which of your 12 installed apps is the actual offender. Store Auditor closes that gap. It runs a real Google Lighthouse scan against your live storefront, then attributes each blocking script to the specific named app that loaded it. Klaviyo, Judge.me, Google Analytics, Tidio, whatever is actually on your store, ranked by impact.

## Why named attribution matters

"Reduce third-party scripts" is not a fix. "Defer the Klaviyo onsite-tracking script, lazy-load the Judge.me review widget, and move GA4 to Shopify Web Pixels" is a fix. The difference is whether a merchant can actually do something with the report or has to forward it to a developer who forwards it back with questions.

Store Auditor produces the second kind of report. Each recommendation names the exact app, the proposed change, the blocking time it removes, and the severity. You can work the list yourself or hand it to a developer with zero ambiguity. If you want the full picture of how the scan and the attribution work, the [methodology page](/how-it-works) walks through all four layers.

## How to run your first audit

1. [Install Store Auditor](https://apps.shopify.com/store-auditor) from the Shopify App Store. The Free plan needs no credit card.
2. Open the app and press Run scan. We hit your homepage, product, collection, and cart pages with Lighthouse on both mobile and desktop.
3. Read the ranked list of apps, each with its blocking time and a specific fix.
4. Apply the top recommendation, then re-scan to verify the gain.

The whole first pass takes about 90 seconds. The Free plan covers one audit a month on your homepage, which is enough to see the named-attribution difference for yourself. [Pro and Plus](/pricing) add unlimited scans across every page, mobile and desktop, with the full ranked recommendation list and scan history.

## What is read-only, and what we never touch

Store Auditor is read-only on your store. It uses Shopify's read scopes to inspect your themes, script tags, and products, and it runs Lighthouse against your public storefront the same way Google's PageSpeed Insights does. It never writes to your theme, products, or orders. It does not read customer personal data. On uninstall, all stored scan data is deleted within 48 hours via Shopify's redact webhook.

If you want to dig into the security model in more depth, we have written about [Shopify app permissions and scopes](/insights/audit-shopify-app-permissions) and [how we keep customer data compliant](/insights/shopify-customer-data-gdpr-compliance).

## A note on where this came from

Store Auditor was built by [Defyn Digital](https://defyn.com.au), a Sydney-based Shopify development agency. We built it because we kept running the same per-app performance profiling by hand for our agency clients, and there was no tool that mapped the cost back to specific named apps. So we made one. Now it is yours too.

[Install Store Auditor free on the Shopify App Store](https://apps.shopify.com/store-auditor) and run your first audit today.
