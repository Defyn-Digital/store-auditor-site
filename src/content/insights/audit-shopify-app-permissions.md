---
title: "How to audit the permissions your Shopify apps have"
description: "Every Shopify app asks for OAuth scopes when installed. Here's how to review what each app can actually do on your store, and how to revoke excessive access."
primaryKeyword: "Shopify app permissions audit"
secondaryKeywords:
  - "Shopify OAuth scopes"
  - "review Shopify app access"
  - "revoke Shopify app permissions"
  - "Shopify app security"
category: security
publishedDate: 2026-05-25
readingTime: 7
---

When you install a Shopify app, you grant it OAuth scopes. These are specific permissions like "read products" or "write orders" that let the app do its job. Most merchants click "Install" without reading the scopes, then never revisit them.

This piece is the practical workflow for auditing what permissions each of your installed apps actually holds, what those scopes can do, and how to revoke access without breaking apps that legitimately need it.

## Why this audit matters

Three reasons.

**Risk surface area.** Every app with `write_orders` can modify orders. If that app is compromised, an attacker can modify your orders. Most stores don't need that scope granted to anything but their order management system.

**Data exposure.** Apps with `read_customers` can read your customer database. If a marketing app developer suffers a data breach, your customer list is in that breach. The fewer apps that hold sensitive customer scopes, the smaller your exposure.

**Compliance.** GDPR, CCPA, and Australia's Privacy Act all require you to know what third parties hold your customer data. If you can't list which Shopify apps have access to customer records, you can't honestly comply.

## How to view current app permissions

Shopify makes this surprisingly hard to do at scale. There's no single dashboard that lists all apps with all scopes. The cleanest path is the admin Apps page, which shows installed apps but not their specific scopes.

To see actual scopes:

1. In Shopify admin, navigate to Settings, then Apps and sales channels.
2. Click an installed app.
3. The app's detail page shows the high-level permissions ("can manage your products", etc).
4. For the full scope list, look in the app's privacy policy or contact the app developer.

This is genuinely friction, which is part of why most merchants don't do it.

A faster approach is to query Shopify's Admin API directly. The [InstalledApps query](https://shopify.dev/docs/api/admin-graphql) returns the access scopes for each installed app. If you're technical or have a Shopify developer working with you, this is a 10-minute task.

## The high-risk scopes to watch for

Not every scope is equally sensitive. These are the ones that matter most for audit purposes.

| Scope | What it allows | Should rarely be granted to |
|---|---|---|
| `write_orders` | Modify order details, including totals and customer info | Marketing apps, analytics apps, anything not in your fulfillment stack |
| `read_customers` | Read full customer database including PII | Apps that don't need to personalize email/marketing |
| `write_customers` | Modify customer records | Anything except your CRM and email tools |
| `write_products` | Create, edit, delete products | Apps that don't manage your catalog |
| `read_orders` | Read full order history | Most marketing apps don't need this |
| `write_themes` | Modify your live theme code | Apps that don't manage theme content |
| `write_script_tags` | Inject scripts on every storefront page | Now mostly obsolete; should be Web Pixels instead |

If you see `write_orders` granted to a marketing app or `write_themes` granted to an analytics app, that's a flag worth investigating.

## What to do when you find excessive permissions

Three options, in order of preference.

**1. Uninstall.** If the app does something the store can live without, uninstall. The fastest fix is always removal.

**2. Contact the developer.** Some apps request broad scopes early in their development and never narrow them down. Email the developer and ask if a narrower scope set would work for your use case. Reputable developers will engage; less reputable ones will go silent.

**3. Sandbox via a custom Shopify environment.** For apps you need but don't fully trust, run them in a development store and verify their behavior before installing on your live store.

## A simple monthly habit

Most merchants benefit from a 15-minute monthly check.

1. Open Shopify admin, Apps page.
2. Sort by "last opened" (some Shopify admin views support this; others require manual sort).
3. Any app you haven't opened in 60 days that holds sensitive scopes is a candidate for uninstallation.
4. For active apps, check their privacy policy once a quarter to confirm their data handling hasn't changed.

Apps that haven't been updated by the developer in 12+ months and hold sensitive scopes are particularly high-risk. They're unlikely to receive security patches if a vulnerability is discovered.

## How Store Auditor relates to permission audits

[Store Auditor](https://apps.shopify.com/store-auditor) is a performance audit tool, not a permission audit tool. But there's significant overlap. The apps that load heavy scripts on your storefront are often the same apps holding broad scopes.

Our scan uses the minimum read-only scopes needed to do its job (`read_themes`, `read_script_tags`, `read_products`, `read_analytics`, `read_reports`). We never request write access of any kind. If an audit tool asks for write scopes, that's a flag.

If you're running a permission audit and you find apps you can't justify keeping, [Store Auditor](https://apps.shopify.com/store-auditor) will also show their performance impact, which usually makes the uninstall decision easier.

## Tools and services

For larger merchants who want a more systematic approach, [Defyn Digital](https://defyn.com.au) provides Shopify security audits that include permission inventory, third-party risk assessment, and recommendations for tightening scopes across your app stack. We built Store Auditor out of our agency workflow, and the security audit work is a separate service we offer.

For solo merchants and small teams, the monthly habit above is usually enough. The point isn't to be paranoid, it's to know which apps hold which keys to your shop.

## Related reading

- [Shopify webhook security: HMAC verification](/insights/shopify-webhook-security-hmac)
- [How to find slow Shopify apps](/find-slow-shopify-apps)
- [How Store Auditor's audit methodology works](/how-it-works)
