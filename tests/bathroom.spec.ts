import { test, expect } from "@playwright/test";

test("a real room assembles on scroll on desktop and phone", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 1440 ? 950 : 844 });
    await page.goto("/");
    const story = page.locator(".craft-story");
    await expect(story).toHaveAttribute("data-cinematic", "true");
    for (const progress of [0.04, 0.34, 0.66, 0.97]) {
      await story.evaluate((element, fraction) => {
        const scene = element.querySelector(".story-scene") as HTMLElement;
        const top = parseFloat(getComputedStyle(scene).top);
        window.scrollTo({ top: window.scrollY + element.getBoundingClientRect().top - top + (element.clientHeight - scene.clientHeight) * fraction, behavior: "instant" });
      }, progress);
      await expect(story).toHaveAttribute("data-renderer", "ready", { timeout: 20_000 });
      await expect(story).toHaveAttribute("data-chapter", String(Math.floor(progress * 4)));
      await expect(page.locator(".story-canvas canvas")).toBeVisible();
      await expect(page.locator(".story-timeline")).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      // Let the intentional copy / colour transitions settle for visual review.
      await page.waitForTimeout(1200);
      await page.screenshot({ path: testInfo.outputPath(`room-${width}-${progress}.png`) });
      const box = await page.locator(".story-controls").boundingBox();
      expect(box!.y + box!.height).toBeLessThan(width === 1440 ? 950 : 844);
    }
  }
  expect(errors).toEqual([]);
});

test("unavailable WebGL keeps every chapter readable", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type.startsWith("webgl") || type === "experimental-webgl") return null;
      return original.apply(this, [type, ...args] as Parameters<typeof original>);
    } as typeof original;
  });
  await page.goto("/#handverket");
  await expect(page.locator(".craft-story")).toHaveAttribute("data-renderer", "fallback");
  await expect(page.locator(".story-fallback .story-chapter:visible")).toHaveCount(4);
  await expect(page.locator(".story-scene")).toHaveCSS("position", "relative");
});
