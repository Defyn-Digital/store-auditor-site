---
title: "Shopify Passwordless Login: How the Email Code Really Works"
description: "Shopify passwordless login explained: how the one-time email code flow works, the threat model it changes, and the controls that keep customer accounts safe."
primaryKeyword: "Shopify passwordless login"
secondaryKeywords:
  - "Shopify customer accounts one-time code"
  - "Shopify new customer accounts security"
  - "Shopify Customer Account API token"
  - "Shopify email code login threat model"
  - "Shopify customer login phishing"
category: security
publishedDate: 2026-10-19
readingTime: 8
---

Shopify did not make customer login safer by removing the password, it moved the entire risk into the customer's email inbox, and most merchants have never adjusted for that.

## Key takeaways

- Shopify's customer accounts authenticate with a one-time code emailed to the customer. There is no stored password to steal, reuse, or crack.
- That kills credential stuffing, which in audit work is the single most common route into customer accounts on classic password-based stores.
- It also makes the email inbox the only factor. Whoever controls the inbox controls the store account, with no second barrier behind it.
- Real-time phishing still works. A code relayed to an attacker inside its validity window is as good as a password.
- Apps reach these accounts through the Customer Account API with short-lived tokens. Inventory which apps hold that access before you assume the surface is small.

## How the email code flow actually works

The flow is deliberately short. A customer clicks login, enters an email address, and Shopify sends a six-digit code to that address. They enter the code and they are in. No password field appears anywhere in the sequence.

Three details matter more than the steps.

The login page is hosted by Shopify, not by your theme. Customer accounts live on a `shopify.com/<shop_id>/account` URL, so the credential surface sits on Shopify's infrastructure rather than yours. Your theme links into it:

```liquid
{% if shop.customer_accounts_enabled %}
  {% if customer %}
    <a href="{{ routes.account_url }}">Account</a>
    <a href="{{ routes.account_logout_url }}">Log out</a>
  {% else %}
    <a href="{{ routes.account_login_url }}">Log in</a>
  {% endif %}
{% endif %}
```

Use those route objects rather than hardcoding a path. Shopify changes the destination underneath them, and a hardcoded `/account/login` is how stores end up sending customers to a page that no longer authenticates anyone.

The code is short-lived and single-use. It expires within minutes and burns on first successful entry. That window is the security control doing most of the work, and it is also the exact window an attacker needs to operate inside.

Accounts are created implicitly. There is no separate signup with a password to choose. A customer who has never had an account gets one the moment they complete a code login, which is good for conversion and means your customer record count will not tell you who has actually authenticated.

### The session that gets issued

After the code is accepted, Shopify issues a session for that customer. Sessions persist across visits on the same browser, which is why customers rarely see the code prompt twice on their own device.

The practical consequence is that a shared or public device keeps someone logged in long after they walk away. There is no password re-prompt to catch it. If your store shows order history, saved addresses, or stored payment references behind the account, a visible logout link in the header is a real control, not a nicety.

## The threat model changed, it did not disappear

Passwordless is a genuine security upgrade. It is not the end of the conversation.

### What it removes

Credential stuffing stops working. Attackers buy breach dumps and replay them against store logins at scale precisely because customers reuse passwords. With no password to replay, the entire category is gone. Phishing pages that harvest a password and use it later are gone with it, because there is no durable secret to harvest.

Merchant-side password handling also disappears. You are not storing hashes, not fielding reset flows, not making decisions about password policy. That reduces both the breach surface and the compliance surface.

### What it adds

Email account takeover becomes total account takeover. Previously an attacker needed the password, or the inbox plus a reset. Now the inbox alone is sufficient, and there is nothing behind it. Customers with weak or unprotected email accounts inherit exactly that weakness at your store.

Real-time relay phishing works. An attacker prompts the victim on a fake login page, triggers a genuine code from Shopify, and asks for it while it is still valid. The customer receives an authentic Shopify email, which makes the page feel legitimate. The short expiry limits the attack to an attended session rather than preventing it.

Availability becomes a security-adjacent problem. If the code email lands in spam or arrives four minutes late, customers cannot log in. In practice that pushes support teams toward manual identity workarounds, and improvised verification over live chat is a weaker control than anything the login flow was replacing.

Enumeration changes shape. A login form that behaves differently for known and unknown addresses tells an attacker which of their email list are your customers. Shopify's hosted page is built to avoid that. Any custom login UI you build on top of the Customer Account API can reintroduce it in a single conditional.

## Where apps fit into this surface

Customer accounts are reachable programmatically through the Customer Account API, which is a distinct surface from the Admin API and worth understanding separately.

Apps and headless storefronts act on behalf of a logged-in customer using a short-lived access token obtained through OAuth against that customer session. The token is scoped to that one customer, not to your whole customer list.

```bash
curl -X POST \
  "https://shopify.com/$SHOP_ID/account/customer/api/2026-07/graphql" \
  -H "Content-Type: application/json" \
  -H "Authorization: $CUSTOMER_ACCESS_TOKEN" \
  -d '{"query":"{ customer { emailAddress { emailAddress } orders(first: 5) { nodes { name } } } }"}'
```

Two rules follow from the shape of that token. It never belongs in client-side storage that survives the session or in a URL, because a leaked token is a live session for a real person. And it should never be exchanged for broader access: an app that responds to a customer request by reading through the Admin API instead is quietly operating with far more reach than the customer granted.

That is the part merchants consistently miss. Passwordless login secures the front door while installed apps hold keys to the whole building through separate scopes. Any app with customer read access sees the same records whether or not the customer ever types a code, so [audit which apps hold customer permissions](/insights/audit-shopify-app-permissions) as a companion exercise rather than assuming the login change covered it. The tokens, the sessions, and the emailed codes are all personal data too, which puts them inside the same [customer data compliance obligations](/insights/shopify-customer-data-gdpr-compliance) as the order record.

## What merchants should actually configure

Five things are worth doing, and none of them take long.

Check your theme uses `routes.account_login_url` everywhere rather than a hardcoded path. Grep the theme. Hardcoded account paths are common in older sections and in third-party blocks.

Verify code emails are actually arriving. Send a test to a Gmail address, an Outlook address, and one on your own domain, and check the spam folder in each. Confirm your sender domain has SPF, DKIM, and DMARC aligned, because notification deliverability degrades quietly and nobody reports it as a bug.

Give support a scripted answer for "I never got the code" that does not involve bypassing authentication. Resend, check spam, confirm the address spelling. Full stop.

Put a visible logout control in the account area and the header. It is the only defence against a session left open on a shared device.

Tell customers, once, in plain language, that you will never ask for their login code by phone, chat, or email reply. Shopify sends the code and only the customer should ever see it. A single line in the account area is cheap and it undercuts the most effective attack against this flow. The team at [Defyn Digital](https://defyn.com.au) treats that sentence as part of the login implementation rather than as marketing copy.

## Common questions

### Is Shopify passwordless login more secure than a password?

For most stores, yes. It eliminates credential stuffing, password reuse, and stored hashes, which together account for the majority of real customer account compromises. The trade-off is concentration: the customer's email account becomes a single point of failure with nothing behind it. A customer with a well-protected inbox is meaningfully safer than they were with a password. A customer with a weak, unprotected inbox is not.

### Can customers still use a password on my Shopify store?

Classic customer accounts, the older password-based system, still exist on some stores, and Shopify has been steadily moving merchants onto the newer passwordless customer accounts. Check which one your store runs in the admin under customer account settings before you write any documentation, because the login URL, the theme integration, and the API surface all differ between them.

### What happens if a customer loses access to their email?

They lose access to the account, and that is by design. There is no secondary factor and no password fallback to recover through. Order history can still be retrieved by support through the admin, but the customer cannot authenticate as themselves until they control that inbox again. This is worth stating in your help content, because it is the single most common support case the flow generates.

## Wrap-up

Passwordless login removes the attack most stores were actually losing accounts to, and replaces it with a narrower one that depends on catching a customer inside a few-minute window. Get the theme routes right, confirm the code emails deliver, keep the logout control visible, and say plainly that you will never ask for the code. Then look past the login page: the apps holding customer scopes see the same data regardless of how anyone signs in, which is the larger and less visible half of the surface. If you have not inventoried what your installed apps read and inject, [see how a store audit works](/how-it-works) and start from there.
