---
title: "Shopify customer data: GDPR and CCPA compliance for app installations"
description: "What you're actually responsible for when Shopify apps process your customer data, and the practical compliance steps that matter for a working store."
primaryKeyword: "Shopify GDPR compliance"
secondaryKeywords:
  - "Shopify CCPA"
  - "Shopify customer data security"
  - "Shopify privacy compliance"
  - "Shopify app data handling"
category: security
publishedDate: 2026-05-23
readingTime: 9
---

Shopify handles the heavy lifting of GDPR and CCPA at the platform level, but the moment you install a third-party app, the compliance picture changes. Each app becomes a sub-processor that holds, processes, or transmits your customer data. You're responsible for knowing who has what.

This piece is the practical compliance guide. Not the legal text, the actual workflow for keeping a Shopify store compliant when you have 8-15 installed apps each touching customer data in different ways.

## What Shopify handles vs. what you handle

Shopify is the data controller for your storefront's underlying customer database. They publish a [Data Processing Addendum](https://www.shopify.com/legal/dpa) and handle the platform-level compliance work: encryption at rest, encryption in transit, access controls on their side, breach notification procedures, etc.

You're responsible for:

1. **Maintaining a list of third-party processors** (which apps hold your customer data)
2. **Honoring data subject requests** (deletion, export, correction) end-to-end across those apps
3. **Disclosing your data handling** in a privacy policy that's accurate to your actual stack
4. **Ensuring each app has a DPA** with you (in practice, the app's own privacy policy serves)
5. **Removing data on uninstall** within the required window (48 hours for Shopify's compliance webhooks)

The last point is the one most merchants miss. When you uninstall an app, Shopify fires a `shop/redact` webhook 48 hours later. Reputable apps honor it and delete your data. Less reputable apps ignore it and keep the data indefinitely.

## The practical compliance workflow

A working compliance posture for a typical Shopify store involves four ongoing habits.

### 1. Maintain a third-party processor list

Keep a simple document (spreadsheet, Notion page, anything searchable) listing every installed Shopify app, what customer data it processes, where it's hosted, and a link to its privacy policy. Update it when you install or uninstall an app.

Sample columns:

| App | Data accessed | Hosting region | Privacy policy | Has DPA |
|---|---|---|---|---|
| Klaviyo | Email, name, purchase history | US (Massachusetts) | klaviyo.com/legal/privacy | Yes |
| Judge.me | Customer name, review content | US (AWS) | judge.me/privacy | Yes |
| Tidio | Chat transcripts, email | EU (Frankfurt) | tidio.com/privacy | Yes |

This document is your starting point for any GDPR Article 30 record, any CCPA service-provider disclosure, or any due-diligence question from a B2B customer.

### 2. Audit the OAuth scopes each app holds

This connects directly to our [Shopify app permission audit guide](/insights/audit-shopify-app-permissions). The scope an app holds tells you what data it can access. An app with `read_customers` can read your entire customer database. Knowing which apps hold that scope is the start of any data security audit.

### 3. Honor data subject requests

Under GDPR, customers can request:

- A copy of their personal data ("data portability")
- Correction of inaccurate data
- Deletion of their data ("right to be forgotten")
- A list of who their data has been shared with

Under CCPA, California consumers have similar rights, plus the right to opt out of data sales.

The practical workflow when you receive a request:

1. **Find the customer in Shopify.** Shopify Admin, Customers, search by email.
2. **Trigger Shopify's customer redaction webhook.** This fires a `customers/redact` webhook to every installed app that holds customer data. Apps that honor the webhook delete the customer's record.
3. **Follow up manually with any non-compliant apps.** Some apps don't fully delete; some delete from active storage but keep backups. Each app's privacy policy will tell you their actual deletion policy.
4. **Confirm completion to the customer within 30 days** (GDPR) or 45 days (CCPA).

Reputable apps make this easy by handling the webhook correctly. Shopify maintains a [list of GDPR-compliant apps](https://shopify.dev/docs/apps/build/privacy-law-compliance) in their developer docs. If an app you use isn't on it, that's a flag worth investigating.

### 4. Test uninstall data deletion

When you uninstall an app, Shopify fires a `shop/redact` webhook 48 hours later. Reputable apps process the webhook and delete your data within the window.

You can verify this by uninstalling a test app, waiting 48 hours, and asking the app developer to confirm the deletion happened. Most reputable apps publish their compliance webhook implementation in their developer docs.

[Store Auditor](https://apps.shopify.com/store-auditor) for example honors the shop/redact webhook and hard-deletes all scan data within 48 hours of uninstall. The compliance implementation is documented in our [privacy policy](https://storeauditor.au/insights) and we publish the deletion confirmation flow on request.

## What apps are typically high-risk for compliance

Based on the audits we run through [Store Auditor](/how-it-works) and on direct security engagements through [Defyn Digital](https://defyn.com.au), the high-risk categories are:

1. **Marketing automation apps** (Klaviyo, Omnisend, Privy). They hold deep customer profiles by design. Read their privacy policies carefully and confirm their deletion behavior.

2. **Subscription apps** (ReCharge, Bold). They hold recurring payment customer profiles. PCI and privacy compliance overlap here.

3. **Review apps** (Judge.me, Yotpo, Loox). Customer reviews contain PII. Some review apps publish reviews on third-party domains where SEO benefits also create privacy concerns.

4. **Chat apps** (Tidio, Gorgias, Intercom). Chat transcripts often contain sensitive PII shared by customers who don't realize they're communicating with a third-party service.

5. **Customer data platforms** (Segment, mParticle, Census). These exist specifically to move customer data to other systems. Each receiving system also needs to be on your processor list.

For each of these categories, the questions to ask:

- Where is data hosted (geographic regions matter for GDPR)?
- What's the deletion SLA?
- What sub-processors does the app use (their own third parties)?
- Has the app ever had a public breach?

## How to write a privacy policy that matches your stack

Your storefront privacy policy needs to reflect the actual third parties holding customer data. A generic template will fail an audit. The minimum content:

- Categories of data collected (browsing behavior, purchase history, payment info, etc.)
- Why each category is collected (legitimate interest, contractual necessity, consent)
- Third-party processors (with links to their privacy policies)
- Data retention periods (how long you keep order history, customer records, etc.)
- Data subject rights and how to exercise them (email address, response time)
- Cookies disclosure (if you use cookies beyond Shopify's own functional ones)

Shopify's [Customer Privacy API](https://shopify.dev/docs/apps/build/privacy-law-compliance/customer-privacy-api) provides a programmatic way to track customer consent. If you use it, document that in your policy too.

## When to bring in legal help

A few specific scenarios where you should consult a privacy lawyer (not just a developer or compliance consultant):

- You're expanding into the EU and need to designate an EU representative under GDPR Article 27.
- You're California-based and approaching the CCPA thresholds (annual gross revenue over $25M, or data on 100,000+ households).
- You receive a regulatory inquiry from a data protection authority.
- You suffer a data breach and need to assess notification obligations.

For day-to-day compliance, a good privacy policy template plus the workflow above will keep most Shopify stores in good shape.

## How agencies handle this

At [Defyn Digital](https://defyn.com.au), our standard Shopify compliance engagement reviews installed apps, audits OAuth scopes, drafts or updates the privacy policy, and sets up the data subject request workflow. We built Store Auditor partly because performance and compliance overlap so much. The apps slowing down your store are often the same apps holding the most customer data.

## Related reading

- [How to audit Shopify app permissions](/insights/audit-shopify-app-permissions)
- [How to identify malicious Shopify apps](/insights/identify-malicious-shopify-apps)
- [Shopify webhook security: HMAC verification](/insights/shopify-webhook-security-hmac)
