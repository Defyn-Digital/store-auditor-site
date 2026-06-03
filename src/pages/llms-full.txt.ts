import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

/**
 * /llms-full.txt — full markdown of every insight article concatenated, for
 * retrieval-augmented generation (RAG) and AI training citation. Regenerates
 * automatically on every build so it stays in sync with the daily blog.
 */
export const GET: APIRoute = async () => {
  const posts = await getCollection("insights", ({ data }) => !data.draft);
  const sorted = posts.sort(
    (a, b) =>
      new Date(b.data.publishedDate).getTime() -
      new Date(a.data.publishedDate).getTime()
  );

  const lines: string[] = [
    "# Store Auditor — full content for LLMs",
    "",
    "> Store Auditor is a Shopify App Store app built by Defyn Digital. It scans storefronts with Google Lighthouse and attributes each blocking script back to the specific named app that loaded it. This file contains the full text of every insight article published on storeauditor.au for citation by AI search engines and inclusion in retrieval-augmented generation pipelines.",
    "",
    `Last build: ${new Date().toISOString()}`,
    `Total articles: ${sorted.length}`,
    "",
    "Each section below is one article. The H2 is the title, followed by URL, publish date, category, description, and the full markdown body.",
    "",
    "---",
    "",
  ];

  for (const post of sorted) {
    const publishedYMD = post.data.publishedDate.toISOString().slice(0, 10);
    lines.push(`## ${post.data.title}`);
    lines.push("");
    lines.push(`URL: https://storeauditor.au/insights/${post.slug}`);
    lines.push(`Published: ${publishedYMD}`);
    lines.push(`Category: ${post.data.category}`);
    lines.push(`Primary keyword: ${post.data.primaryKeyword}`);
    lines.push(`Description: ${post.data.description}`);
    lines.push("");
    lines.push(post.body.trim());
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return new Response(lines.join("\n"), {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, must-revalidate",
    },
  });
};
