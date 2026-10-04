import { test, expect } from "@playwright/test";

for (const width of [1440, 768, 390, 320]) {
  test(`Signatur works at ${width}px, including the contact form`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: 950 });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-concept", "signature");
    await expect(page.locator(".concept-bar")).toHaveCount(0);
    await expect(page.locator("[data-hero='signature']")).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator(".brand-logo")).toHaveCount(2);
    await expect(page.locator(".brand-logo").first()).toHaveAttribute("src", "/img/helle-drop.svg");
    await expect(page.locator(".hiring-banner, .careers-teaser")).toHaveCount(0);
    await expect(page.locator(".button-primary").first()).toHaveCSS("background-color", "rgb(102, 54, 117)");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const contact = page.locator("#contact");
    await expect(contact.getByRole("link", { name: /40 40 36 81/ })).toHaveAttribute("href", "tel:+4740403681");
    await expect(contact.getByRole("link", { name: /post@helleas.no/ })).toHaveAttribute("href", "mailto:post@helleas.no");
    await expect(contact.getByRole("form")).toBeVisible();
    await expect(contact.getByLabel("Namn", { exact: true })).toBeVisible();
    await expect(contact.getByRole("button", { name: "Send melding" })).toBeVisible();
    await contact.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("production stays on Signatur despite old preferences and links", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("helle-concept", "copper"));
  await page.goto("/?concept=nordic");
  await expect(page.locator("html")).toHaveAttribute("data-concept", "signature");
  await expect(page.locator(".concept-bar")).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index, follow");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https:\/\/helleas\.no\/?$/);
  const robots = await page.request.get("/robots.txt");
  expect(await robots.text()).toContain("Sitemap: https://helleas.no/sitemap.xml");
  expect(await robots.text()).not.toMatch(/Disallow: \/\s*$/m);
  const sitemap = await page.request.get("/sitemap.xml");
  expect(await sitemap.text()).toContain("<loc>https://helleas.no/</loc>");
});

test("mobile navigation opens, navigates, and closes with Escape", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Opne meny" }).click();
  await expect(page.getByRole("navigation", { name: "Hovudmeny" })).toBeVisible();
  await page.getByRole("navigation").getByRole("link", { name: "Tenester" }).click();
  await expect(page).toHaveURL(/#services/);
  await expect(page.getByRole("button", { name: "Opne meny" })).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("button", { name: "Opne meny" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Opne meny" })).toHaveAttribute("aria-expanded", "false");
});

test("photo gallery expands and the lightbox supports keyboard dismissal", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".project-card")).toHaveCount(3);
  await page.getByRole("button", { name: "Sjå alle bileta" }).click();
  await expect(page.locator(".project-card")).toHaveCount(6);
  await page.locator(".project-card").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator(".project-card").first()).toBeFocused();
  await page.getByRole("button", { name: "Vis færre bilete" }).click();
  await expect(page.locator(".project-card")).toHaveCount(3);
});

test("content and native contact form work without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://localhost:3000/");
  await expect(page.locator("h1:visible")).toHaveText(/Vatn\. Varme\./);
  await expect(page.locator(".story-chapter:visible")).toHaveCount(4);
  await page.locator(".hero-actions").getByRole("link", { name: "Kontakt oss" }).click();
  await expect(page.locator("#contact form")).toHaveAttribute("method", "POST");
  await expect(page.locator("#contact form")).toHaveAttribute("action", "/takk.html");
  await expect(page.getByLabel("Kva kan me hjelpa deg med?", { exact: true })).toBeVisible();
  await context.close();
});

test("scroll story progresses, reverses, and supports chapter navigation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto("/");
  const story = page.locator(".craft-story");
  await expect(story).toHaveAttribute("data-cinematic", "true");
  const scrollToProgress = async (progress: number) => {
    await story.evaluate((element, fraction) => {
      const scene = element.querySelector(".story-scene") as HTMLElement;
      const top = parseFloat(getComputedStyle(scene).top);
      const start = window.scrollY + element.getBoundingClientRect().top - top;
      window.scrollTo({ top: start + (element.clientHeight - scene.clientHeight) * fraction, behavior: "instant" });
    }, progress);
  };
  for (const [progress, chapter] of [[0.05, "0"], [0.35, "1"], [0.6, "2"], [0.95, "3"], [0.1, "0"]] as const) {
    await scrollToProgress(progress);
    await expect(story).toHaveAttribute("data-chapter", chapter);
    await expect(page.locator(".story-chapter[aria-hidden='true']")).toHaveCount(3);
    const actual = await story.evaluate((element) => parseFloat((element as HTMLElement).style.getPropertyValue("--story-progress")));
    expect(actual).toBeCloseTo(progress, 2);
  }
  await page.getByRole("button", { name: "04 KVARDAGEN" }).focus();
  await page.keyboard.press("Enter");
  await expect(story).toHaveAttribute("data-chapter", "3");
  await page.locator(".story-skip").click();
  await expect(page).toHaveURL(/#services/);
});

test("reduced motion and short viewports use readable, unpinned story chapters", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".craft-story")).toHaveAttribute("data-cinematic", "false");
  await expect(page.locator(".story-chapter:visible")).toHaveCount(4);
  await expect(page.locator(".story-scene")).toHaveCSS("position", "relative");
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  // A preference change while the page is open must also work.
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator(".craft-story")).toHaveAttribute("data-cinematic", "true");
  await page.setViewportSize({ width: 390, height: 600 });
  await expect(page.locator(".craft-story")).toHaveAttribute("data-cinematic", "false");
  await expect(page.locator(".story-chapter:visible")).toHaveCount(4);
});
