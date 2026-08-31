---
title: "Shopify Encrypted Customer Fields: Metafields Without the Leak"
description: "Shopify encrypted customer fields explained: what metafields really expose, the envelope encryption pattern, and how to protect sensitive data without breaking other apps."
primaryKeyword: "Shopify encrypted customer fields"
secondaryKeywords:
  - "Shopify customer metafields security"
  - "encrypt Shopify metafield data"
  - "Shopify app owned metafields"
  - "Shopify metafield storefront access"
  - "Shopify sensitive customer data storage"
category: security
publishedDate: 2026-08-25
readingTime: 8
---

A customer metafield is a labelled box, not a safe, and most stores discover the difference the first time a support agent reads back something that was never meant to be readable.

## Key takeaways

- Shopify encrypts data at rest across the platform, but that protects against disk theft, not against every app and staff member with the right scope reading the plaintext.
- Metafields are visible to anything holding `read_customers`, which on a typical store means several apps you have not thought about in a year.
- Storefront access on a metafield definition is the single most common leak. One wrong setting publishes the field to anyone who can call the Storefront API.
- Encrypt in your own application, store ciphertext in the metafield, and keep keys outside Shopify. That is the only pattern where the store owner is not also the key holder.
- Encryption breaks things when other systems need to read, search, or export the field. Decide that before you encrypt, not after.

## What Shopify already encrypts, and what it does not

Shopify encrypts customer data at rest on its own infrastructure and serves everything over TLS. That covers a specific threat: someone obtaining the physical storage or intercepting traffic. It is real protection and it is table stakes.

It does nothing about the threat merchants actually face. Platform-level encryption at rest is transparent, which means every legitimate read decrypts automatically. An app with `read_customers`, a staff member with customer permissions, a CSV export, a Flow automation, an ERP connector: all of them see plaintext, because from Shopify's perspective they are authorised.

So the question is never "is this encrypted". It is "who can read this in plaintext, and did I intend all of them to". On most stores the honest answer to the second half is no.

That gap is why the merchants who care about a specific field, a passport number, a wholesale trade licence, a date of birth, a health note attached to an order, end up encrypting it themselves before it ever reaches Shopify.

## Where sensitive data ends up in customer metafields

Metafields are the path of least resistance, which is exactly why sensitive values collect there.

The pattern is always the same. A store needs one field Shopify does not model natively. A developer adds `custom.trade_licence` or `custom.dob` to the customer record because it takes ten minutes. Two years later it holds twelve thousand values, three apps read it, and nobody remembers who decided the format.

In audit work the recurring examples are tax and business registration numbers on wholesale stores, dates of birth on age-restricted products, identity document references on high-value goods, and free-text notes on supplement and clinic stores that contain health information. Free-text notes are the worst of the group, because the schema says "note" and the contents say something a privacy regulator would call special category data.

Every one of those is personal data under GDPR and under Australian privacy law, which means the [customer data compliance obligations](/insights/shopify-customer-data-gdpr-compliance) apply to the metafield exactly as they apply to the email address.

### The storefront visibility trap

Metafield definitions carry access settings, and the storefront one deserves your full attention.

```graphql
mutation {
  metafieldDefinitionCreate(definition: {
    namespace: "custom"
    key: "trade_licence"
    ownerType: CUSTOMER
    type: "single_line_text_field"
    access: {
      admin: MERCHANT_READ
      storefront: NONE
    }
  }) { createdDefinition { id } }
}
```

Set `storefront` to `PUBLIC_READ` and that field becomes readable through the Storefront API, which is a public, unauthenticated surface by design. Themes and headless builds routinely request customer metafields in bulk, so a single permissive definition can put the value into rendered HTML without anyone writing a line of code to display it.

Audit this across every definition you own. Any customer metafield with public storefront read access should have a reason you can state out loud.

### App-owned namespaces

If you are building the app rather than configuring the store, use app-owned metafields with the reserved `$app:` prefix. Values in that namespace are readable only by the app that created them, not by other installed apps and not by the merchant's general API tokens. It is not encryption, but it removes an entire category of accidental reads, and it costs nothing.

## The envelope encryption pattern

If a value must live on the customer record and must not be readable by anything with `read_customers`, encrypt it in your application and store only ciphertext.

Envelope encryption is the standard shape. A key management service holds the master key, your app requests a data key per record, encrypts with it, and stores the encrypted data key alongside the ciphertext. The master key never leaves the KMS and never appears in your environment variables.

```js
import { createCipheriv, randomBytes } from "node:crypto";

// dataKey comes from your KMS, per record, plaintext + encrypted copy
function sealValue(plaintext, dataKey) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", dataKey.plaintext, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);

  return JSON.stringify({
    v: 1,
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    ct: ct.toString("base64"),
    dk: dataKey.encrypted.toString("base64"),
  });
}
```

Write that JSON string into a metafield typed `json` or `multi_line_text_field`. Three practical constraints:

- Keep a version marker in the payload. You will rotate the scheme eventually, and mixed-format records without a version field are painful to migrate.
- Base64 adds roughly a third to the size. Metafield text values cap at 65,535 characters, which is generous for a licence number and restrictive for a document blob. Store large items elsewhere and keep a reference in the metafield.
- GCM authenticates as well as encrypts. If the tag fails, the value was altered, and your app should treat that as an incident rather than a parse error.

The important property is not the algorithm. It is that the keys sit in your infrastructure, so a compromised Shopify session, an over-scoped app, or a staff export produces ciphertext instead of a licence number.

## Why encryption breaks apps, and how to avoid it

Encryption fails in production for boring reasons, not cryptographic ones. Something downstream expected to read the field.

The failure modes are predictable. Admin search stops matching, because Shopify indexes the ciphertext. Filters and segments built on the field return nothing. CSV exports hand an operations team a column of base64. Flow conditions comparing the value silently never fire. Liquid renders the blob on a page nobody checked. Support agents open a customer and see noise where a reference number used to be.

Four rules prevent nearly all of it.

Never encrypt a field another system needs to search, sort, filter, or segment on. If merchandising filters on it, encryption is the wrong tool and minimisation is the right one.

Keep a non-sensitive surrogate when staff need a handle. Last four characters, a hash prefix, or an internal reference lets a support agent confirm they have the right record without exposing the value.

Separate encrypted fields into their own namespace, `secure` or an app-owned one, so a future developer cannot mistake the payload for corrupted data. Document the format next to the definition.

Handle deletion. An encrypted metafield is still personal data, so it stays in scope for erasure requests and for the GDPR webhooks your app must honour. Crypto-shredding, destroying the data key so the ciphertext is unrecoverable, is a legitimate deletion mechanism, but only if you can prove which key belonged to which customer.

## What not to store in the first place

The strongest control is refusing the data. Every field you do not collect is a field that cannot leak, cannot appear in an export, and cannot show up in a breach notification.

Before adding any sensitive customer field, ask three questions. Does a business process actually consume this value, or was it collected because a form had space. Can a verification result replace the raw value, storing "trade licence verified, 2026-08-01" instead of the number itself. Does it need to live in Shopify at all, or can it sit in a purpose-built system with Shopify holding only a reference ID.

That third option is usually correct for regulated data. Shopify is a commerce platform with a broad and legitimate read surface. It is not designed to be a document vault, and treating it as one puts the data in reach of every app you install. The team at [Defyn Digital](https://defyn.com.au) starts most data reviews here, because the field that gets deleted needs no encryption strategy at all.

Whatever you keep, remember that access is the other half of the problem. Review which apps hold `read_customers` today and confirm each one still needs it, and if your store also handles payment-adjacent data, work through the [PCI compliance considerations for apps](/insights/shopify-pci-compliance-apps) alongside this. If you cannot list what your installed apps read and inject, [see how the audit works](/how-it-works) and start from the inventory.

## Common questions

### Does Shopify encrypt customer metafields?

Shopify encrypts data at rest across its platform, which includes metafields, and transmits everything over TLS. That protects against infrastructure-level compromise. It does not restrict authorised reads, so any app with `read_customers`, any staff member with customer permissions, and any export sees the plaintext value. If a field needs to be unreadable by those parties, the encryption has to happen in your own application before the value is written.

### Can other apps read my customer metafields?

Yes, in almost every case. A standard metafield in a namespace like `custom` is readable by any app holding the customer read scope, and merchants routinely have several such apps installed. The two exceptions are app-owned metafields using the reserved `$app:` prefix, which only the creating app can read, and definitions with restrictive admin access settings. Storefront access is separate and more dangerous, because `PUBLIC_READ` exposes the field through the unauthenticated Storefront API.

### Where should encryption keys live for a Shopify app?

Outside Shopify, in a key management service such as AWS KMS, Google Cloud KMS, or an equivalent, with the master key never leaving that service. Use per-record data keys and store the encrypted data key with the ciphertext. Never place a key in a metafield, a theme asset, an app proxy response, or an environment variable that a build log can capture. Rotation should be planned from day one, which is why the payload carries a version marker.

## Wrap-up

Shopify gives you encryption at rest and a wide-open read path on top of it, and the second part is what decides whether a sensitive customer field is actually protected. Start by auditing your metafield definitions for storefront access, because that is where the fastest and largest leaks live. Then minimise: delete fields no process consumes, and replace raw values with verification results where you can. For what survives, encrypt in your application with keys held outside Shopify, keep the format versioned and documented, and map every downstream consumer before you switch it on. The apps reading your customer data are the part of the surface most merchants never inventory, and they are the ones holding the plaintext.
