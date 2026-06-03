import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

/**
 * RSS feed at /rss.xml — content syndication for humans (Feedly, Inoreader)
 * and AI search crawlers. Regenerates on every build via the daily blog
 * pipeline.
 */
export const GET: APIRoute = async (context) => {
  const posts = await getCollection("insights", ({ data }) => !data.draft);
  const sorted = posts.sort(
    (a, b) =>
      new Date(b.data.publishedDate).getTime() -
      new Date(a.data.publishedDate).getTime()
  );

  return rss({
    title: "Store Auditor Insights",
    description:
      "Tactical guides on Shopify performance and security. Per-app attribution, no fluff. By Defyn Digital.",
    site: context.site ?? "https://storeauditor.au",
    items: sorted.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishedDate,
      description: post.data.description,
      link: `/insights/${post.slug}/`,
      categories: [post.data.category],
    })),
    customData: [
      `<language>en-au</language>`,
      `<copyright>Defyn Digital</copyright>`,
      `<managingEditor>dan@defyn.com.au (Defyn Digital)</managingEditor>`,
      `<webMaster>dan@defyn.com.au (Defyn Digital)</webMaster>`,
    ].join("\n    "),
  });
};
