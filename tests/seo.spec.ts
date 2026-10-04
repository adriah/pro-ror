import { test, expect } from "@playwright/test";

test("homepage SEO is present in static HTML and its sharing image resolves", async ({ request }) => {
  const response = await request.get("/");
  expect(response.ok()).toBe(true);
  const html = await response.text();
  expect(html).toContain("<title>Røyrleggjar på Bømlo – bad, vatn og varme | Helle AS</title>");
  expect(html).toMatch(/rel="canonical" href="https:\/\/helleas\.no\/?"/);
  expect(html).toMatch(/name="description" content="[^"]*røyrleggjar på Bømlo/);
  expect(html).toMatch(/property="og:url" content="https:\/\/helleas\.no\/?"/);
  expect(html).toContain('name="twitter:card" content="summary_large_image"');
  expect(html).toContain("Helle AS er din lokale røyrleggjar på Bømlo");
  expect(html).not.toContain("24/7");

  const jsonLd = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1]);
  const business = jsonLd["@graph"].find((entity: { "@type": string }) => entity["@type"] === "Plumber");
  expect(business.telephone).toBe("+4740403681");
  expect(business.areaServed.name).toBe("Bømlo");
  expect(business.hasOfferCatalog.itemListElement).toHaveLength(4);
  expect(business.contactPoint.hoursAvailable).toBeUndefined();

  const imageUrl = html.match(/property="og:image" content="([^"]+)"/)![1];
  const image = await request.get(new URL(imageUrl).pathname);
  expect(image.ok()).toBe(true);
  expect(image.headers()["content-type"]).toContain("image/png");
  const png = await image.body();
  expect(png.readUInt32BE(16)).toBe(1200);
  expect(png.readUInt32BE(20)).toBe(630);
});

test("utility pages expose noindex to crawlers and stay out of the sitemap", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).not.toContain("Disallow:");
  for (const path of ["/takk.html", "/__forms.html"]) {
    const response = await request.get(path);
    expect(response.ok()).toBe(true);
    const html = await response.text();
    expect(html).toMatch(/<meta name="robots" content="noindex, nofollow"/);
    expect(html).not.toMatch(/rel="canonical" href="https:\/\/helleas.no\/"/);
  }
  const sitemap = await request.get("/sitemap.xml");
  const xml = await sitemap.text();
  expect(xml).toContain("<loc>https://helleas.no/</loc>");
  expect(xml).not.toMatch(/takk|__forms/);
});
