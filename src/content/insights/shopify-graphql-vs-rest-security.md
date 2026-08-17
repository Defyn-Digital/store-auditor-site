---
title: "Shopify GraphQL Security: How It Differs From the REST Admin API"
description: "Shopify GraphQL security compared to the REST Admin API across scopes, throttling, bulk operations, and error handling, so you know what changes when an app migrates."
primaryKeyword: "Shopify GraphQL security"
secondaryKeywords:
  - "Shopify GraphQL vs REST Admin API"
  - "Shopify Admin API access scopes"
  - "Shopify GraphQL query cost throttling"
  - "Shopify bulk operation security"
  - "Shopify protected customer data GraphQL"
category: security
publishedDate: 2026-08-17
readingTime: 8
---

Shopify has pointed all new app development at the GraphQL Admin API, and the security model that comes with it is similar to REST in the places that matter most and quietly different in the places that catch people out.

## Key takeaways

- Access scopes work identically in both APIs. The same OAuth token, the same scope strings, the same enforcement. GraphQL does not grant an app anything REST would have refused.
- The difference is precision. REST returns whole resource objects, so an app reading one field also receives everything else on that record. GraphQL returns only the fields the app asked for.
- Throttling models differ. REST counts requests, GraphQL counts calculated query cost, so a single GraphQL call can exhaust a budget that a hundred small REST calls would not.
- GraphQL adds surface REST does not have: bulk operation result files, query cost as a resource to abuse, and richer error responses.
- Neither API protects you from an app that holds more scopes than it needs, which is still an [app permissions audit](/insights/audit-shopify-app-permissions) question rather than an API question.

## The scope model is the same, the blast radius is not

The most common misconception is that migrating an app to GraphQL changes what it can reach. It does not. Both Admin APIs authenticate with the same access token, that token carries the same granted scopes, and Shopify enforces those scopes at the same layer. An app without `read_customers` cannot read customers through GraphQL any more than it could through REST. Protected Customer Data approval works the same way too: fields covered by it stay unavailable until Shopify approves the app for that level, and in GraphQL the refusal arrives per field rather than per endpoint.

What changes is how much data crosses the wire for a given task. A REST call to fetch an order returns the whole order object. If the app only wanted the fulfillment status, it still received the shipping address, the customer email, the line items, and the notes. That data then sits in the app's logs, its cache, and possibly its error tracker.

GraphQL makes the request explicit:

```graphql
query {
  order(id: "gid://shopify/Order/1234567890") {
    displayFulfillmentStatus
  }
}
```

One field asked for, one field returned. The scope still allows more, but nothing else leaves Shopify. In audit work we regularly find app logs holding customer PII the app never needed, purely because a REST endpoint returned it by default. Field-level selection does not fix a badly scoped app, but it removes the accidental copies.

## Throttling works differently, and that changes the failure mode

REST uses a leaky bucket. A store gets a bucket of roughly 40 requests that drains at about 2 per second on standard plans, with more headroom on Plus. Go over and Shopify returns 429 with the remaining budget in a header. The limit is a count, so predicting it is easy.

GraphQL charges by calculated cost instead. Every field and connection carries a cost, the app spends from a points budget, and the budget restores at a fixed rate each second. A deeply nested query pulling connections inside connections can be expensive enough to throttle on its own, while thousands of tiny queries barely register. The throttled response is a `THROTTLED` error with the current cost status attached, and every successful response carries the cost of the query that produced it:

```json
{
  "extensions": {
    "cost": {
      "requestedQueryCost": 302,
      "actualQueryCost": 21,
      "throttleStatus": {
        "currentlyAvailable": 979,
        "restoreRate": 50
      }
    }
  }
}
```

This matters for security because throttling is a data-integrity failure mode, not just a performance one. When an app gets throttled mid-operation, its retry behavior determines whether your data ends up consistent. A well-built app reads `currentlyAvailable`, backs off, and resumes. A poorly built one retries in a tight loop, burns the budget faster, and abandons the job halfway, leaving a partial inventory sync or a half-written set of metafields. The merchant-visible symptoms are covered in [Admin API rate limits](/insights/shopify-admin-api-rate-limits), and the GraphQL version is harder to spot because one expensive query can trigger it with no obvious burst of traffic.

## Where GraphQL adds surface REST does not have

Three areas deserve attention when an app moves to GraphQL.

### Bulk operation result files

Large jobs in GraphQL run through bulk operations. The app submits a query, Shopify runs it in the background, and the result lands in a JSONL file the app downloads from a generated URL. That URL is unguessable and expires after roughly a week, but while it lives it is fetchable by anyone holding it, no token required. If an app logs that URL, emails it, or pastes it into a support ticket, the contents are exposed to whoever sees it. A bulk export of your customers is exactly the kind of file you do not want behind a link authenticated only by being secret. Ask vendors whether bulk result URLs are treated as credentials.

### Query cost as something to abuse

Because cost scales with query shape, a GraphQL endpoint is a natural target for expensive-query pressure. Shopify's Admin API defends itself with the cost cap, so an attacker cannot use your store's API to exhaust Shopify. The risk lands on the app instead. An app that accepts customer input and turns it into a GraphQL query without bounding depth or page size can be pushed into repeatedly throttling itself, which for you looks like an integration that stops working during your busiest hour.

### Errors that say more

GraphQL error responses are more descriptive than REST status codes by design, which is helpful in development and unhelpful when those errors reach a customer-facing surface. Field names, type names, and access denials leak structure about how the app is built. Errors belong in the app's own logging, not in a storefront response or a browser console.

None of these replace the fundamentals. Webhook payloads still need [HMAC verification](/insights/shopify-webhook-security-hmac) regardless of which API the app was built on, because a webhook is an inbound request from the internet and the API model has nothing to do with proving it came from Shopify.

## What this means when you are choosing apps

You cannot read an app's source code, so judge it on what is visible.

Start with scopes at install. An app that requests `read_customers` and `write_orders` to display a shipping badge is over-scoped no matter how carefully it queries. GraphQL does not soften that, and revoking is easier before install than after. The [permissions audit](/insights/audit-shopify-app-permissions) is still the highest-value 20 minutes you will spend on app security.

Then look at behavior under load. Apps that fight the rate limit tend to be the same apps that handle data carelessly, because both come from the same engineering culture. Watch for stalled syncs during sales, exports that never finish, and data that drifts out of date. Those are throttling symptoms, and they tell you something about how the app was built.

Finally, ask the vendor two direct questions: which API version are you on, and how do you handle bulk operation result files. Shopify ships quarterly API versions and supports each for about a year, so a vendor who cannot answer the first question is running on borrowed time. If you want the review done properly, the team at [Defyn Digital](https://defyn.com.au) audits app stacks for exactly this, and Store Auditor covers the performance half by showing you [which apps are adding weight to your storefront](/find-slow-shopify-apps).

## Common questions

### Is the Shopify GraphQL Admin API more secure than REST?

Not inherently. Both use the same OAuth tokens, the same access scopes, and the same enforcement, so an app cannot reach anything through GraphQL that REST would have blocked. The practical advantage is field-level selection: a GraphQL app requests only the fields it needs, so less data leaves Shopify and fewer accidental copies of customer PII land in app logs and caches. That reduction depends entirely on the app querying narrowly. A GraphQL app that requests every field is no better than the REST version.

### Why did Shopify move new apps to GraphQL?

Shopify designated the REST Admin API as legacy and directed new public app development to GraphQL. The reasoning is consistency and efficiency: one schema, explicit field selection, cost-based rate limiting instead of a raw request count, and bulk operations for large jobs. For merchants the visible effect is that actively maintained apps have migrated or are migrating. An app still built entirely on REST is worth noting, not because REST is unsafe today, but because it suggests the vendor is not tracking platform direction.

### Do GraphQL apps still need HMAC webhook verification?

Yes, and nothing about GraphQL changes it. Webhooks are inbound HTTP requests to a URL the app controls, and anyone on the internet can post to that URL. The only thing proving a payload is genuine is the HMAC signature in the header, verified against the app's shared secret before the body is trusted. That is independent of which Admin API the app uses.

## Wrap-up

Migrating from REST to GraphQL does not expand or shrink what an app is allowed to touch, because scopes are the boundary and scopes did not change. What changes is how much data moves for a given task, how throttling fails when an app misbehaves, and which new artifacts exist to be mishandled, chiefly bulk operation result files. Judge apps the way you always should: check the scopes before you install, watch for the throttling symptoms that reveal sloppy engineering, and confirm webhook verification and file handling are done properly. The API model is a detail. The permissions you granted are the actual attack surface.
