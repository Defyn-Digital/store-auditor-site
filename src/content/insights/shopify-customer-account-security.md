---
title: "Shopify Customer Account Security: New Account System Requirements for 2026"
description: "Shopify customer account security changed with new extensible accounts in 2024. Learn authentication requirements, migration steps, and compliance controls to protect customer data."
primaryKeyword: "Shopify customer account security"
secondaryKeywords:
  - "Shopify new customer accounts authentication"
  - "Shopify extensible customer accounts security"
  - "Shopify customer login security requirements"
  - "Shopify account migration security checklist"
  - "Shopify customer data breach prevention"
category: security
publishedDate: 2026-07-10
readingTime: 9
---

Shopify customer account security is the set of authentication, authorization, and data protection controls that protect customer login credentials and personal information stored in your Shopify store, now governed by Shopify's new extensible customer accounts system that replaced classic accounts in 2024.

## Key takeaways

- Shopify's new customer accounts system uses OAuth 2.0 and OpenID Connect for authentication instead of password-only logins, providing stronger security through token-based sessions.
- Merchants must migrate from classic customer accounts to new customer accounts by December 2026 to maintain security compliance and access to modern authentication features.
- New customer accounts separate authentication (handled by Shopify) from authorization (controlled by merchants), reducing the attack surface for credential theft.
- Multi-factor authentication (MFA) is available in new customer accounts but requires manual enablement in your store settings under customer privacy preferences.
- Customer data encryption standards remain unchanged at AES-256 for data at rest, but session tokens now expire after 90 days of inactivity instead of remaining valid indefinitely.

## What changed in Shopify's account security model

Shopify launched new customer accounts in February 2024 as a replacement for the classic account system that had been in place since 2006. The architectural shift moves authentication from a password-stored-in-database model to a federated identity model.

Classic accounts stored bcrypt-hashed passwords in Shopify's database. When a customer logged in, Shopify compared the submitted password hash against the stored hash. This works but creates a single point of failure. If an attacker compromised the database, they gained access to all password hashes.

New customer accounts use OAuth 2.0. Shopify acts as the identity provider. When a customer logs in, Shopify issues a JSON Web Token (JWT) that proves identity. The store validates the token signature but never sees the password. This separates concerns: Shopify handles authentication, merchants handle what authenticated users can do.

The token-based approach also enables session management improvements. Classic accounts used cookies that persisted until manually cleared. New accounts issue tokens that expire after 90 days of inactivity. An abandoned session automatically invalidates.

For developers building custom storefronts, the authentication flow changed completely. Classic accounts required posting credentials to `/account/login`. New accounts require redirecting to Shopify's OAuth endpoint, receiving an authorization code, then exchanging it for an access token. This adds steps but follows industry-standard patterns that security tools already understand.

## Migration requirements and timeline

Shopify set a hard deadline of December 31, 2026 for migrating to new customer accounts. Stores still using classic accounts after that date will have authentication automatically migrated, which may break custom login implementations.

The migration process has three phases. First, enable new customer accounts in your store settings under customer privacy. This activates the new authentication system but does not disable classic accounts. Both systems run in parallel.

Second, update your theme or headless storefront to use the new login endpoints. For themes, this means updating the customer account templates to use the new Liquid objects (`customer_login_link`, `customer_account_link`). For headless builds, implement the OAuth flow using the Storefront API.

Third, test the login flow with real customer accounts. Create test accounts, log in, verify session persistence, test password reset, and confirm that customer data displays correctly in the account dashboard. Across the 80+ stores we have audited, the most common migration issue is broken password reset emails because the new system uses different email templates.

Stores using custom authentication (third-party login providers, SSO integrations) face additional work. The new system does not support delegated authentication in the same way classic accounts did. You must either migrate to Shopify's authentication or build a custom solution using the Customer Account API.

## Security controls merchants must configure

Enabling new customer accounts does not automatically enable all security features. Merchants must manually configure several controls.

Multi-factor authentication (MFA) is available but off by default. Enable it in Settings > Customer privacy > Customer account login. When enabled, customers can add TOTP authenticator apps or SMS-based codes as a second factor. The implementation uses standard TOTP (RFC 6238), compatible with Google Authenticator, Authy, and 1Password.

Session timeout configuration sits in the same settings panel. The default is 90 days of inactivity, but you can reduce it to 30 or 7 days for stores handling sensitive data. Financial services stores and stores selling age-restricted products should use shorter timeouts.

Account lockout policies protect against brute-force attacks. New customer accounts lock an account after 10 failed login attempts within 10 minutes. The lockout lasts 30 minutes. This is not configurable but matches OWASP recommendations for consumer applications.

Email verification for new accounts is mandatory in new customer accounts. Classic accounts allowed customers to register without verifying their email. New accounts send a verification email immediately and block login until the customer clicks the link. This prevents account enumeration attacks where attackers test if email addresses exist in your system.

Password requirements tightened slightly. Classic accounts required 5 characters minimum. New accounts require 8 characters. There is no maximum length, no required character classes, and no password expiration. This aligns with NIST SP 800-63B guidelines that prioritize length over complexity.

## Integration with GDPR and PCI compliance

Customer account security directly impacts compliance obligations. The new account system changes how you meet those obligations.

For GDPR, the right to erasure (Article 17) now works differently. When a customer requests account deletion, Shopify deletes the authentication credentials immediately but retains order history for 90 days to handle refunds and disputes. Classic accounts retained credentials until you manually deleted them. More details on GDPR customer data handling are in our [Shopify customer data GDPR compliance](/insights/shopify-customer-data-gdpr-compliance) guide.

Data portability (Article 20) improved. New customer accounts include a self-service export feature in the account dashboard. Customers download their data as JSON without merchant intervention. Classic accounts required merchants to manually export data.

For PCI compliance, new customer accounts reduce scope. Because Shopify handles all authentication and stores no payment credentials in customer accounts, your store's PCI footprint shrinks. If you use Shop Pay or Shopify Payments exclusively, you may qualify for SAQ A instead of SAQ A-EP. Our [Shopify PCI compliance apps](/insights/shopify-pci-compliance-apps) article covers the full scope reduction process.

Session security matters for PCI. The new token-based sessions use HttpOnly and Secure flags on cookies, preventing JavaScript access and requiring HTTPS. This satisfies PCI DSS 4.0 requirement 8.2.8 for session security.

## Monitoring and incident response

New customer accounts include better logging but you must configure where logs go. Shopify stores authentication events (logins, logouts, password resets, MFA enrollments) in the customer timeline. Access this via the Shopify admin under Customers > [customer name] > Timeline.

For automated monitoring, use the Customer Account API to query authentication events. The API exposes a `customerAccessTokens` query that lists all active sessions for a customer. You can build alerts for unusual patterns: logins from new countries, multiple concurrent sessions, or rapid password changes.

Incident response procedures changed. If you suspect account compromise, you can now revoke all active sessions for a customer via the API. Classic accounts required password resets, which did not invalidate existing sessions. The new revocation takes effect within 60 seconds globally.

Shopify also added account recovery improvements. If a customer loses access to their email and MFA device, they can request account recovery through Shopify Support. The process requires verifying order history and payment method details. This replaces the old approach where merchants handled recovery manually, which created support burden and security risk.

For stores built on headless architectures, [Defyn](https://defyn.com.au) can implement custom monitoring dashboards that aggregate authentication events with performance metrics and error logs, providing a unified view of customer account health.

## Common questions

### How long does migration to new customer accounts take?

Migration duration depends on your store's customization level. Standard themes using default customer account templates can migrate in 2 to 4 hours by enabling new accounts, updating theme templates, and testing the login flow. Custom themes with heavily modified account pages require 8 to 16 hours to rebuild templates using new Liquid objects and test edge cases. Headless stores need 20 to 40 hours to implement the OAuth flow, update API calls, handle token refresh, and build account management UI. Budget additional time for stores with third-party authentication integrations or custom account features.

### Can customers use the same password after migration?

Yes, existing customer passwords remain valid after migrating to new customer accounts. Shopify transfers the password hashes from the classic account database to the new authentication system during migration. Customers log in with their existing credentials without forced password resets. However, the next time a customer changes their password, the new system enforces the 8-character minimum instead of the classic 5-character minimum. Customers with passwords shorter than 8 characters can still log in but must create a longer password when they next update it.

### Does the new account system work with headless Shopify stores?

New customer accounts work with headless stores through the Storefront API and Customer Account API. The authentication flow requires redirecting customers to Shopify's OAuth endpoint at `https://shopify.com/[store-id]/auth/oauth/authorize`, receiving an authorization code, then exchanging it for an access token via the token endpoint. The access token authenticates Storefront API requests to query customer data and manage account details. You must implement token refresh logic because access tokens expire after 24 hours. The Customer Account API provides additional endpoints for session management, MFA enrollment, and account deletion that are not available in the Storefront API. Check Shopify's API documentation for the complete OAuth implementation guide.

## Wrap-up

Shopify's new customer account security system represents a fundamental architecture change from password-based to token-based authentication. The migration deadline of December 2026 gives merchants time to update themes and test flows, but the work is not optional. Enable new accounts now, configure MFA and session timeouts, update your login implementation, and test thoroughly with real customer accounts. The security improvements (token expiration, OAuth standard, better session management) outweigh the migration effort. Start your migration at [Shopify's customer account settings](/how-it-works) or contact [Defyn](https://defyn.com.au) for implementation support on custom storefronts.
