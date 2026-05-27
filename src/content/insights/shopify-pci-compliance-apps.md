---
title: "PCI compliance and your Shopify apps: what merchants need to know"
description: "Shopify handles your storefront's PCI compliance, but the moment you install apps that touch payment data, your responsibility expands. Here's the working merchant guide."
primaryKeyword: "Shopify PCI compliance"
secondaryKeywords:
  - "Shopify payment security"
  - "Shopify app PCI"
  - "Shopify checkout security"
  - "PCI DSS Shopify"
category: security
publishedDate: 2026-05-27
readingTime: 8
---

Shopify is PCI DSS Level 1 certified. That handles the heavy lifting for the platform itself. Your storefront's checkout process inherits Shopify's compliance posture, and if you're a Shopify merchant using only Shopify's native checkout, your PCI scope is minimal.

But the moment you install apps that touch payment data, subscription apps, alternative checkout flows, or anything that processes cards outside Shopify's standard flow, your PCI responsibility expands. This piece is the practical guide to what changes when, and what to actually do about it.

## What Shopify handles by default

Out of the box, Shopify's standard checkout puts your store in PCI scope at the lowest level (SAQ A). That means:

- Card numbers never touch your servers.
- Shopify's hosted checkout pages are PCI-certified.
- You complete a short self-assessment questionnaire annually.
- You don't have to maintain PCI infrastructure (encryption, key management, vulnerability scanning) yourself.

This is the lightest possible PCI scope for an ecommerce business. Shopify designed it deliberately to keep merchants out of the heaviest compliance work.

## What expands your PCI scope

Three categories of apps and configurations change your compliance picture.

### 1. Subscription apps

Recurring billing apps (ReCharge, Bold Subscriptions, Stay AI, Awtomic) store tokenized payment methods for repeat charges. The tokenization keeps you out of full SAQ scope, but you become responsible for verifying the app's own PCI posture.

Practical checklist:

- Confirm the app is PCI DSS compliant. Reputable subscription apps publish their certification.
- Get a copy of their Attestation of Compliance (AOC) for your records.
- Document the data flow: which app holds which tokens, where it's hosted, what happens on customer cancellation.

### 2. Apps that bypass Shopify checkout

Some apps create custom checkout flows: B2B portals, wholesale apps, build-your-own bundle apps with custom payment handling. If the app collects card data directly (even if it tokenizes immediately), your PCI scope may shift from SAQ A to SAQ A-EP.

SAQ A-EP requires:

- Quarterly external vulnerability scanning of any servers in scope.
- An annual penetration test for larger merchants.
- More detailed self-assessment.

Before installing any app that creates a custom checkout, ask the developer:

- Does this app collect card data directly?
- If yes, how is it tokenized?
- What's your PCI compliance status?
- Will using this app shift my SAQ category?

### 3. Apps that touch the checkout page

Apps that inject scripts into the checkout (upsell apps, abandoned cart recovery widgets, checkout customization apps) are restricted by Shopify and tightly controlled. Shopify has been progressively moving these to Checkout Extensions, which are sandboxed.

If you have older apps still injecting scripts directly into the checkout page (legacy installations), they may not be running under the same PCI controls. Audit your checkout's loaded scripts using browser dev tools. Anything you don't recognize is a flag.

## The practical checklist for SAQ A merchants

If you're a standard Shopify merchant using Shopify Payments or another Shopify-integrated processor, no custom checkout, no subscription apps, no card-touching apps, your PCI obligations are limited.

The annual checklist:

1. **Complete the SAQ A questionnaire** through Shopify's compliance dashboard.
2. **Verify your processor is current.** Shopify Payments handles this for you, but other processors may have their own forms.
3. **Document your payment flow** (mainly for your own records and any audit requests).
4. **Train staff on phishing awareness.** Most modern PCI incidents start with social engineering, not technical breaches.

That's it. SAQ A is genuinely lightweight.

## What changes when you add apps that touch payment data

Each app that holds payment-related data adds compliance work. The practical workflow:

1. **List the app in your processor inventory.** Same document you maintain for [GDPR compliance](/insights/shopify-customer-data-gdpr-compliance).
2. **Verify the app's own PCI status.** Reputable apps publish their certification.
3. **Update your SAQ category if needed.** Talk to your acquiring bank or PCI Qualified Security Assessor if you're unsure.
4. **Monitor for changes.** When the app updates, when the developer changes hosting, when their certification expires.

## Apps that increase risk meaningfully

A few app categories where PCI scope expansion is most common:

**Custom checkout apps.** Anything that creates a separate cart and payment flow outside Shopify checkout. The fastest way to expand your PCI scope. Avoid unless absolutely necessary.

**International payment apps.** Apps that add support for regional payment methods (UPI in India, PIX in Brazil, etc.) by routing payments through their own infrastructure. Verify their compliance carefully.

**B2B portals.** Wholesale customer apps that handle invoice payment or net terms billing. Often store partial card data for recurring B2B clients.

**Buy-now-pay-later integrations** (Klarna, Afterpay, Affirm). These typically use redirect flows that keep you out of scope, but verify the integration method, not all BNPL integrations are equal.

## Penalties and incident response

If a Shopify merchant suffers a card data breach and is found to have been out of PCI compliance:

- Card networks (Visa, Mastercard) can impose direct fines (typically $5,000-$100,000 per incident).
- Your acquiring bank may impose additional fees or move you to a higher-risk classification.
- Your processor may suspend your account pending investigation.

In practice, for merchants under $50K/month in card volume, the most likely consequence is being moved to a higher-risk processor classification with higher transaction fees. For larger merchants, the financial impact is severe.

The response playbook if you suspect an incident:

1. Notify your processor and acquiring bank immediately.
2. Engage a PCI Forensic Investigator (PFI) if cards are confirmed exposed.
3. Notify affected customers per your jurisdiction's breach notification law.
4. Document the timeline and root cause.

## Tools and services

Shopify's [Trust Center](https://trust.shopify.com/) is the source of truth for the platform's compliance posture. They publish current certifications, audit reports, and incident transparency.

For per-app risk assessment, the audit tools we cover in our [Shopify app permissions guide](/insights/audit-shopify-app-permissions) are the starting point. Knowing what scopes each app holds is the first step.

[Store Auditor](https://apps.shopify.com/store-auditor) doesn't audit PCI compliance specifically, but it does flag which apps are loading scripts on your checkout page, which is a useful diagnostic for any merchant trying to understand their checkout's loaded code.

For agency-level PCI audit work, especially when expanding into new payment methods or subscription models, [Defyn Digital](https://defyn.com.au) provides Shopify PCI scope reviews. We help merchants understand which apps shift their SAQ category and what additional controls are needed.

## When to bring in a Qualified Security Assessor

For most Shopify merchants, you'll never need a QSA. The exceptions:

- You're processing over 6 million card transactions per year (Visa Level 1 merchant).
- You're being audited after a confirmed incident.
- You're expanding into payment methods or geographies with specific regulatory requirements (e.g., PSD2 in the EU).

For everyone else, working through your processor's compliance dashboard and maintaining good app hygiene is enough.

## Related reading

- [How to audit Shopify app permissions](/insights/audit-shopify-app-permissions)
- [Customer data security: GDPR and CCPA compliance](/insights/shopify-customer-data-gdpr-compliance)
- [How to identify malicious Shopify apps](/insights/identify-malicious-shopify-apps)
