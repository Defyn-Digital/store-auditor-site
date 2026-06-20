---
title: "Shopify Checkout Extensibility Security: What Extensions Can and Cannot Do"
description: "Shopify checkout extensibility security relies on sandboxed components, limited data access, and strict API boundaries to protect payment data while enabling customization."
primaryKeyword: "Shopify checkout extensibility security"
secondaryKeywords:
  - "Shopify checkout UI extensions security model"
  - "checkout extensibility API permissions"
  - "sandboxed checkout components Shopify"
  - "checkout extension data access limits"
  - "PCI compliant checkout customization"
category: security
publishedDate: 2026-06-20
readingTime: 9
---

Shopify checkout extensibility security is a sandboxed architecture that prevents extensions from accessing payment data, manipulating the DOM directly, or executing arbitrary code in the checkout environment.

## Key takeaways

- Checkout UI extensions run in isolated JavaScript sandboxes that cannot access payment fields, customer credit card data, or the browser DOM.
- Extensions communicate only through Shopify's API boundaries, which enforce read-only access to most checkout data and write access only to specific metafields and attributes.
- The security model maintains PCI DSS Level 1 compliance by ensuring no third-party code can intercept or modify payment information during the transaction flow.
- Apps must declare required API scopes upfront, and merchants can review these permissions before installation through the standard [app permission audit](/insights/audit-shopify-app-permissions) process.
- Unlike script-based customizations (checkout.liquid or Scripts), checkout extensions cannot inject tracking pixels, modify pricing logic, or execute network requests to arbitrary endpoints.

## The sandboxed execution model

Checkout UI extensions execute in a restricted JavaScript environment. Shopify compiles your extension code into a format that runs inside a Web Worker with no access to the global window object, document, or any browser APIs beyond what the platform explicitly provides.

This architecture choice solves the fundamental security problem of the old checkout.liquid system. When merchants could inject arbitrary Liquid and JavaScript into checkout, any compromised theme or malicious app could steal payment data. The new model makes that attack vector impossible.

The sandbox provides a limited set of APIs through the `@shopify/ui-extensions-react` or `@shopify/ui-extensions` packages. Your extension code imports these APIs and uses them to render UI components and read checkout state. You cannot:

- Access `window`, `document`, `localStorage`, or `sessionStorage`
- Make direct `fetch()` or `XMLHttpRequest` calls to external services
- Execute `eval()` or create new `Function()` instances
- Manipulate the DOM outside your extension's designated target areas
- Read or write cookies
- Access the browser's geolocation, camera, or microphone APIs

This restriction list might seem limiting, but it reflects the core security principle: checkout extensions are pure UI components that react to checkout state changes. They are not general-purpose JavaScript applications.

## Data access boundaries

Extensions receive checkout data through reactive hooks like `useCartLines()`, `useShippingAddress()`, and `useTotalAmount()`. The data you receive is read-only. You cannot modify line item prices, change shipping rates, or alter tax calculations directly from extension code.

What you can modify:

- Cart attributes (key-value pairs attached to the order)
- Line item attributes (metadata on individual products)
- Specific metafields that your app owns
- Delivery and payment customization selections (through dedicated APIs)

Across the 80+ Shopify Plus stores we have audited at [Defyn](https://defyn.com.au), the most common security misconfiguration is apps requesting broader metafield access than they need. An extension that only needs to read `custom.subscription_interval` should not request write access to all metafields under the `custom` namespace.

The checkout data model explicitly excludes payment information. Extensions cannot access:

- Credit card numbers, CVV codes, or expiry dates
- Payment gateway tokens or transaction IDs
- Bank account details for direct debit methods
- Digital wallet credentials (Apple Pay, Google Pay)

This isolation is enforced at the platform level. Even if you attempted to reverse-engineer the checkout's internal state management, the payment data never enters the JavaScript context where extensions run. It lives in a separate, PCI-compliant processing layer.

## API permission scopes

When you build a checkout extension, you declare required API scopes in your app's configuration. Common scopes include:

- `read_cart_transforms`: Access to cart and checkout line items
- `write_cart_transforms`: Ability to modify cart through Functions
- `read_customers`: Access to customer data when logged in
- `write_order_edits`: Modify orders post-purchase (rare for extensions)

The permission model ties directly to [Shopify PCI compliance apps](/insights/shopify-pci-compliance-apps) requirements. Any app that touches checkout must follow the principle of least privilege. Request only the scopes your extension actually uses.

Shopify validates scope usage during the app review process. If your extension requests `write_customers` but never calls the customer mutation APIs, the review team will flag it. This validation reduces the attack surface if an app's authentication is compromised.

Merchants see these scopes during installation. A checkout extension that requests `read_all_orders` raises immediate red flags. Why does a shipping date picker need access to historical order data? The answer is usually poor scoping, not malicious intent, but the security impact is identical.

## Network and external communication

Checkout extensions cannot make arbitrary network requests. The sandbox blocks `fetch()` and `XMLHttpRequest`. If your extension needs to communicate with an external service (for example, to validate a discount code against your own API), you must proxy through Shopify's infrastructure.

The pattern works like this:

1. Your extension calls a Shopify Function or App Proxy endpoint
2. That server-side component (running in Shopify's infrastructure or your verified app backend) makes the external API call
3. The result flows back to your extension through the reactive data model

This indirection adds latency (typically 200 to 600 milliseconds round-trip), but it prevents extensions from:

- Sending checkout data to unauthorized third parties
- Loading malicious scripts from compromised CDNs
- Implementing client-side tracking that bypasses merchant consent settings
- Creating covert channels for data exfiltration

The [Store Auditor app](/how-it-works) specifically checks for apps that attempt to work around these restrictions by embedding hidden iframes or using postMessage to communicate with externally-hosted code. Both techniques violate Shopify's extension policies and create compliance risks.

## UI component restrictions

The UI components available to checkout extensions are a curated subset of standard HTML elements, wrapped in Shopify's design system. You build interfaces using components like `BlockStack`, `InlineLayout`, `TextField`, and `Button`, not raw `<div>` and `<input>` tags.

This component model enforces several security properties:

- No inline event handlers (no `onclick` attributes with arbitrary code)
- No style injection that could hide or overlay native checkout elements
- No form submissions to external URLs
- No embedded iframes or object tags

The styling system uses Shopify's design tokens. You can customize colors, spacing, and typography within defined boundaries, but you cannot inject CSS that positions elements outside your extension's container or makes UI elements invisible to screen readers.

This restriction prevents UI redressing attacks where a malicious extension overlays a fake payment form on top of the real one, tricking customers into entering card details into an attacker-controlled field.

## Common questions

### Can checkout extensions access customer email addresses?

Yes, but only when the customer has entered their email in the checkout flow. Extensions receive email through the `useBuyerIdentity()` hook after the customer completes the contact information step. The email is read-only. Extensions cannot modify it or pre-fill it with values from external sources. If you need to validate email domains (for B2B restrictions, for example), implement that logic in a Checkout Validation Function, not in the UI extension itself.

### How do I debug security issues in checkout extensions?

Use Shopify CLI's development mode (`shopify app dev`) to run your extension in a test checkout. The browser console will show sandbox violations if your code attempts restricted operations. For production debugging, check your app's error logs in the Partner Dashboard. Shopify logs all permission denials and API boundary violations. Cross-reference these logs with your extension's declared scopes. If you see "insufficient permissions" errors, you either need to request additional scopes or redesign your extension to work within current permissions.

### What happens if a checkout extension is compromised?

Shopify can remotely disable extensions without merchant intervention. If the security team detects malicious behavior (data exfiltration attempts, unauthorized API calls, or policy violations), they revoke the extension's execution permissions across all stores. Merchants receive notifications through their admin panel. The compromised extension stops rendering in checkout immediately. This kill-switch mechanism is part of Shopify's PCI compliance controls. It ensures that even if an app developer's credentials are stolen, attackers cannot use checkout extensions to harvest payment data at scale.

## Wrap-up

The checkout extensibility security model trades flexibility for safety. You cannot build everything you could with checkout.liquid, but what you can build runs in an environment where payment data theft is architecturally impossible. For most customization needs (upsells, delivery date pickers, gift messages, subscription options), the component and API boundaries provide sufficient capability. For merchants evaluating checkout apps, verify that extensions request minimal scopes and avoid apps that try to work around the sandbox through proxy services or excessive server-side data collection. Review your installed apps' permissions regularly using [our app permission audit guide](/insights/audit-shopify-app-permissions), and check [checkout extension pricing](/pricing) for security-focused auditing tools that validate your checkout configuration against Shopify's latest security standards.
