---
title: "Shopify Admin API Rate Limits: When a Greedy App Slows Your Store"
description: "Shopify Admin API rate limits keep your store stable, but apps that hit them constantly cause stale inventory and slow syncs. Learn how to spot and replace the offenders."
primaryKeyword: "Shopify Admin API rate limits"
secondaryKeywords:
  - "Shopify API throttling"
  - "Shopify GraphQL query cost limits"
  - "Shopify app API overload"
  - "Shopify REST leaky bucket"
  - "Shopify 429 rate limit error"
category: security
publishedDate: 2026-08-02
readingTime: 9
---

Shopify Admin API rate limits cap how fast an app can read and write your store data, and while those limits protect Shopify's platform, an app that keeps slamming into them leaves you with stale inventory, delayed order syncs, and automations that quietly fall behind.

## Key takeaways

- Every app that connects to your store gets its own rate limit budget, so a greedy app throttles itself, not other apps, but the symptoms still land on you as slow or stale data.
- The REST Admin API uses a leaky bucket model, while the GraphQL Admin API uses a calculated query cost, and both return clear throttling errors when an app goes too fast.
- Well-built apps use webhooks and bulk operations to stay well under the limit, while poorly built apps poll constantly and burn through their budget.
- The visible symptoms (inventory that lags, orders that import late, exports that stall) are your signal that an app is fighting the rate limit.
- Spotting the offender is an [app audit](/insights/audit-shopify-app-permissions) question: which app is doing the most work, and does it actually need to.

## How Shopify's Admin API rate limits work

Shopify does not let apps hammer the Admin API without limit, because uncapped access would destabilize the platform for everyone. Instead each app gets a budget, and the budget refills over time.

The REST Admin API uses a leaky bucket. Picture a bucket that holds a fixed number of requests and drains at a steady rate. On standard plans the bucket holds around 40 requests and drains at roughly 2 per second. Shopify Plus stores get a larger bucket and faster drain. An app can burst up to the bucket size, then must slow to the drain rate. Go over, and Shopify returns a 429 Too Many Requests response with a header telling the app how much budget is left.

The GraphQL Admin API works differently. Instead of counting requests, it counts the calculated cost of each query. Every field and connection has a cost, so a small query is cheap and a large one is expensive. You get a points budget that restores at a fixed rate per second. A query that asks for too much at once, or too many queries in a row, exhausts the points and returns a THROTTLED error, again with the current cost status attached.

The key detail most merchants miss: these budgets are per app, per store. Each app authenticates with its own access token and gets its own bucket. That means one badly behaved app cannot directly throttle another app's API calls. What it can do is throttle itself into slow, stale, unreliable behavior, and that is the part you feel.

## What a rate-limited app does to your store

When an app constantly hits its limit, its work backs up. The consequences look like store problems, not app problems, which is why they are easy to misdiagnose.

Inventory sync is the most common casualty. An app that manages stock across channels needs to push updates quickly. If it is throttled, updates queue. You sell an item that a marketplace already sold, or your storefront shows out of stock for something you have. The data is not wrong because Shopify is slow. It is wrong because the app cannot push updates fast enough within its budget.

Order sync suffers the same way. A fulfillment or accounting app that pulls new orders can fall minutes or hours behind during busy periods, exactly when timing matters most. Bulk actions, like exporting thousands of products or updating prices across a catalog, stall partway or take far longer than they should.

Automations and background jobs degrade quietly. A workflow that should run in seconds runs in minutes. A nightly export finishes at noon. Nobody gets an error, so nobody investigates, and the store just feels sluggish and unreliable in ways that are hard to pin down.

None of this means the API is broken. It means an app is doing more work than its budget allows, usually because it was built to poll aggressively rather than to work efficiently.

## Polling versus webhooks: the engineering that matters

The difference between an app that respects the rate limit and one that fights it usually comes down to a single design choice: polling versus webhooks.

A polling app asks Shopify over and over: any new orders yet? Any changes? Every check is an API call, and most checks find nothing. Multiply that by a short interval and the app burns its budget doing nothing useful. Under load, it throttles.

A webhook-driven app does the opposite. It tells Shopify: notify me when an order is created, when inventory changes, when a product updates. Shopify pushes the event to the app the moment it happens. No wasted calls, no constant polling, and the app stays far under its limit while reacting faster. This is why webhook design also matters for trust and integrity, which is why you [verify webhook authenticity with HMAC](/insights/shopify-webhook-security-hmac).

Well-engineered apps also use the GraphQL bulk operation API for large jobs instead of thousands of individual calls, and they back off gracefully when they do get throttled instead of retrying in a tight loop. When you evaluate an app, these are the behaviors that separate a reliable integration from one that will lag the moment your store gets busy.

## How to spot the app that is overloading the API

You cannot see another app's rate limit budget directly, but the symptoms point you to the culprit. Start with the behavior, then narrow to the app.

Watch for lag in a specific function. If inventory is stale, look at your inventory app. If orders import late, look at your fulfillment or accounting integration. The delayed function usually maps to one app. Check that app's own logs or status page, because many surface throttling or sync-delay warnings that merchants never open.

Look at how many apps touch the same data. If three apps all sync inventory, they each run their own polling and their own API load, and conflicts and lag multiply. Consolidating overlapping apps often fixes the symptom faster than tuning any single one.

Treat aggressive API use as an app-quality signal. An app that constantly throttles itself, polls instead of using webhooks, or requests far broader access than its job needs is telling you something about how it was built. That is exactly the lens of an [app permission and behavior audit](/insights/audit-shopify-app-permissions): what is this app doing, how much work is it creating, and do you still need it. When you [scan your store with Store Auditor](/how-it-works), you get a clear inventory of the apps loading on your store, which makes it far easier to connect a lagging function to the app behind it.

## What to do once you find it

Once you know which app is straining the API, you have a short list of options, from least to most disruptive.

First, contact the vendor. A reputable app developer will know whether your store is hitting limits and may have a higher tier, a webhook mode, or a fix. Sometimes the throttling is a configuration you can change, like reducing a sync frequency you never needed set that high.

Second, remove overlap. If two apps do the same job, keep the better one and uninstall the other. Every app you remove frees its share of complexity and API load and reduces the surface you have to trust.

Third, replace a chronically throttled app. If an app polls aggressively, cannot keep up, and the vendor has no answer, it is a reliability risk. Move to an alternative that uses webhooks and bulk operations. Your data will be fresher and your store will feel faster. For merchants who would rather have this handled, the team at [Defyn](https://defyn.com.au) reviews app integrations as part of a store audit, flags the ones creating excessive load, and recommends leaner replacements.

## Common questions

### Do Shopify API rate limits slow down my whole store?

Not directly, and not for shoppers browsing your storefront. Rate limits apply to apps talking to the Admin API, and each app has its own budget, so one app hitting its limit does not throttle another app or your storefront. What it does slow is that app's own work: inventory updates, order syncs, exports, and automations back up. The result feels like a slow, unreliable store even though the storefront and Shopify itself are fine. Fixing it means fixing or replacing the specific app that keeps hitting its limit.

### What causes a 429 error from the Shopify Admin API?

A 429 Too Many Requests error means an app sent more REST API calls than its leaky-bucket budget allows and needs to slow down. It is almost always a sign that the app is making calls faster than the drain rate, usually because it polls aggressively instead of using webhooks. On the GraphQL API the equivalent is a THROTTLED error, which means the app asked for more query cost than its points budget allows. Both are the app's responsibility to handle by backing off, but if it happens constantly, the app is poorly built for your store's volume.

### How do I know which app is using the most API calls?

Shopify does not show you a simple per-app API usage dashboard, so you work backward from symptoms. Find the store function that lags (stale inventory, late orders, slow exports) and it usually maps to one app. Check that app's own logs or status page for throttling warnings. Reduce overlap where several apps do the same job. A store audit that inventories every app loading on your store makes this much faster, because it turns a vague slow store feeling into a specific list of apps you can evaluate one by one.

## Wrap-up

Shopify Admin API rate limits exist to keep the platform stable, and they do their job. The problem is not the limits, it is apps that were built to fight them. A greedy, poll-heavy app throttles itself into stale inventory, late orders, and sluggish automations, and because Shopify never errors on your storefront, the cause stays hidden. The fix is to treat heavy API use as an app-quality signal: find the lagging function, trace it to the app, and choose webhook-driven, efficient integrations over ones that hammer the API. Fewer, leaner apps mean fresher data and a store that feels fast. Start by [auditing what is actually running](/insights/audit-shopify-app-permissions) so you know which apps are doing the work, and whether they still deserve the access.
