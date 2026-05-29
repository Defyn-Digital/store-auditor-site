---
title: "The 7-point Shopify app install checklist for merchants"
description: "A 7-point Shopify app install checklist to catch risky scopes, slow scripts, and unclear data handling before they touch your storefront."
primaryKeyword: "Shopify app install checklist"
secondaryKeywords:
  - "vet Shopify app before install"
  - "Shopify app due diligence"
  - "Shopify app review process"
  - "Shopify app risk assessment"
category: security
publishedDate: 2026-05-28
readingTime: 8
---

Every Shopify app you install can read data, write data, slow your storefront, or all three. Most merchants click "Install" without checking any of that. This is the 7-point checklist to run before you do.

Five minutes here saves hours of cleanup later. We use this exact flow with our agency clients at [Defyn Digital](https://defyn.com.au), and it catches problems no app-store review process is set up to catch.

## 1. Read the OAuth scope screen before clicking install

The OAuth consent screen that appears right before install is the only legally binding moment where Shopify tells you what an app is asking for. Read it. Specifically look for:

- **Write scopes on data you do not expect.** A review widget should not need `write_products`. A theme app should not need `write_orders`. A loyalty app probably does not need `read_customers` to function, even if it claims to.
- **Protected customer data scopes.** These are flagged separately by Shopify. Apps requesting `customer_read_customers` or any "Level 2" scope must have a clearly documented use case. If the listing does not explain why, that is a flag.
- **Storefront API access.** This grants public-data read access from any origin. Some apps need it, many do not. If unclear, ask the vendor before installing.

Our detailed walkthrough on [how to audit the permissions your Shopify apps have](/insights/audit-shopify-app-permissions) covers every scope and what each one practically lets an app do.

## 2. Check the developer's track record

Open the app's App Store listing in a new tab and look at three things:

1. **Years in the App Store.** Apps under 6 months old have far less review surface than apps with 2+ years of merchant feedback. Not disqualifying, just a different risk profile.
2. **Review distribution, not average.** A 4.8 average from 12 reviews is noisier than a 4.5 average from 1,200 reviews. Look at recent 1 and 2 star reviews. The complaints that repeat across multiple merchants are the ones to take seriously.
3. **The "Other apps by this developer" section.** Solo apps from a developer with no other listings are higher risk than apps from a publisher with a portfolio. Not always, but often.

If the developer's contact page is missing, the support email bounces, or the privacy policy is a generic template, treat that as a flag. Legitimate Shopify app publishers invest in those pages.

## 3. Look up the app's performance footprint

Before installing, search the App Store reviews for the words "slow", "speed", "lighthouse", and "performance". If multiple merchants report storefront speed regressions, you will not be the exception.

Apps add weight in three ways:

- **Script tags injected into your theme.** Easy to see, easy to remove if needed.
- **Theme App Extension blocks.** Harder to detect without inspecting your theme's `app-embed` settings.
- **Storefront fetches from app-owned domains.** Not visible in your theme at all. Only a Lighthouse trace will show them.

Tools like [Store Auditor](/how-it-works) attribute the blocking time each installed app contributes back to its named app, so you can see the speed cost of any single addition. If you are evaluating an app you have not yet installed, the closest signal is the developer's own claims about performance budget and any third-party Lighthouse reports they publish.

## 4. Confirm uninstall behavior

Apps are required by Shopify to clean up after uninstall, but not every app does it cleanly. Before installing, check the app's listing or developer docs for:

- **Whether the app removes its script tags on uninstall.** Most do, some do not.
- **Whether the app removes Theme App Extension blocks from your theme.** Many do not. You will need to do this manually.
- **Whether the app holds any data after uninstall.** This is governed by the `shop/redact` webhook and is supposed to happen 48 hours after uninstall.

Apps that explicitly document their uninstall behavior are higher-trust by default. Apps that say nothing about it should make you assume the worst.

## 5. Verify GDPR webhook handling for PII apps

Any app that touches customer data is required to implement three GDPR webhooks: `customers/data_request`, `customers/redact`, and `shop/redact`. The app cannot pass Shopify's review without implementing them, but implementation quality varies.

Practical check: look for the words "GDPR", "CCPA", "data deletion", or "customer data rights" in the app's privacy policy. If the policy is silent on how customer data deletion is honored, do not install the app on a store that handles EU or California traffic.

## 6. Check the pricing model for surprise charges

Read the pricing tab carefully. Specifically:

- **Usage-based fees.** Some apps bill per email sent, per scan run, per SMS delivered, or per product synced. The visible monthly fee is sometimes only the floor.
- **Trial-to-paid conversion.** If the free trial requires a credit card, the app charges automatically when the trial ends. If it does not, you have to opt in. Both are normal, but they are different commitments.
- **Plan tier locks.** Some apps gate the actual useful features behind their highest tier. The advertised entry tier is often a teaser.

This is not a security risk in the technical sense, but a surprise $400 charge from an app you installed three months ago and forgot about is its own kind of harm.

## 7. Run a pre-install Lighthouse baseline

Before you install, run a Lighthouse scan on your homepage, product page, and cart page. Save the scores. After install, re-run them. The difference is the app's real performance cost on your store, regardless of what the listing claims.

A few rules of thumb from our audit work:

- A pure script-tag analytics app typically costs 50 to 200 ms of total blocking time on mobile.
- A review widget app typically costs 200 to 600 ms depending on lazy-load behavior.
- A page builder or layout app can cost 800 ms or more, especially if it ships unused CSS or its own layout JS.

If your score drops more than you are willing to accept, you have data to decide whether the app is worth its cost, or whether to ask the developer for a leaner config. [Defyn Digital](https://defyn.com.au) runs this pre/post comparison routinely for clients and it almost always changes the install decision.

## What to do if an app fails the checklist

If an app fails one item on this list, ask the developer about it before installing. If it fails two or more, look for an alternative. The Shopify ecosystem has redundancy. Almost every category has 3 to 5 viable competitors. You are not stuck with any single choice.

If you have already installed something that fails the checklist in hindsight, our piece on [how to identify malicious or compromised Shopify apps](/insights/identify-malicious-shopify-apps) walks through the diagnostic process.

The shorter version of the whole checklist: be slightly skeptical of every install, read the scope screen, and measure performance before and after. Five minutes of friction here saves entire weekends of cleanup later.
