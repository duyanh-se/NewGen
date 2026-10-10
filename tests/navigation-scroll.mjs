import { chromium } from "@playwright/test";
import assert from "node:assert/strict";

// Run against a running app: BASE_URL=http://localhost:3000 node tests/navigation-scroll.mjs
const baseUrl = process.env.BASE_URL || "http://localhost:3000";
const routes = ["/gioi-thieu", "/nang-luc-xay-dung", "/du-an", "/blog", "/lien-he"];
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
    (process.platform === "win32" ? "C:/Program Files/Google/Chrome/Application/chrome.exe" : undefined),
  headless: true,
});

async function assertAtTop(page) {
  await page.locator(".menu-drawer").waitFor({ state: "hidden" });
  await page.locator(".website-intro").waitFor({ state: "hidden" });
  // Check after menu scroll restoration and any smooth scrolling have settled.
  await page.waitForTimeout(700);
  const state = await page.evaluate(() => {
    const topbar = document.querySelector(".topbar").getBoundingClientRect();
    const header = document.querySelector(".header");
    return {
      path: location.pathname,
      y: scrollY,
      topbarTop: topbar.top,
      topbarHeight: topbar.height,
      headerVisible: getComputedStyle(header).visibility === "visible",
      headerInert: header.inert,
    };
  });
  assert.equal(state.y, 0, `${state.path} must start at scrollY=0`);
  assert.equal(state.topbarTop, 0, `${state.path} must show the company topbar`);
  assert.ok(state.topbarHeight > 0);
  assert.equal(state.headerVisible, true);
  assert.equal(state.headerInert, false);
}

async function navigateFromScroll(page, href, mobile) {
  await page.evaluate(() => window.scrollTo({ top: 600, behavior: "instant" }));
  await page.waitForTimeout(700);
  assert.ok(await page.evaluate(() => scrollY > 0), "Start below the topbar");
  const floating = page.locator('.floating-menu[data-visible="true"]');
  if (await floating.count()) {
    await floating.click();
    await page.locator(`.drawer-links a[href="${href}"]`).click();
  } else if (mobile) {
    await page.locator(".menu-toggle").click();
    await page.locator(`.drawer-links a[href="${href}"]`).click();
  } else {
    await page.locator(`.navigation a[href="${href}"]`).click();
  }
  await page.waitForURL((url) => url.pathname === href);
  await assertAtTop(page);
}

try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.locator(".website-intro").waitFor({ state: "hidden" });
    for (const href of routes) {
      await navigateFromScroll(page, href, viewport.width <= 800);
      // Selecting the current route must also return to the top after the drawer closes.
      await navigateFromScroll(page, href, viewport.width <= 800);
    }
    // Revisit a cached route, then use the logo to return home.
    await navigateFromScroll(page, routes[0], viewport.width <= 800);
    await page.screenshot({ path: `tmp/navigation-scroll-${viewport.width}.png` });
    await page.evaluate(() => window.scrollTo({ top: 600, behavior: "instant" }));
    await page.locator(".brand").click();
    await page.waitForURL((url) => url.pathname === "/");
    await assertAtTop(page);
    // Existing direct section links still open at their section.
    await page.goto(`${baseUrl}/#nang-luc`, { waitUntil: "networkidle" });
    await page.waitForFunction(() => scrollY > 0);
    assert.ok(await page.evaluate(() => scrollY > 0));
    assert.equal(await page.evaluate(() => location.hash), "#nang-luc");
    assert.deepEqual(errors, []);
    console.log(`PASS ${viewport.width}px: navbar routes, current route, cached route, logo, section link`);
    await page.close();
  }
} finally {
  await browser.close();
}
