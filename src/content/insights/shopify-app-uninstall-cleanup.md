---
title: "Shopify app uninstall cleanup: what apps leave behind"
description: "Shopify app uninstall cleanup is rarely complete. Script tags, theme blocks, and data can stay behind. Here is the post-uninstall audit that catches all of it."
primaryKeyword: "Shopify app uninstall cleanup"
secondaryKeywords:
  - "Shopify uninstalled app script tags"
  - "Shopify theme cleanup after uninstall"
  - "Shopify app residual data"
  - "Shopify storefront app remnants"
category: security
publishedDate: 2026-05-30
readingTime: 7
---

When you uninstall a Shopify app, Shopify revokes its access token and stops fulfilling its webhook subscriptions. That is most of what happens. It is not all of what should happen.

This is the post-uninstall audit we run on every store we audit at [Defyn Digital](https://defyn.com.au). It catches the script tags, theme blocks, ghost domains, and data residue that uninstalled apps leave behind, and it usually finds something.

## What Shopify actually does on uninstall

Three things happen when you click "Uninstall app" in Shopify Admin:

1. **The OAuth access token is revoked.** The app can no longer call your store's Admin API or Storefront API.
2. **Webhook subscriptions are unregistered.** The app stops receiving order, customer, or product events from your store.
3. **The `shop/redact` webhook is queued and sent 48 hours later.** This is the app's legal cue to delete your store's data from its own systems.

Three things that do not automatically happen on uninstall:

1. Script tags the app injected into your storefront are not always removed.
2. Theme App Extension blocks the app added to your theme are not removed.
3. Data the app exported, embedded in third-party tools, or replicated to your other apps is out of Shopify's reach entirely.

The gap between what Shopify does and what a complete cleanup looks like is where this audit lives.

## What apps usually leave behind

In our audit work, the most common residual artifacts are:

- **Orphan script tags.** A `script_tag` resource the app created via the Admin API and forgot to delete on uninstall. Still fires on every storefront page load.
- **Theme App Extension blocks.** Visible in your theme's `app-embed` or section configuration even though the app is no longer installed. Sometimes still functional, sometimes broken with console errors.
- **Inline liquid additions.** If a developer added a snippet to your theme on the app's instructions (common with chat widgets and review apps), that snippet stays unless you remove it.
- **External account links.** Many apps create an account on a third-party platform (Klaviyo, Yotpo, Postscript) and link to it. Uninstalling the Shopify app does not delete the third-party account.

Each one has a different fix.

## Step 1: audit your script tags

Open your Shopify Admin and use the GraphQL Admin API to list all `scriptTags`, or query `/admin/api/2024-10/script_tags.json`. Match each script's `src` against your currently installed apps.

Any script tag whose source URL belongs to an app you have uninstalled is an orphan. Delete it via the API or, if you cannot identify the source, contact the developer.

A practical sanity check: any script tag whose source domain you cannot link to a current app, an analytics tool you actively use, or your own infrastructure is suspect. Our deep-dive on [auditing the permissions your Shopify apps have](/insights/audit-shopify-app-permissions) covers how to map scope grants to specific apps. The same fingerprinting works for script tags.

## Step 2: audit your theme blocks (Theme App Extensions)

In your theme editor, open every page template that allows app blocks (header, footer, product page, cart page, checkout if you are on Plus). Look for blocks whose source is "App: {app-name}" where the app is no longer installed.

These blocks are the more visible residue. They sometimes still render UI (review widget placeholders, chat icons) and sometimes throw console errors. Either way, remove them from each template.

For embed-level blocks (Theme App Extensions registered as embeds rather than as section blocks), open Theme Settings and look for "App embeds". Disable any belonging to uninstalled apps.

## Step 3: audit your storefront for ghost app domains

This is the one most merchants miss.

Open your live storefront in an incognito Chrome window. Open DevTools, go to the Network tab, and reload the page. Filter by "JS" and "Other".

You are looking for requests to domains that:

- You do not recognize.
- Do not belong to your currently installed apps.
- Do not belong to your active analytics setup.

If you see one, trace its initiator. The initiator column tells you what triggered the request. Often it is a snippet of inline JavaScript that was added to your theme months ago by an app that has since been uninstalled.

Remove the initiator from your theme. The ghost domain will stop being called. [Store Auditor](/how-it-works) flags these as part of every scan so you do not have to do it by hand.

## Step 4: check data retention via the shop/redact webhook

Two days after uninstall, Shopify fires the `shop/redact` webhook to the app. The app is legally required to hard-delete any data it stored about your store.

In practice:

- **Compliant apps** delete the data and (sometimes) confirm via email or a status page.
- **Negligent apps** do not delete it but also do not respond to data requests.
- **Apps that no longer exist** at all because the developer disappeared cannot honor the webhook, so the data sits forever.

If the app handled customer personal data (PII), you may have a legal obligation under GDPR or CCPA to confirm deletion happened. Our piece on [Shopify customer data and GDPR compliance](/insights/shopify-customer-data-gdpr-compliance) covers what merchants are responsible for here.

The practical action: keep a list of apps you have uninstalled in the last 12 months. For any that touched PII, file a data deletion request directly with the developer 48 hours after uninstall. Get written confirmation.

## When to ask for manual deletion

Two scenarios warrant a direct request:

1. **The app handled customer data** and you operate in a GDPR or CCPA jurisdiction. The `shop/redact` webhook is the legal cue, but a written confirmation closes the loop in your records.
2. **The app stored merchant-facing artifacts** like exported product CSVs, scheduled reports, or saved configurations that you do not want sitting on a vendor system. These are often outside the `shop/redact` scope.

A short email to the developer's support address with your store URL and "data deletion request following uninstall" usually gets a response within a few days. If it does not, you have evidence for any later compliance conversation.

## Wrap-up

Uninstalling a Shopify app is not the same as removing it. Shopify revokes access, but script tags, theme blocks, ghost domain calls, and stored data can all linger. The four-step audit above takes about 30 minutes and is worth running on any store that has uninstalled more than 5 apps in its lifetime.

If you want this done at scale across many stores, [Defyn Digital](https://defyn.com.au) runs it as part of our standard store audit. If you want to monitor your storefront for orphan scripts on an ongoing basis, [Store Auditor](/how-it-works) flags them as part of the regular scan output.
