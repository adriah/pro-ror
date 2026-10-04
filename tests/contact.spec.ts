import { test, expect } from "@playwright/test";

async function fillEnquiry(page: import("@playwright/test").Page) {
  await page.getByLabel("Namn", { exact: true }).fill("Ola Ødegård");
  await page.getByLabel("E-post", { exact: true }).fill("ola@example.com");
  await page.getByLabel("Kva kan me hjelpa deg med?", { exact: true }).fill("Me vil pussa opp badet. Kan de ta kontakt?");
}

test("enquiry is encoded, sent once, and acknowledged after acceptance", async ({ page }) => {
  let submissions = 0;
  let release!: () => void;
  const pending = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/__forms.html", async (route) => {
    submissions++;
    const request = route.request();
    expect(request.method()).toBe("POST");
    expect(request.headers()["content-type"]).toBe("application/x-www-form-urlencoded");
    const data = new URLSearchParams(request.postData()!);
    expect(data.get("form-name")).toBe("kontakt");
    expect(data.get("name")).toBe("Ola Ødegård");
    expect(data.get("email")).toBe("ola@example.com");
    expect(data.get("message")).toContain("pussa opp badet");
    expect(data.get("bot-field")).toBe("");
    await pending;
    await route.fulfill({ status: 200, body: "Accepted" });
  });
  await page.goto("/#contact");
  await fillEnquiry(page);
  await page.getByRole("button", { name: "Send melding" }).click();
  await expect(page.getByRole("button", { name: "Sender …" })).toBeDisabled();
  await expect(page.getByRole("status")).toContainText("Meldinga di blir send");
  release();
  await expect(page.getByRole("status")).toContainText("Me har fått meldinga di");
  await expect(page.getByLabel("E-post", { exact: true })).toHaveValue("");
  expect(submissions).toBe(1);
});

test("failed delivery preserves the message, gives contact alternatives, and supports retry", async ({ page }) => {
  let submissions = 0;
  await page.route("**/__forms.html", async (route) => {
    await route.fulfill({ status: ++submissions === 1 ? 503 : 200, body: "" });
  });
  await page.goto("/#contact");
  await fillEnquiry(page);
  await page.getByRole("button", { name: "Send melding" }).click();
  await expect(page.getByRole("status")).toContainText("Me fekk ikkje stadfesta");
  await expect(page.getByRole("status").getByRole("link", { name: "40 40 36 81" })).toHaveAttribute("href", "tel:+4740403681");
  await expect(page.getByLabel("Kva kan me hjelpa deg med?", { exact: true })).toHaveValue(/pussa opp badet/);
  await page.getByRole("button", { name: "Send melding" }).click();
  await expect(page.getByRole("status")).toContainText("Me har fått meldinga di");
  expect(submissions).toBe(2);
});

test("required fields and invalid email prevent a network submission", async ({ page }) => {
  let submissions = 0;
  await page.route("**/__forms.html", async (route) => { submissions++; await route.fulfill({ status: 200 }); });
  await page.goto("/#contact");
  await page.getByRole("button", { name: "Send melding" }).click();
  await expect(page.getByLabel("Namn", { exact: true })).toBeFocused();
  await fillEnquiry(page);
  await page.getByLabel("E-post", { exact: true }).fill("invalid-address");
  await page.getByRole("button", { name: "Send melding" }).click();
  await expect(page.getByLabel("E-post", { exact: true })).toBeFocused();
  expect(submissions).toBe(0);
});

test("the deployment form declares every submitted field and the spam trap", async ({ page }) => {
  await page.goto("/");
  const fields = await page.locator("#contact [name]").evaluateAll((elements) => elements.map((e) => e.getAttribute("name")).filter((name) => name !== "kontakt"));
  await page.goto("/__forms.html");
  const declaration = page.locator('form[name="kontakt"]');
  await expect(declaration).toHaveAttribute("data-netlify", "true");
  await expect(declaration).toHaveAttribute("data-netlify-honeypot", "bot-field");
  expect(await declaration.locator("[name]").evaluateAll((elements) => elements.map((e) => e.getAttribute("name")))).toEqual(expect.arrayContaining(fields));
});
