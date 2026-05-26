// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Public site URL — replace with the real domain once purchased.
// Vercel will inject the actual host at build time when deployed.
const SITE = process.env.PUBLIC_SITE_URL || "https://storeauditor.au";

export default defineConfig({
  site: SITE,
  trailingSlash: "never",
  integrations: [
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
  build: {
    // Inline small assets, optimize for cold-start performance
    inlineStylesheets: "auto",
  },
  vite: {
    build: {
      // esbuild's default CSS minifier ships with Vite; no extra deps.
      cssMinify: "esbuild",
    },
  },
});
