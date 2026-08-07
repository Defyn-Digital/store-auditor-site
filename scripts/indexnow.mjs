#!/usr/bin/env node
/**
 * Submit URLs to IndexNow so participating search engines get notified the
 * moment content is published, instead of waiting for their crawlers.
 *
 * Participating engines: Bing, Yandex, Seznam, Naver, Yep (one submission to
 * the shared endpoint fans out to all of them). Google does NOT participate in
 * IndexNow: Google discovery comes from the sitemap and Search Console.
 *
 * Usage:
 *   node scripts/indexnow.mjs https://storeauditor.au/insights/some-slug [more urls...]
 *   node scripts/indexnow.mjs --all     # submit every URL in the live sitemap
 *
 * The key below is PUBLIC by design: it is hosted at KEY_LOCATION so the search
 * engines can verify we control the domain. Safe to commit.
 */

const HOST = "storeauditor.au";
const KEY = "c0d6e6df0424bd15f1c963d5781bd299";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/indexnow";
const SITEMAP = `https://${HOST}/sitemap-0.xml`;

async function urlsFromSitemap() {
  const res = await fetch(SITEMAP);
  if (!res.ok) throw new Error(`sitemap fetch failed: ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function main() {
  const args = process.argv.slice(2);
  const urls =
    args.length === 0 || args[0] === "--all" ? await urlsFromSitemap() : args;

  if (urls.length === 0) {
    console.error("IndexNow: no URLs to submit.");
    process.exit(1);
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList: urls,
    }),
  });

  const text = (await res.text()).trim();
  console.log(
    `IndexNow: submitted ${urls.length} URL(s) -> HTTP ${res.status} ${res.statusText}`,
  );
  if (text) console.log(`Response: ${text}`);

  // 200 OK or 202 Accepted both mean success.
  if (res.status !== 200 && res.status !== 202) {
    console.error("IndexNow submission may have failed.");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("IndexNow error:", e.message);
  process.exit(1);
});
