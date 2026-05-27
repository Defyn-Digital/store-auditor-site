---
title: "How to identify malicious or compromised Shopify apps"
description: "Most Shopify apps are legitimate, but some are designed to steal data, inject affiliate links, or compromise your storefront. Here's the diagnostic checklist."
primaryKeyword: "malicious Shopify apps"
secondaryKeywords:
  - "Shopify app security risk"
  - "compromised Shopify app"
  - "Shopify app scam"
  - "Shopify app malware"
category: security
publishedDate: 2026-05-27
readingTime: 7
---

The Shopify App Store has a review process, but it's not infallible. Apps occasionally get through with hidden behavior, become compromised after launch, or evolve over time into something the merchant didn't sign up for. The result can range from minor (unwanted affiliate links injected into your storefront) to severe (customer data exfiltration).

This piece is the diagnostic checklist. The specific behaviors to watch for, the tools that surface them, and the response playbook when you find one.

## The categories of malicious behavior

Most app-level security incidents fall into one of four categories.

**1. Data exfiltration.** The app holds customer scopes (read_customers, read_orders) and silently sends data to a server outside the developer's official infrastructure. Often hard to detect from inside the app's admin UI.

**2. Affiliate injection.** The app modifies your storefront's outbound links to include the developer's affiliate codes, capturing commission on sales they had no role in driving.

**3. Crypto mining or ad injection.** The app injects JavaScript that runs cryptocurrency mining on your shoppers' browsers, or replaces your store's ads with the developer's ads.

**4. Backdoor access.** The app installs persistent code that survives uninstall, leaving a way for the developer to access your storefront after you think you've removed them.

The first two are the most common. The latter two are rarer but more severe.

## How to spot suspicious behavior

Eight signals worth checking, in roughly the order an audit would surface them.

### 1. Scopes that don't match the app's stated purpose

A "shipping calculator" doesn't need `read_customers`. A "review widget" doesn't need `write_orders`. If an app's OAuth scopes are dramatically broader than its functionality, that's a flag.

This is the start of every audit. See our [permission audit guide](/insights/audit-shopify-app-permissions) for the workflow.

### 2. Unfamiliar script hosts in your storefront HTML

Every script tag on your storefront should be traceable to a known app or service. If you see hosts you don't recognize, especially ones that aren't named in any of your installed apps' privacy policies, that's worth investigating.

[Store Auditor's audit](https://apps.shopify.com/store-auditor) lists every script host detected on your storefront and tries to attribute each one to a specific installed app. Scripts that can't be attributed get flagged as "unattributed third-party." Those are the ones to investigate manually.

### 3. Outbound network requests to suspicious domains

Open your storefront in Chrome incognito, open DevTools, switch to the Network tab. Filter to "Fetch/XHR." Reload the page. Look at the request URLs.

Each outbound request should go to a domain you can trace to a known app. Requests to domains that don't match any installed app, especially domains you've never heard of, deserve investigation. Common red flags:

- Domains hosting in countries that don't match your apps' stated locations.
- Domains using IP-based hosting rather than named CDNs.
- Hosts with random-looking subdomains (likely command-and-control patterns).

### 4. Affiliate-style URL parameters on your own links

Some malicious apps modify your storefront to add affiliate parameters to outbound links. The pattern usually looks like a query string parameter like `?ref=appname` or `?aff_id=XXXXX` appended to links the merchant didn't put there.

Check your storefront's "About us" page, blog posts, and social media links. If links to your social media or to third-party sites have query parameters you didn't add, that's a flag.

### 5. Unexpected admin order modifications

If an app has `write_orders` and you start seeing orders that have been modified in ways you didn't initiate, that's a major incident. Document the changes, screenshot the order timeline (Shopify logs admin actions in the Order Risk Analysis), and contact Shopify support immediately.

### 6. App removed from the Shopify App Store

If you check the App Store listing for an app you have installed and find it has been removed from the store, that's almost always Shopify having pulled it for policy violations. The app may still be running on your storefront. Uninstall immediately and audit your store for residual behavior.

### 7. Developer support disappears

Reputable Shopify app developers respond to support requests within days. If a developer goes silent for weeks, especially after a security concern has been raised, that's a flag. Combined with any of the above signals, it's grounds for uninstallation.

### 8. Customer reviews suddenly turn

If the recent reviews of an app on the App Store are dramatically more negative than the older reviews, and the new reviews mention security or data concerns, take it seriously. Reviews are a real-time signal.

## What to do when you find one

The response playbook, in order.

**1. Document.** Screenshot the suspicious behavior. Save the network requests. Note the timeline of when you first installed and when you noticed the issue.

**2. Uninstall.** From Shopify admin, Apps page, uninstall the app. Shopify will revoke its OAuth tokens, so the app can no longer make API calls.

**3. Check for persistence.** After uninstall, audit your storefront's HTML for any residual script tags or theme code modifications. Some apps leave code behind even after uninstall.

**4. Rotate any potentially-exposed credentials.** If the app had access to customer data, evaluate whether your customer data needs to be considered "exposed." If the app had access to admin tokens or other secrets, rotate them.

**5. Submit a Shopify support ticket.** Report the specific behavior, attach your documentation. Shopify's Trust team investigates these and removes confirmed bad actors from the App Store. Your report helps protect other merchants.

**6. Notify customers if a breach is confirmed.** If customer data was exfiltrated, your jurisdiction's breach notification laws kick in. See our [GDPR / CCPA compliance guide](/insights/shopify-customer-data-gdpr-compliance) for what that involves.

## Reducing future risk

Three habits cut your malicious-app risk meaningfully.

**1. Install fewer apps.** Each additional app is an additional risk surface. If you can build something natively in your theme or via a Shopify Function, that's usually safer than installing a third-party app.

**2. Stick to established developers.** Apps with multi-year development history, large install counts, and active update cadences are dramatically lower-risk than brand-new apps. The newer the app and the broader its scopes, the more carefully you should audit.

**3. Run periodic audits.** A quarterly review of what's installed, what scopes each app holds, and what scripts are loading on your storefront catches drift before it becomes a problem.

[Store Auditor](https://apps.shopify.com/store-auditor) automates step 3. The scan flags unattributed scripts (potential malicious behavior) and shows you which apps are still injecting code even if you don't recognize them. It's a performance audit primarily, but the same data set is useful for security review.

For agency-grade security work, [Defyn Digital](https://defyn.com.au) runs Shopify security audits as a separate engagement. We built Store Auditor out of the same workflow, and the two services often run alongside each other for clients who want both performance and security reviewed.

## Related reading

- [How to audit Shopify app permissions](/insights/audit-shopify-app-permissions)
- [Customer data security: GDPR and CCPA compliance](/insights/shopify-customer-data-gdpr-compliance)
- [Shopify webhook security: HMAC verification](/insights/shopify-webhook-security-hmac)
