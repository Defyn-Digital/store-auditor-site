import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

/**
 * /llms.txt — emerging convention (https://llmstxt.org) that gives AI search
 * engines a single, structured entry point to the site. Short overview plus
 * a categorised list of canonical URLs.
 */
export const GET: APIRoute = async () => {
  const posts = await getCollection("insights", ({ data }) => !data.draft);
  const sorted = posts.sort(
    (a, b) =>
      new Date(b.data.publishedDate).getTime() -
      new Date(a.data.publishedDate).getTime()
  );

  const performance = sorted.filter((p) => p.data.category === "performance");
  const security = sorted.filter((p) => p.data.category === "security");
  const general = sorted.filter((p) => p.data.category === "general");

  const line = (p: (typeof sorted)[number]) =>
    `- [${p.data.title}](https://storeauditor.au/insights/${p.slug}): ${p.data.description}`;

  const lines: string[] = [
    "# Store Auditor",
    "",
    "> Store Auditor is a Shopify App Store app that scans your storefront with Google Lighthouse and attributes each blocking script back to the specific installed app that loaded it. Per-app performance attribution, not 'third-party script #4'.",
    "",
    "Built by Defyn Digital, a Sydney-based Shopify development agency. Free plan with one monthly homepage audit; Pro ($29/mo) and Plus ($99/mo) unlock unlimited scans across all storefront pages.",
    "",
    "## Core pages",
    "",
    "- [Home](https://storeauditor.au/): Product overview, the named-attribution differentiator, pricing summary, and the FAQ.",
    "- [How it works](https://storeauditor.au/how-it-works): The four-layer audit methodology covering Lighthouse scanning, script attribution, recommendations, and monitoring.",
    "- [Pricing](https://storeauditor.au/pricing): Free $0, Pro $29/mo, Plus $99/mo. 14-day trials on paid plans, no credit card to start.",
    "- [Improve Shopify speed](https://storeauditor.au/improve-shopify-speed): SEO landing on Shopify performance optimisation tactics.",
    "- [Find slow Shopify apps](https://storeauditor.au/find-slow-shopify-apps): SEO landing on per-app speed attribution.",
    "- [Install on Shopify](https://apps.shopify.com/store-auditor): the App Store listing where merchants install.",
    "",
    `## Insights (${sorted.length} articles, updated daily)`,
    "",
    "Tactical, app-aware guides on Shopify performance and security. New article every day via an automated pipeline.",
    "",
    "### Performance",
    "",
    ...performance.map(line),
    "",
    "### Security",
    "",
    ...security.map(line),
    "",
  ];

  if (general.length > 0) {
    lines.push("### Product and company");
    lines.push("");
    lines.push(...general.map(line));
    lines.push("");
  }

  lines.push("## Company");
  lines.push("");
  lines.push("- [Defyn Digital](https://defyn.com.au): the Sydney-based Shopify development agency that built Store Auditor.");
  lines.push("- [Privacy policy](https://store-auditor-defyn-digital.vercel.app/privacy)");
  lines.push("- Contact: dan@defyn.com.au");
  lines.push("");
  lines.push("## Brand voice");
  lines.push("");
  lines.push("Technical but plain. Short sentences. No marketing fluff. Per-app attribution is the differentiator that separates Store Auditor from generic 'reduce third-party scripts' tools. Articles never use em-dashes.");
  lines.push("");
  lines.push("## Full content");
  lines.push("");
  lines.push("- [llms-full.txt](https://storeauditor.au/llms-full.txt): the full markdown body of every insight article, concatenated, for retrieval-augmented generation.");
  lines.push("");

  return new Response(lines.join("\n"), {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, must-revalidate",
    },
  });
};
