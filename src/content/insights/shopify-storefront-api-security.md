---
title: "Shopify Storefront API Security: How to Expose Data Without Leaking Secrets"
description: "Shopify Storefront API security requires scoping tokens correctly, validating origins, and never exposing admin-level data through public endpoints so your store stays protected."
primaryKeyword: "Shopify Storefront API security"
secondaryKeywords:
  - "Storefront API access token scopes"
  - "public API security for Shopify"
  - "protecting customer data in headless Shopify"
  - "Storefront API rate limiting best practices"
  - "secure Shopify custom storefronts"
category: security
publishedDate: 2026-06-08
readingTime: 9
---

Shopify Storefront API security is the practice of configuring public API access tokens with minimal scopes, validating request origins, and ensuring no admin-level or sensitive customer data leaks through endpoints designed for anonymous browsing.

## Key takeaways

- Storefront API tokens should only grant `unauthenticated_read_product_listings` and similar read scopes, never admin scopes like `write_orders` or `read_customers`.
- Cross-origin requests need proper CORS headers and origin validation to prevent unauthorized domains from consuming your API quota or scraping data.
- Customer data (email, phone, addresses) must never be returned by Storefront API queries unless the customer is authenticated with a valid multipass token or customer access token.
- Rate limits on the Storefront API are per-token and per-IP, so exposing tokens in client-side code means anyone can burn through your quota.
- Rotating tokens quarterly and monitoring usage in Shopify admin helps catch compromised tokens before they cause damage.

## Why the Storefront API is different from the Admin API

Shopify provides two main APIs. The Admin API is for backend operations: creating products, reading order details, managing customers. It requires OAuth or private app credentials and should never be called from a browser.

The Storefront API is designed for public consumption. It powers headless storefronts, mobile apps, and custom checkout flows. Tokens for this API are meant to be embedded in client-side JavaScript or mobile app bundles. That public exposure is the security challenge.

The Admin API uses scopes like `read_orders` or `write_products`. The Storefront API uses scopes like `unauthenticated_read_product_listings` or `unauthenticated_read_checkouts`. The word "unauthenticated" is critical. It means anyone with the token can call those endpoints without proving identity.

If you configure a Storefront API token with overly broad scopes, you hand attackers the keys. A token with `unauthenticated_read_customer_tags` (hypothetically) would let anyone query customer segmentation data. Shopify limits available scopes for exactly this reason, but developers still make mistakes.

## Configuring token scopes correctly

When you create a Storefront API token in Shopify admin (Settings > Apps and sales channels > Develop apps), you select scopes. Start with the absolute minimum:

- `unauthenticated_read_product_listings`: allows querying products, collections, and variants.
- `unauthenticated_read_checkouts`: allows creating and reading checkout sessions.
- `unauthenticated_write_checkouts`: allows updating line items in a checkout.
- `unauthenticated_read_content`: allows querying blogs, articles, and pages.

Never enable `read_customers` or `read_orders` on a Storefront API token. Those scopes belong on Admin API credentials, locked behind server-side authentication.

If your headless storefront needs to show order history for logged-in customers, use the Customer Account API with multipass tokens or customer access tokens. Those tokens are short-lived and scoped to a single customer. The Storefront API token itself remains public and read-only.

Across the 80+ stores we have audited at [Defyn](https://defyn.com.au), the most common mistake is developers creating a single "god token" with every available scope because they are unsure which they need. That token then sits in a Git repository or gets committed to a public CDN bundle. Attackers scan GitHub for Shopify tokens constantly. Narrow scopes limit the blast radius when a token leaks.

## Validating request origins and preventing scraping

Because Storefront API tokens live in browser JavaScript, anyone can extract them from your site's source code. That is expected. The security model assumes the token is public.

What you can control is which domains are allowed to use the token. Shopify does not enforce origin restrictions at the API level, so you must implement them yourself.

One approach is to proxy all Storefront API calls through your own server. The client hits `yoursite.com/api/products`, your server validates the request origin, then forwards the query to Shopify with the token. This keeps the token server-side.

```javascript
// Example Next.js API route
export default async function handler(req, res) {
  const allowedOrigins = ['https://yourstore.com', 'https://staging.yourstore.com'];
  const origin = req.headers.origin;

  if (!allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Forbidden origin' });
  }

  const shopifyResponse = await fetch('https://yourstore.myshopify.com/api/2024-01/graphql.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': process.env.STOREFRONT_TOKEN
    },
    body: JSON.stringify(req.body)
  });

  const data = await shopifyResponse.json();
  res.status(200).json(data);
}
```

This adds latency (an extra hop) but gives you control. You can log requests, implement rate limiting per IP, and block suspicious patterns.

If you embed the token directly in client code, at minimum validate the `Referer` header on your server for sensitive operations. A scraper hitting the Storefront API directly will not send a `Referer` matching your domain.

## Protecting customer data in headless architectures

The Storefront API will never return customer email addresses, phone numbers, or full addresses in unauthenticated queries. Shopify blocks that by design. But developers sometimes work around it incorrectly.

We have seen stores that query the Admin API from client-side code to fetch customer details, then cache the results in localStorage. That is a critical vulnerability. Admin API credentials in browser JavaScript means anyone can impersonate your app and read all customer records.

The correct pattern:

1. Customer logs in via Shopify's multipass or a custom authentication flow.
2. Your server generates a short-lived customer access token using the Admin API.
3. The client uses that token to query customer-specific data through the Storefront API's customer queries.
4. The token expires after 24 hours (configurable).

This keeps Admin API credentials server-side. The Storefront API token remains public and scoped to read-only product data. The customer access token is scoped to one customer and time-limited.

Similar principles apply to order data. If you need to show "thank you" pages with order details, use the Storefront API's `node` query with the order's global ID. That ID is a long opaque string returned after checkout. It is not guessable, so only the customer who completed the order can query it. Do not expose order numbers or sequential IDs in URLs.

## Rate limiting and quota management

Shopify enforces rate limits on the Storefront API using a cost-based system. Each query field has a cost. Simple product queries cost 1 to 5 points. Complex nested queries can cost 50+ points. You get a bucket of points that refills over time.

If your token is public and embedded in JavaScript, anyone can drain your quota. A competitor could script thousands of requests to slow down your site. A scraper could pull your entire product catalog hourly.

Mitigation strategies:

- **Rotate tokens quarterly.** Generate a new token, update your deployment, revoke the old token. This limits the window for a leaked token to cause damage.
- **Monitor usage in Shopify admin.** Check the API usage dashboard weekly. Spikes in traffic from unexpected IPs are red flags.
- **Implement client-side caching.** Use service workers or IndexedDB to cache product data for 5 to 10 minutes. Reduce redundant API calls.
- **Use a CDN with rate limiting.** Cloudflare or Fastly can throttle requests per IP before they hit your origin or Shopify.

We have seen stores that hit rate limits during flash sales because their frontend made a Storefront API call on every product card render. 100 products on a collection page = 100 API calls. That is inefficient and fragile. Batch your queries. Use GraphQL's nested structure to fetch products, variants, and images in one request.

## Comparing Storefront API security to other Shopify APIs

Shopify's webhook security model is instructive. Webhooks use HMAC signatures to prove authenticity (we cover this in depth at [/insights/shopify-webhook-security-hmac](/insights/shopify-webhook-security-hmac)). The Storefront API has no equivalent signature mechanism because the token is public.

The Admin API uses OAuth with refresh tokens and scoped permissions. Apps request specific scopes, merchants approve them, and Shopify logs every API call. That audit trail does not exist for Storefront API usage. You only see aggregated metrics.

This is why app permission audits are critical. If a third-party app requests Admin API scopes it does not need, it can exfiltrate data silently. We discuss how to audit those permissions at [/insights/audit-shopify-app-permissions](/insights/audit-shopify-app-permissions). The same principle applies to Storefront API tokens: grant the minimum scopes required, nothing more.

## Common questions

### How do I know if my Storefront API token has leaked?

Check your API usage dashboard in Shopify admin for unusual spikes. If you see traffic from IPs or user agents you do not recognize, rotate the token immediately. GitHub also scans public repositories for exposed Shopify tokens and notifies you. Enable those alerts.

### Can I restrict a Storefront API token to specific IP addresses?

Shopify does not support IP whitelisting for Storefront API tokens. The token is designed to be used from any client. If you need IP restrictions, proxy all API calls through your own server and enforce the whitelist there.

### What happens if I accidentally commit a Storefront API token to Git?

Revoke it immediately in Shopify admin, generate a new token, and update your deployment. Even if the repository is private, assume the token is compromised. Rotate secrets as a reflex, not after confirming a breach.

## Wrap-up

Shopify Storefront API security comes down to scoping tokens narrowly, treating them as public, and never mixing admin-level data into public endpoints. Proxy requests when you need origin control. Use customer access tokens for authenticated queries. Monitor usage and rotate tokens regularly. The Storefront API is powerful for headless commerce, but only if you configure it with the assumption that anyone can read your client-side code. Plan for that reality and your store stays protected.

For ongoing security monitoring, [Store Auditor](/how-it-works) scans your Shopify setup for exposed tokens, overly permissive app scopes, and other risks that accumulate as your store evolves.
