import { chromium } from "@playwright/test";
import assert from "node:assert/strict";

// Run against a running app: BASE_URL=http://localhost:3000 node tests/capability-motion.mjs
const baseUrl = process.env.BASE_URL || "http://localhost:3000";
const route = `${baseUrl}/nang-luc-xay-dung`;
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
    (process.platform === "win32" ? "C:/Program Files/Google/Chrome/Application/chrome.exe" : undefined),
  headless: true,
});

const near = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 1, `${message}: ${actual} vs ${expected}`);
async function jump(page, top) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), top);
  await page.waitForTimeout(100);
}
const topOf = (locator) => locator.evaluate((node) => scrollY + node.getBoundingClientRect().top);
async function waitForAnchor(page, id, header) {
  await page.waitForFunction(({ id, header }) =>
    Math.abs(document.getElementById(id).getBoundingClientRect().top - header - 24) < 1,
  { id, header }, { timeout: 5000 });
}
const revealState = (locator) => locator.evaluate((node) => {
  const style = getComputedStyle(node.firstElementChild);
  return { opacity: Number(style.opacity), y: new DOMMatrixReadOnly(style.transform).m42 };
});
async function overflowCheck(page) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, "No horizontal page overflow");
}

try {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1000, height: 700 },
    { width: 390, height: 844 },
    { width: 320, height: 740 },
  ]) {
    const desktop = viewport.width >= 1000;
    const page = await browser.newPage({ viewport, hasTouch: !desktop, isMobile: !desktop });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(route, { waitUntil: "networkidle" });
    const root = page.locator("[data-capability-page]");
    await root.locator(":scope[data-capability-motion]").waitFor();
    assert.equal(await root.getAttribute("data-capability-motion"), desktop ? "full" : "light");
    assert.equal(await page.evaluate(() => scrollY), 0);
    near(await page.locator(".topbar").evaluate(node => node.getBoundingClientRect().top), 0, "Company topbar visible");
    assert.equal(await page.locator("[data-capability-type]").count(), 8);
    assert.equal(await page.locator("[data-capability-equipment]").count(), 19);
    assert.equal(await page.locator("[data-capability-machine]").count(), 12);
    await overflowCheck(page);

    const header = await page.locator("header").evaluate(node => node.offsetHeight);
    const hero = page.locator("[data-capability-hero]");
    const heroViewport = page.locator("[data-capability-hero-viewport]");
    if (desktop) {
      near(await hero.evaluate(node => node.offsetHeight), viewport.height * 1.8, "Hero stage reserves 180svh");
      const start = await topOf(hero) - header;
      const travel = await hero.evaluate(node => node.offsetHeight) - await heroViewport.evaluate(node => node.offsetHeight);
      const cover = () => root.evaluate(node => parseFloat(node.style.getPropertyValue("--hero-cover")));
      await jump(page, start);
      near(await cover(), 100, "First hero image");
      if (viewport.width === 1440) await page.screenshot({ path: "tmp/capability-motion-hero-start.png" });
      await jump(page, start + travel * 0.5);
      near(await cover(), 50, "Hero midpoint wipe");
      near((await heroViewport.boundingBox()).y, header, "Hero pins below navbar");
      assert.equal(await page.locator("#capability-title").evaluate(node => getComputedStyle(node).opacity), "1");
      if (viewport.width === 1440) await page.screenshot({ path: "tmp/capability-motion-hero-middle.png" });
      await jump(page, start + travel);
      near(await cover(), 0, "Second hero image");
      await jump(page, start + travel * 0.5);
      near(await cover(), 50, "Hero reverses to same midpoint");
      await page.mouse.move(viewport.width / 2, viewport.height / 2);
      const before = await page.evaluate(() => scrollY);
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(400);
      near(await page.evaluate(() => scrollY) - before, 100, "Wheel scrolling remains native");
    } else {
      assert.equal(await heroViewport.evaluate(node => getComputedStyle(node).position), "relative");
      assert.equal(await root.evaluate(node => node.style.getPropertyValue("--banner-shift")), "0px");
      await page.screenshot({ path: `tmp/capability-motion-hero-${viewport.width}.png` });
    }

    const card = page.locator("[data-capability-type]").first();
    const cardTop = await topOf(card);
    await jump(page, cardTop - viewport.height * 0.91);
    near((await revealState(card)).opacity, 0, "Card starts hidden below reveal band");
    near((await revealState(card)).y, desktop ? 24 : 12, "Responsive reveal distance");
    await jump(page, cardTop - viewport.height * 0.775);
    const middle = await revealState(card);
    assert.ok(middle.opacity > 0.4 && middle.opacity < 0.6, "Card partially visible at reveal midpoint");
    if (desktop) assert.ok((await revealState(page.locator("[data-capability-type]").nth(1))).opacity < middle.opacity, "Cards stagger left to right");
    await page.waitForTimeout(300);
    assert.deepEqual(await revealState(card), middle, "Reveal geometry stays stable without scrolling");
    await jump(page, cardTop - viewport.height * 0.65);
    near((await revealState(card)).opacity, 1, "Card fully visible for reading");
    near((await revealState(card)).y, 0, "Card returns to normal position");
    await page.screenshot({ path: `tmp/capability-motion-construction-${viewport.width}.png` });
    await jump(page, cardTop - viewport.height * 0.775);
    assert.deepEqual(await revealState(card), middle, "Reveal reverses exactly at same scroll position");

    await jump(page, 0);
    await page.getByRole("link", { name: "Khám phá năng lực", exact: true }).click();
    await waitForAnchor(page, "xay-dung", header);
    near(await page.locator("#xay-dung").evaluate(node => node.getBoundingClientRect().top), header + 24, "Explore anchor clears navbar");
    await page.goto(`${route}#may-moc`, { waitUntil: "networkidle" });
    await waitForAnchor(page, "may-moc", header);
    near(await page.locator("#may-moc").evaluate(node => node.getBoundingClientRect().top), header + 24, "Direct machinery anchor clears navbar");
    const shift = await root.evaluate(node => parseFloat(node.style.getPropertyValue("--banner-shift")));
    assert.ok(Math.abs(shift) <= 24, "Banner movement stays within 24px");
    const table = page.getByRole("region", { name: "Danh mục thiết bị" });
    assert.equal(await table.evaluate(node => getComputedStyle(node).transform), "none", "Equipment table stays still");
    if (!desktop) {
      await table.focus();
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(350);
      assert.ok(await table.evaluate(node => node.scrollLeft > 0), "Mobile equipment table scrolls with keyboard");
    }
    await page.screenshot({ path: `tmp/capability-motion-machinery-${viewport.width}.png` });

    const callout = root.locator('[data-capability-reveal]').last();
    await jump(page, await topOf(callout) - viewport.height * 0.95);
    await callout.getByRole("link").evaluate(node => node.focus({ preventScroll: true }));
    assert.equal((await revealState(callout)).opacity, 1, "Focused content is fully visible");
    near((await revealState(callout)).y, 0, "Keyboard focus removes movement");
    await callout.getByRole("link").evaluate(node => node.blur());
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForTimeout(100);
    assert.equal(await root.getAttribute("data-capability-motion"), null);
    assert.equal((await revealState(callout)).opacity, 1, "Reduced motion shows all content");
    assert.equal(await heroViewport.evaluate(node => getComputedStyle(node).position), "relative");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.waitForTimeout(100);
    assert.equal(await root.getAttribute("data-capability-motion"), desktop ? "full" : "light");
    if (desktop) {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(100);
      assert.equal(await root.getAttribute("data-capability-motion"), "light");
      await overflowCheck(page);
      await page.setViewportSize(viewport);
      await page.waitForTimeout(100);
      assert.equal(await root.getAttribute("data-capability-motion"), "full");
    }
    await overflowCheck(page);
    assert.deepEqual(errors, []);
    console.log(`PASS ${viewport.width}x${viewport.height}: hero, reversible reveal, anchors, focus, reduced motion, resize`);
    await page.close();
  }

  const noJs = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  await noJs.goto(route, { waitUntil: "networkidle" });
  assert.equal(await noJs.locator("[data-capability-page]").getAttribute("data-capability-motion"), null);
  const opacities = await noJs.locator("[data-capability-reveal] > *").evaluateAll(nodes => nodes.map(node => getComputedStyle(node).opacity));
  assert.ok(opacities.every(opacity => opacity === "1"), "No JavaScript still shows all content");
  await overflowCheck(noJs);
  await noJs.close();
  console.log("PASS no-JavaScript fallback");
} finally {
  await browser.close();
}
