---
title: "Shopify webhook security: HMAC verification and avoiding spoofed payloads"
description: "Every Shopify webhook must be HMAC-verified before you trust the payload. Here's the why, the how, and the most common implementation mistakes."
primaryKeyword: "Shopify webhook security"
secondaryKeywords:
  - "Shopify HMAC verification"
  - "Shopify webhook signature"
  - "verify Shopify webhook"
  - "Shopify webhook spoofing"
category: security
publishedDate: 2026-05-21
readingTime: 7
---

Shopify webhooks are how your apps and integrations know what's happening on a store in real time. Order created, customer updated, app uninstalled. The pattern is simple: Shopify makes an HTTP POST to a URL you control, with the event payload in the body.

The problem is that anyone on the internet can also make an HTTP POST to that URL. If your endpoint trusts the body without verifying the request actually came from Shopify, an attacker can spoof events. Fake an order. Fake a customer redaction. Fake a refund.

The fix is HMAC verification. This piece explains what it is, how to implement it correctly, and the specific implementation mistakes that defeat the protection.

## Why HMAC matters

Every webhook Shopify sends includes a header called `X-Shopify-Hmac-SHA256`. This header is a hash of the request body, signed with a shared secret that only you and Shopify know.

When you receive a webhook:

1. Compute the HMAC of the raw body using your shared secret.
2. Compare it to the value in the `X-Shopify-Hmac-SHA256` header.
3. If they match, the request actually came from Shopify and the body hasn't been tampered with.
4. If they don't match, reject the request (HTTP 401).

Without this check, your webhook endpoint accepts anything anyone POSTs to it. That's a serious risk.

## The correct implementation

Here's a working Node.js implementation. The principles apply to any language.

```javascript
import crypto from 'node:crypto';

const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;

export async function verifyShopifyWebhook(req) {
  const hmacHeader = req.headers.get('x-shopify-hmac-sha256');
  if (!hmacHeader) return false;

  // CRITICAL: use the raw body bytes, not a parsed JSON object.
  const rawBody = await req.text();

  const computed = crypto
    .createHmac('sha256', SHOPIFY_API_SECRET)
    .update(rawBody, 'utf8')
    .digest('base64');

  // CRITICAL: use timingSafeEqual to prevent timing attacks.
  return crypto.timingSafeEqual(
    Buffer.from(computed),
    Buffer.from(hmacHeader)
  );
}
```

Three specific things matter here.

**The raw body.** You must hash the exact bytes Shopify sent, not a re-serialized JSON object. If you parse JSON first and then re-stringify, the byte order and formatting may change, and the HMAC will not match. Frameworks like Express need explicit raw body middleware for webhook routes.

**The right secret.** The HMAC is signed with your app's API Secret (from your Partner Dashboard), not a separate "webhook secret" or your API Key. Mixing these up is the most common implementation bug.

**Timing-safe comparison.** A naive string comparison (`computed === header`) is vulnerable to timing attacks where an attacker measures how long the comparison takes and infers the secret one byte at a time. `crypto.timingSafeEqual` (Node.js) or `hmac.compare_digest` (Python) always takes the same time regardless of where the strings differ.

## The implementation mistakes that break HMAC

The protection is only as good as the implementation. The five mistakes we see most often.

### 1. Parsing the body before hashing

```javascript
// WRONG
const payload = await req.json(); // body is now an object
const stringified = JSON.stringify(payload); // not the same bytes Shopify sent
const computed = crypto.createHmac(...).update(stringified, 'utf8').digest('base64');
```

JSON.stringify produces output that's logically equivalent but byte-different from what Shopify sent. The HMAC will mismatch. Always hash the raw bytes.

### 2. Using the wrong secret

The Shopify Partner Dashboard lists several secrets: Client ID, Client Secret (API Secret), and per-webhook subscription secrets for Pub/Sub or EventBridge integrations. For HTTP webhook deliveries, the signing secret is your app's Client Secret.

If your webhooks are configured through Shopify's CLI (with `shopify.app.toml`), the secret is automatically your app's API Secret. If you registered webhooks via the API directly, double-check which secret you're using.

### 3. Skipping the check in development

It's tempting to disable HMAC verification while you're building, then forget to re-enable it. The fix is to make verification mandatory in code and use [Shopify CLI's webhook trigger](https://shopify.dev/docs/api/shopify-cli/app/app-webhook-trigger) for testing. The CLI signs payloads with your real API secret, so HMAC verification works in development too.

### 4. Naive string comparison

```javascript
// WRONG
if (computed === hmacHeader) { /* accept */ }
```

This is vulnerable to timing attacks. Use `crypto.timingSafeEqual` instead. The performance difference is negligible; the security difference is real.

### 5. Returning 500 instead of 401

If HMAC verification fails, return HTTP 401 Unauthorized. If you return 500 (server error), Shopify will retry the webhook up to 19 times over 48 hours, generating noise and potentially eventually marking your endpoint as unreliable.

## How Shopify retries failed webhooks

If your endpoint returns a non-2xx response, Shopify retries the webhook with exponential backoff. Up to 19 attempts over 48 hours. After that, the webhook is marked failed and (depending on the topic) the subscription may be deactivated.

This means a single HMAC implementation bug that returns 401 on every request will cause Shopify to eventually disable your webhook subscription. You'll lose all events from that point until you re-enable. Monitor your endpoint's response codes.

## What to do when verification fails legitimately

Occasionally, a webhook will fail verification despite a correct implementation. Causes include:

- Body parsing middleware modifying the bytes before your handler runs.
- A reverse proxy normalizing whitespace.
- Character encoding mismatches (Shopify sends UTF-8; some frameworks default to a different encoding).

When this happens, log:

- The raw body length
- The first 100 bytes of the raw body
- The computed HMAC
- The provided HMAC
- The secret you used (first 4 chars only, for safety)

Comparing these against Shopify's expected values often reveals the issue.

## Mandatory GDPR compliance webhooks

Three webhooks are mandatory for every Shopify app and must implement HMAC verification correctly.

- `customers/data_request` (customer requests their data)
- `customers/redact` (customer requests deletion)
- `shop/redact` (merchant uninstalls and 48 hours pass)

If your app doesn't honor these, Shopify can suspend or delete it from the App Store. Beyond compliance, these are the webhooks that protect customer privacy when things go wrong. Get them right.

[Store Auditor's implementation](/how-it-works) handles all three. The `shop/redact` webhook triggers a cascading deletion of all scan history within the 48 hour window required by Shopify's policy.

## Beyond HMAC: defense in depth

HMAC verification is the floor. Additional layers worth adding:

- **Rate limiting** on your webhook endpoint to prevent abuse if HMAC is somehow bypassed.
- **Idempotency keys** based on the webhook ID (`X-Shopify-Webhook-Id` header) so duplicate deliveries don't double-process.
- **Allow-listing Shopify's IP ranges** if you can (Shopify publishes them, though they change occasionally).
- **Monitoring** for sudden spikes in webhook volume, which could indicate replay attacks or compromised subscriptions.

## How this connects to performance

Webhook security isn't directly a performance topic, but the two intersect in one place: webhook handler performance.

Shopify expects a 2xx response within 5 seconds. If your handler takes longer (because it's doing heavy work synchronously), Shopify will eventually mark the endpoint unreliable. The pattern that works is to acknowledge the webhook fast (return 200 immediately) and queue the actual work for background processing.

This is the same pattern we recommend for any Shopify app's webhook layer, including [Store Auditor's own webhook handlers](/how-it-works) for app/uninstalled, app/scopes_update, and the three GDPR webhooks. Verify HMAC, queue the work, return 200, do the work asynchronously.

## How agencies handle this

At [Defyn Digital](https://defyn.com.au), the team behind Store Auditor, our webhook implementations are standardized across every Shopify app we build for clients. Verify HMAC with timing-safe comparison, queue to a background worker, log failures with enough detail to debug.

For merchants who don't build apps directly but want to verify their installed apps handle webhooks correctly, the implementation is opaque from the outside. The best signal is the developer's documentation and security disclosures. Apps that publish their webhook handling approach in technical detail are usually doing it correctly.

## Related reading

- [How to audit Shopify app permissions](/insights/audit-shopify-app-permissions)
- [Customer data security: GDPR and CCPA compliance](/insights/shopify-customer-data-gdpr-compliance)
- [How to identify malicious Shopify apps](/insights/identify-malicious-shopify-apps)
