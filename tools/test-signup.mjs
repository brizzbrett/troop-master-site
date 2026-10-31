// Submits the live site's signup form once with the given address and reports what happened.
// Usage: node tools/test-signup.mjs you@example.com [site-url]
import { chromium } from "playwright";

const email = process.argv[2];
const url = process.argv[3] ?? "https://lordofthesmores.com/";
if (!email) { console.error("usage: node tools/test-signup.mjs you@example.com [site-url]"); process.exit(1); }

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
const log = [];
page.on("console", (m) => log.push(`console ${m.type()}: ${m.text()}`));
page.on("response", async (r) => {
  if (r.url().includes("/forms/")) log.push(`response ${r.status()} ${r.url()} ${await r.text().catch(() => "(unreadable)")}`.slice(0, 400));
});
page.on("requestfailed", (r) => log.push(`failed ${r.url()} ${r.failure()?.errorText}`));
context.on("page", (p) => log.push(`new tab opened (fallback post): ${p.url()}`));

await page.goto(url, { waitUntil: "networkidle" });
const form = page.locator("form[data-signup]").first();
await form.locator("input[type=email]").fill(email);
await form.locator("button[type=submit]").click();
await page.waitForTimeout(5000);
console.log("status line:", await form.locator("[data-signup-status]").textContent());
console.log(log.join("\n") || "(no network or console events)");
await browser.close();
