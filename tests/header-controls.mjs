import { chromium } from "@playwright/test";
import assert from "node:assert/strict";

// Run against the local app: node tests/header-controls.mjs
const baseUrl = process.env.BASE_URL || "http://localhost:3000";
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
    (process.platform === "win32" ? "C:/Program Files/Google/Chrome/Application/chrome.exe" : undefined),
  headless: true,
});

async function assertReturnedToTop(page) {
  await page.waitForFunction(() => scrollY === 0);
  await page.waitForTimeout(300);
  assert.equal(await page.evaluate(() => scrollY), 0);
  assert.equal(await page.evaluate(() => document.activeElement.id), "site-top");
  assert.equal(await page.locator("[data-back-to-top]").isVisible(), false);
  assert.equal(await page.locator(".header").evaluate((el) => el.inert), false);
}

try {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1024, height: 768 },
    { width: 900, height: 700 },
    { width: 390, height: 844 },
    { width: 320, height: 740 },
    { width: 844, height: 390 },
  ]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${baseUrl}/gioi-thieu`, { waitUntil: "networkidle" });
    const button = page.locator("[data-back-to-top]");
    assert.equal(await button.isVisible(), false);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    if (viewport.width > 1000) {
      const links = await page.locator(".navigation > a").evaluateAll((elements) =>
        elements.map((el) => ({ left: el.getBoundingClientRect().left, right: el.getBoundingClientRect().right, height: el.getBoundingClientRect().height })),
      );
      assert.ok(links.every((link) => link.left >= 0 && link.right <= viewport.width && link.height >= 44));
      assert.equal(await page.locator('.navigation a[aria-current="page"]').getAttribute("href"), "/gioi-thieu");
    } else {
      const trigger = page.locator(".menu-toggle");
      await trigger.click();
      await page.locator(".menu-drawer").waitFor({ state: "visible" });
      await page.locator(".drawer-close").focus();
      await page.keyboard.press("Tab");
      assert.equal(await page.evaluate(() => !!document.activeElement.closest(".menu-drawer")), true);
      await page.keyboard.press("Escape");
      await page.locator(".menu-drawer").waitFor({ state: "hidden" });
      await page.waitForFunction(() => document.activeElement === document.querySelector(".menu-toggle"));
    }
    await page.evaluate(() => window.scrollTo({ top: 1500, behavior: "instant" }));
    await button.waitFor({ state: "visible" });
    const bounds = await button.boundingBox();
    assert.ok(bounds.width >= 44 && bounds.height >= 44);
    await button.focus();
    await page.keyboard.press("Enter");
    await assertReturnedToTop(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.evaluate(() => window.scrollTo({ top: 1200, behavior: "instant" }));
    await button.waitFor({ state: "visible" });
    await button.click();
    assert.equal(await page.evaluate(() => scrollY), 0, "Reduced motion returns instantly");
    await assertReturnedToTop(page);
    assert.deepEqual(errors, []);
    console.log(`PASS ${viewport.width}x${viewport.height}: header, drawer focus, keyboard scroll, reduced motion`);
    await page.close();
  }

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.locator(".website-intro").waitFor({ state: "hidden" });
  const button = page.locator("[data-back-to-top]");
  for (const transition of ["section", "about"]) {
    await page.evaluate((name) => {
      const target = document.querySelector(name === "section" ? ".foundation" : ".about-overlap");
      const y = target.getBoundingClientRect().top + scrollY;
      window.scrollTo({ top: name === "section" ? y : y - document.querySelector(".foundation").offsetHeight, behavior: "instant" });
    }, transition);
    await button.waitFor({ state: "visible" });
    await page.waitForTimeout(300);
    await page.evaluate((name) => window.dispatchEvent(new WheelEvent("wheel", { deltaY: name === "section" ? -80 : 80, cancelable: true })), transition);
    await page.waitForFunction((name) => document.documentElement.hasAttribute(`data-${name}-transition`), transition);
    await button.click();
    await assertReturnedToTop(page);
    await page.waitForTimeout(1000);
    assert.equal(await page.evaluate(() => scrollY), 0, "Cancelled scroll flight must not resume");
    console.log(`PASS homepage: back-to-top interrupts ${transition} transition`);
  }
  await page.close();
} finally {
  await browser.close();
}
