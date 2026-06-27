---
title: "Shopify Staff Account Permissions: Role-Based Access Control for Teams"
description: "Shopify staff account permissions let you control who sees what in your store. Learn how to configure role-based access that protects customer data and reduces breach risk."
primaryKeyword: "Shopify staff account permissions"
secondaryKeywords:
  - "Shopify staff permissions best practices"
  - "role-based access control Shopify"
  - "Shopify team member permissions security"
  - "least privilege access Shopify store"
  - "configure Shopify staff roles"
category: security
publishedDate: 2026-06-28
readingTime: 9
---

Shopify staff account permissions are access controls that determine which team members can view, edit, or manage specific parts of your store, reducing security risk by limiting each person to only the data and functions they need for their role.

## Key takeaways

- Shopify Plus stores get custom staff permissions, while standard plans have five fixed roles (store owner, staff, limited staff, contractor, and collaborator).
- The principle of least privilege means giving each team member the minimum access required to do their job, nothing more.
- Staff accounts with full access to customer data create PCI compliance obligations and increase your liability in a data breach.
- Regular permission audits catch orphaned accounts from former employees and contractors who retain access months after leaving.
- Third-party apps often request broader permissions than staff accounts, making [app permission audits](/insights/audit-shopify-app-permissions) equally critical.

## Understanding Shopify's built-in staff roles

Shopify provides different permission frameworks depending on your plan tier. Standard plans (Basic, Shopify, Advanced) offer five preset roles. You cannot customize these roles or create new ones.

The **store owner** role has unrestricted access to everything: products, orders, customer data, settings, billing, staff management. Only one person can hold this role. Transfer happens through Shopify Support.

The **staff** role grants access to most store functions except billing, plan changes, and staff management. Staff members see all orders, all customer records, and can modify most settings. This role is too broad for most team members.

The **limited staff** role restricts access to specific sections you choose: orders, products, customers, analytics, or marketing. A warehouse employee might get orders-only access. A content writer might get products-only access.

The **contractor** role provides temporary access with an expiration date. Contractors can access whatever sections you enable, but their permissions automatically revoke after 90 days. Useful for freelance developers or seasonal help.

The **collaborator** role exists for partner agencies and developers. Collaborators access your store through their own Shopify Partner account. They see only what you explicitly grant: theme editing, app installation, or specific admin sections. Collaborator accounts do not count against your staff limit.

Shopify Plus stores get granular custom permissions. You can create roles that allow editing products but not deleting them, or viewing orders but not refunding them. This flexibility matters for larger teams with specialized functions.

## Implementing least-privilege access control

The principle of least privilege is simple: give people exactly what they need, no more. A customer service representative needs to view orders and issue refunds. They do not need to see your profit margins in analytics or edit shipping settings.

Start by mapping roles to job functions. List every team member and what they actually do daily. A social media manager needs product images and descriptions. They do not need access to customer email addresses or order histories.

For standard Shopify plans, limited staff roles work for most positions. Grant access section by section. Your inventory manager gets products and orders. Your marketing coordinator gets marketing, discounts, and analytics (but not customer data if you can avoid it).

Avoid the temptation to give everyone staff-level access "to make things easier." Easier for who? Not for you when a compromised account exports your entire customer database. Not for your customers when their payment information leaks. Not for your compliance officer when auditors ask why a graphic designer had access to credit card data.

Document your permission decisions. Create a spreadsheet that maps each team member to their role and the business justification. When someone asks for broader access, you have a reference point. When an auditor asks why someone has access to customer data, you have an answer.

Review permissions quarterly. People change roles. Responsibilities shift. The person who needed full order access six months ago might now work exclusively on content. Update their permissions to match their current function.

## Customer data access and PCI compliance

Customer data access creates compliance obligations. If your staff can see full credit card numbers (they cannot in Shopify, but they can see last four digits, cardholder names, and billing addresses), you have PCI DSS responsibilities.

Shopify handles most PCI compliance for you, but staff access to customer payment information changes the equation. The fewer people who can access customer data, the smaller your compliance scope. Smaller scope means fewer controls to implement and audit.

Limit customer data access to roles that genuinely need it: customer service, order fulfillment, fraud review. Your product photographer does not need it. Your blog writer does not need it. Your social media manager does not need it.

For stores that need to maintain [PCI compliance across multiple apps](/insights/shopify-pci-compliance-apps), staff permissions are one piece of a larger puzzle. Apps often request customer data access that staff members would never get. Apply the same least-privilege thinking to app permissions.

Consider data export capabilities separately. Some roles need to view customer records but should not be able to export thousands of records to CSV. Shopify Plus lets you control export permissions. Standard plans do not, so you rely on role selection.

Log access to sensitive data. Shopify Plus stores can enable audit logs that track who viewed what and when. Standard plans get basic timeline entries for major actions (order edits, product changes) but not granular view logs. If detailed audit trails matter for your compliance posture, factor that into your plan decision.

## Managing contractor and agency access

Contractors and agencies need temporary access for specific projects. A developer building a custom feature needs theme access and maybe app installation rights. They do not need to see your sales data or customer lists.

Use collaborator accounts for external partners whenever possible. Collaborators log in through their Shopify Partner account, which creates a clear separation from your staff. You can revoke collaborator access instantly without changing passwords or worrying about shared credentials.

Set explicit expiration dates for contractor access. Shopify's contractor role expires automatically after 90 days, but you should review and revoke earlier if the project finishes. Do not leave contractor accounts active "just in case" you need them again.

Never share the store owner password with contractors. Create a collaborator or staff account with the minimum permissions they need. When the project ends, revoke the account. If you shared the owner password, they still have it.

For agencies that need ongoing access (like a retained marketing agency), create a dedicated collaborator account rather than giving them a staff login. Collaborator accounts make it clear they are external partners, not internal team members. This distinction matters for audit trails and accountability.

Document what each contractor or agency can access and why. When you have five different agencies with different permission sets, a spreadsheet prevents confusion. It also helps when the next person on your team needs to understand who has access to what.

## Auditing and revoking permissions

Permission audits catch orphaned accounts. An employee leaves in January. Their account stays active until someone remembers to revoke it in June. Five months of unnecessary risk.

Schedule quarterly permission reviews. Export your staff list. Compare it to your current team roster. Anyone who left the company should have their account deactivated immediately, not eventually.

Check for accounts that have never logged in. You created an account for a contractor who never started the project. The account sits there with full permissions, unused and forgotten. Revoke it.

Look for permission creep. Someone got temporary elevated access for a one-time project. The project finished. The elevated permissions stayed. Bring them back to their standard role.

Test your revocation process. Can you actually disable an account in under five minutes? Do you know where the controls are? Have you done it recently enough to remember? Run a drill. Create a test account, then revoke it. Time how long it takes.

For stores built and managed by [Defyn](https://defyn.com.au), we include staff permission audits in our quarterly security reviews. We check for orphaned accounts, excessive permissions, and shared credentials. Most stores we audit have at least two accounts that should have been revoked months earlier.

## Common questions

### How many staff accounts can I have on Shopify?

Basic Shopify plans include two staff accounts. Shopify plan includes five accounts. Advanced Shopify includes 15 accounts. Shopify Plus includes unlimited accounts. These limits count only staff and limited staff roles, not collaborators. Collaborator accounts are unlimited on all plans. If you need more staff accounts than your plan includes, you can either upgrade your plan or convert some team members to collaborator accounts through a Shopify Partner.

### Can I see who changed what in my Shopify store?

Shopify tracks major changes in the Timeline section of your admin. You can see who edited a product, who fulfilled an order, or who changed a setting. The timeline shows the staff member's name and timestamp. Shopify Plus stores get more detailed audit logs that track additional actions. Standard plans have more limited timeline entries. Neither plan logs every single page view or customer record access. For detailed activity monitoring, you need third-party audit tools.

### What happens to orders when I remove a staff member?

Removing a staff member does not affect orders they processed. Orders remain in your system with their original data. The timeline entries for those orders still show the staff member's name, even after you delete their account. Customer-facing order confirmations and shipping notifications are not affected. The staff member loses access to your admin panel immediately upon account deletion, but historical data they created stays intact.

## Wrap-up

Shopify staff account permissions are your first line of defense against internal data exposure. Apply least-privilege access: give each person only what they need for their specific role. Review permissions quarterly to catch orphaned accounts and permission creep. Treat contractor and agency access as temporary by default. Combine staff permission discipline with regular [app permission audits](/insights/audit-shopify-app-permissions) for comprehensive access control. The five minutes you spend configuring permissions correctly prevents the five months you would spend dealing with a data breach.

For stores on [/how-it-works](how-it-works), Store Auditor flags staff permission risks alongside app permission issues, giving you a complete picture of who and what can access your customer data.
