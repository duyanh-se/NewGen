// Run: node tests/project-motion.mjs. Builds a temporary app using a local read-only fixture.
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import http from "node:http";
import { cp, mkdtemp, readFile, rm, symlink } from "node:fs/promises";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";

const appPort = Number(process.env.PROJECT_TEST_PORT || 3106);
const fixturePort = Number(process.env.PROJECT_TEST_DB_PORT || 3107);
const base = `http://localhost:${appPort}`;
const uuid = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const images = new Map();
function media(n, file) {
  const path = `image-${n}.webp`;
  images.set(path, file);
  return { id: uuid(n), path, alt: `Công trình NewGen ${n}`, mime_type: "image/webp", size_bytes: 1000, state: "ready", created_at: "2026-01-01T00:00:00Z" };
}
const paragraph = (text) => ({ type: "paragraph", content: [{ type: "text", text }] });
const projects = Array.from({ length: 14 }, (_, i) => {
  const n = i + 1;
  return {
    id: uuid(n), slug: `cong-trinh-${n}`, name: `Công trình NewGen ${String(n).padStart(2, "0")}`,
    description: "Công trình nhà xưởng với giải pháp thi công từ kết cấu đến hoàn thiện.",
    type: "Nhà xưởng", location: "Bắc Ninh", owner: "Chủ đầu tư kiểm thử", area: 12000, year: 2026,
    construction_status: "completed", featured: false, status: "published", seo_title: "", seo_description: "",
    created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z",
    published_at: new Date(Date.UTC(2026, 0, 15 - n)).toISOString(),
    cover: n === 1 ? null : media(n + 100, n % 2 ? "pic23.webp" : "pic24.webp"),
    images: n === 2 ? ["pic21.webp", "pic27.webp", "pic30.webp"].map((file, position) => ({ position, media: media(200 + position, file) })) : n === 3 ? [{ position: 0, media: media(203, "pic21.webp") }] : n === 4 ? ["pic21.webp", "pic27.webp"].map((file, position) => ({ position, media: media(204 + position, file) })) : [],
    content: { type: "doc", content: Array.from({ length: n === 2 ? 20 : 2 }, () => paragraph("NewGen triển khai thi công kết cấu và hoàn thiện công trình. ".repeat(5))) },
  };
});
const user = { id: uuid(999), aud: "authenticated", role: "authenticated", email: "admin@example.test", app_metadata: {}, user_metadata: {}, created_at: "2026-01-01T00:00:00Z" };
const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
const token = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: user.id, aud: "authenticated", role: "authenticated", exp: Math.floor(Date.now() / 1000) + 86400 })}.fixture`;
let scenario = "normal";
const requests = [];
const fixture = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${fixturePort}`);
    requests.push({ method: req.method, path: url.pathname });
    assert.equal(req.method, "GET", "Fixture must never receive content writes");
    if (url.pathname.startsWith("/storage/v1/object/public/content-images/")) {
      const file = images.get(url.pathname.split("/").pop());
      if (!file) { res.writeHead(404); res.end(); return; }
      res.setHeader("Content-Type", "image/webp");
      res.end(await readFile(new URL(`../public/images/${file}`, import.meta.url)));
      return;
    }
    res.setHeader("Content-Type", "application/json");
    if (url.pathname === "/auth/v1/user") { res.end(JSON.stringify(user)); return; }
    let rows = [];
    if (url.pathname === "/rest/v1/admin_users") rows = [{ user_id: user.id }];
    if (url.pathname === "/rest/v1/projects") {
      rows = scenario === "empty" ? [] : projects.map(project => scenario === "no-cover" ? { ...project, cover: null, images: [] } : project);
      if (scenario === "four") rows = rows.slice(0, 4);
      rows = rows.filter(row => ["slug", "id", "status"].every(key => !url.searchParams.has(key) || String(row[key]) === url.searchParams.get(key).slice(3)));
    }
    const total = rows.length;
    const offset = Number(url.searchParams.get("offset") || 0);
    const limit = Number(url.searchParams.get("limit") || total);
    rows = rows.slice(offset, offset + limit);
    res.setHeader("Content-Range", `${offset}-${Math.max(offset, offset + rows.length - 1)}/${total}`);
    res.end(JSON.stringify((req.headers.accept || "").includes("vnd.pgrst.object") ? rows[0] || null : rows));
  } catch (error) { res.writeHead(500); res.end(JSON.stringify({ message: error.message })); }
});

let app, browser, fixtureApp;
let logs = "";
const near = (actual, expected, label, tolerance = 1) => assert.ok(Math.abs(actual - expected) < tolerance, `${label}: ${actual} vs ${expected}`);
async function jump(page, top) {
  await page.evaluate(top => window.scrollTo({ top, behavior: "instant" }), top);
  await page.waitForTimeout(100);
}
const absoluteTop = (locator) => locator.evaluate(node => scrollY + node.getBoundingClientRect().top);
const activeRoot = (page) => page.locator("[data-project-page]:visible");
const cardState = (card) => card.evaluate(node => {
  const photo = node.querySelector("[data-project-media]");
  const style = getComputedStyle(photo);
  const meta = getComputedStyle(node);
  return { clip: style.clipPath, opacity: Number(meta.opacity), y: new DOMMatrixReadOnly(meta.transform).m42 };
});
async function ready(page) {
  await page.waitForFunction(() => [...document.querySelectorAll("[data-project-page]")].some(node => node.getBoundingClientRect().height > 0 && node.dataset.projectMotion));
}
async function atTop(page) {
  await page.waitForTimeout(700);
  assert.equal(await page.evaluate(() => scrollY), 0, "Navigation starts at page top");
  near(await page.locator(".topbar").evaluate(node => node.getBoundingClientRect().top), 0, "Company topbar visible");
}
async function overflow(page) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, "No horizontal page overflow");
}

try {
  await new Promise(resolve => fixture.listen(fixturePort, "127.0.0.1", resolve));
  fixtureApp = await mkdtemp(path.join(tmpdir(), "newgen-project-motion-"));
  for (const file of ["src", "package.json", "package-lock.json", "tsconfig.json", "next.config.ts", "postcss.config.mjs"]) {
    await cp(path.resolve(file), path.join(fixtureApp, file), { recursive: true });
  }
  for (const directory of ["node_modules", "public"]) await symlink(path.resolve(directory), path.join(fixtureApp, directory), "junction");
  const next = path.resolve("node_modules/next/dist/bin/next");
  const options = {
    cwd: fixtureApp, windowsHide: true,
    env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: `http://localhost:${fixturePort}`, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "fixture-key" },
  };
  console.log("Building isolated fixture app…");
  await new Promise((resolve, reject) => {
    const build = spawn(process.execPath, [next, "build", "--webpack"], options);
    build.stdout.on("data", chunk => { logs += chunk; });
    build.stderr.on("data", chunk => { logs += chunk; });
    build.once("error", reject);
    build.once("exit", code => code === 0 ? resolve() : reject(new Error(`Fixture build exited: ${code}`)));
  });
  app = spawn(process.execPath, [next, "start", "--port", String(appPort)], options);
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Fixture app startup timed out")), 20000);
    app.stdout.on("data", chunk => { logs += chunk; if (chunk.toString().includes("Ready")) { clearTimeout(timer); resolve(); } });
    app.stderr.on("data", chunk => { logs += chunk; });
    app.once("exit", code => { clearTimeout(timer); reject(new Error(`Fixture app exited: ${code}`)); });
  });
  browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (process.platform === "win32" ? "C:/Program Files/Google/Chrome/Application/chrome.exe" : undefined), headless: true });

  for (const viewport of [
    { width: 1440, height: 900 }, { width: 1000, height: 700 },
    { width: 390, height: 844, touch: true }, { width: 320, height: 740, touch: true },
    { width: 1440, height: 650 }, { width: 1024, height: 768, touch: true },
  ]) {
    const full = viewport.width >= 1000 && viewport.height >= 700 && !viewport.touch;
    const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height }, hasTouch: !!viewport.touch, isMobile: !!viewport.touch });
    await page.addInitScript(() => {
      window.projectEntrances = [];
      const animate = Element.prototype.animate;
      Element.prototype.animate = function (frames, options) {
        if (this.matches("[data-project-card]")) window.projectEntrances.push({ href: this.getAttribute("href"), delay: options.delay });
        return animate.call(this, frames, options);
      };
    });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(`${base}/du-an`, { waitUntil: "networkidle" });
    await ready(page);
    const root = activeRoot(page);
    assert.equal(await root.getAttribute("data-project-motion"), full ? "full" : "light");
    assert.equal(await root.locator(".inner-project").count(), 14, "All projects are present, including those after the former page boundary");
    assert.equal(await root.locator(".content-pagination").count(), 0, "Project list has no pagination");
    assert.ok((await root.locator(".inner-project").last().getAttribute("href")).endsWith("cong-trinh-14"), "Last project is included in original order");
    assert.equal(await root.locator(".inner-project-grid").evaluate(node => getComputedStyle(node).gridTemplateColumns.split(" ").length), viewport.width >= 1200 ? 3 : viewport.width > 700 ? 2 : 1, "Responsive project columns");
    if (viewport.touch) assert.equal(await root.locator("[data-project-card-details]").first().evaluate(node => getComputedStyle(node).visibility), "visible", "Touch devices show information without hover");
    assert.equal(await root.locator("[data-project-stage], .inner-heading").count(), 0, "Project list starts without a hero section");
    assert.equal(await root.locator("h1").textContent(), "Các công trình của NewGen.");
    assert.ok((await root.locator(".inner-project").first().getAttribute("href")).endsWith("cong-trinh-1"), "Project ordering unchanged");
    await atTop(page);
    await overflow(page);
    const initialEntrances = await page.evaluate(() => window.projectEntrances);
    assert.ok(initialEntrances.some(entry => entry.href === "/du-an/cong-trinh-1"), "First visible project animates on page load");
    if (viewport.width > 700) assert.ok(initialEntrances[1].delay > initialEntrances[0].delay, "Visible projects enter in sequence");
    const keyboardCard = root.locator(".inner-project").nth(10);
    await keyboardCard.evaluate(node => node.focus({ preventScroll: true }));
    assert.equal((await cardState(keyboardCard)).opacity, 1, "Keyboard focus shows the card immediately");
    assert.equal(await keyboardCard.evaluate(node => node.getAnimations().length), 0, "Keyboard focus has no entrance delay");
    await keyboardCard.evaluate(node => node.blur());
    if ([1440, 390, 320].includes(viewport.width) && viewport.height !== 650) await page.screenshot({ path: `tmp/project-list-${viewport.width}.png` });
    const header = await page.locator(".header").evaluate(node => node.offsetHeight);
    const card = root.locator(".inner-project").nth(12);
    const top = await absoluteTop(card);
    await jump(page, top - viewport.height * .99);
    const entrances = () => page.evaluate(() => window.projectEntrances.filter(entry => entry.href === "/du-an/cong-trinh-13").length);
    assert.equal(await entrances(), 0, "Offscreen project has not animated yet");
    await jump(page, top - viewport.height * .75);
    const middle = await cardState(card);
    assert.ok(middle.opacity > 0 && middle.opacity < 1, "Whole project fades in");
    assert.ok(middle.y > 0 && middle.y < 24, "Whole project rises gently");
    assert.equal(await entrances(), 1);
    await page.waitForTimeout(650);
    near((await cardState(card)).opacity, 1, "Card fully visible");
    near((await cardState(card)).y, 0, "Card settles in its normal position");
    if (viewport.width === 390) await page.screenshot({ path: "tmp/project-grid-390.png" });
    if (viewport.width === 1440 && viewport.height === 900) {
      await page.screenshot({ path: "tmp/project-grid-1440.png" });
      const second = root.locator(".inner-project").nth(1);
      const details = second.locator("[data-project-card-details]");
      assert.equal(await details.evaluate(node => getComputedStyle(node).visibility), "hidden", "Basic information stays tucked away");
      const heightBeforeHover = await second.evaluate(node => node.offsetHeight);
      await second.hover(); await page.waitForTimeout(250);
      assert.equal(await details.evaluate(node => getComputedStyle(node).visibility), "visible", "Hover shows basic information");
      assert.equal(await details.locator("dt").count(), 4);
      assert.equal(await second.evaluate(node => node.offsetHeight), heightBeforeHover, "Hover preserves grid layout");
      await page.screenshot({ path: "tmp/project-card-hover-1440.png" });
      near(await second.locator("img").evaluate(node => Number(getComputedStyle(node).scale)), 1.035, "Hover image zoom", .001);
      near(await second.locator("h2 svg").evaluate(node => new DOMMatrixReadOnly(getComputedStyle(node).transform).m41), 4, "Hover arrow shift");
      await page.mouse.move(0, 0);
    }
    await jump(page, top - viewport.height * .95);
    await jump(page, top - viewport.height * .75);
    assert.equal(await entrances(), 1, "Returning to a project does not replay its entrance");
    assert.equal((await cardState(card)).opacity, 1);
    await jump(page, top - viewport.height * .95);
    await card.evaluate(node => node.focus({ preventScroll: true }));
    await page.waitForTimeout(250);
    assert.equal(await card.locator("[data-project-card-details]").evaluate(node => getComputedStyle(node).visibility), "visible", "Keyboard focus shows basic information");
    assert.equal((await cardState(card)).opacity, 1); assert.ok(!(await cardState(card)).clip.includes("100%"), "Focused card fully visible");
    await card.evaluate(node => node.blur());
    await jump(page, 0);
    await page.goto(`${base}/du-an#danh-sach-du-an`, { waitUntil: "networkidle" }); await ready(page);
    await page.waitForFunction(header => Math.abs(document.getElementById("danh-sach-du-an").getBoundingClientRect().top - header - 24) < 1, header);
    await page.goto(`${base}/du-an?page=2`, { waitUntil: "networkidle" }); await ready(page); await atTop(page);
    assert.equal(await activeRoot(page).locator("[data-project-stage]").count(), 0, "Legacy pagination URL also starts with the project list");
    assert.equal(await activeRoot(page).locator(".inner-project").count(), 14);
    assert.equal(await activeRoot(page).locator(".content-pagination").count(), 0);
    await activeRoot(page).locator('.inner-project[href="/du-an/cong-trinh-2"]').click();
    await page.waitForURL("**/du-an/cong-trinh-2"); await ready(page); await atTop(page);
    const detail = activeRoot(page);
    assert.equal(await detail.getAttribute("data-project-mode"), "detail");
    assert.equal(await detail.locator(".inner-gallery figure:not([aria-hidden])").count(), 3);
    assert.equal(await detail.locator(".content-prose p").count(), 20);
    if (full) {
      const detailStage = detail.locator("[data-project-stage]");
      const detailView = detail.locator("[data-project-viewport]");
      const start = await absoluteTop(detailStage) - header;
      const travel = await detailStage.evaluate(node => node.offsetHeight) - await detailView.evaluate(node => node.offsetHeight);
      const scale = () => detailView.locator("img").evaluate(node => new DOMMatrixReadOnly(getComputedStyle(node).transform).m11);
      for (const progress of [0, .5, 1, .5]) {
        await jump(page, start + travel * progress);
        near(await scale(), 1.06 - .06 * progress, "Detail hero follows scroll", .001);
      }
    }
    const gallery = detail.locator(".inner-gallery figure:not([aria-hidden])").first();
    const galleryTop = await absoluteTop(gallery);
    await jump(page, galleryTop - viewport.height * .75);
    const galleryClip = await gallery.locator("[data-project-media]").evaluate(node => getComputedStyle(node).clipPath);
    if (full) near(Number(galleryClip.match(/([\d.]+)%/)?.[1]), 50, `Gallery midpoint mask: ${galleryClip}`);
    else assert.equal(galleryClip, "none");
    await jump(page, galleryTop - viewport.height * .6);
    assert.equal(await gallery.locator("img").evaluate(node => getComputedStyle(node).objectFit), "cover", "Gallery matches the introduction carousel");
    if ([1440, 390].includes(viewport.width) && viewport.height !== 650) await page.screenshot({ path: `tmp/project-gallery-${viewport.width}.png` });
    await jump(page, galleryTop - viewport.height * .75);
    assert.equal(await gallery.locator("[data-project-media]").evaluate(node => getComputedStyle(node).clipPath), galleryClip, "Gallery reverses");
    const carousel = detail.getByRole("region", { name: "Hình ảnh công trình Công trình NewGen 02", exact: true });
    const track = carousel.locator(".inner-gallery");
    assert.equal(await carousel.locator('figcaption, [aria-live], h2, p').count(), 0, "Gallery displays images and arrow controls only");
    assert.equal(await detail.locator(".inner-gallery-section h2, .inner-gallery-section .eyebrow").count(), 0, "Gallery has no visible heading");
    const visibleSlides = viewport.width <= 700 ? 1 : viewport.width <= 1000 ? 2 : 3;
    near(await gallery.evaluate(node => node.getBoundingClientRect().width), (await track.evaluate(node => node.clientWidth) - (visibleSlides - 1) * (viewport.width <= 700 ? 16 : 24)) / visibleSlides, "Responsive carousel columns");
    assert.equal(await gallery.locator("[data-project-media]").evaluate(node => getComputedStyle(node).borderRadius), "16px");
    const previous = carousel.getByRole("button", { name: "Ảnh trước", exact: true });
    const next = carousel.getByRole("button", { name: "Ảnh sau", exact: true });
    const waitSlide = async index => {
      await page.waitForFunction(({ index }) => {
        const track = document.querySelector('[data-project-mode="detail"] .inner-gallery');
        const stride = track.children[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap);
        return Math.abs(track.scrollLeft - (6 + index) * stride) < 1;
      }, { index });
    };
    await waitSlide(0);
    await previous.click(); await waitSlide(2);
    await next.click(); await waitSlide(0);
    await next.click(); await waitSlide(1);
    await next.click(); await waitSlide(2);
    await next.click(); await waitSlide(0);
    await previous.click(); await waitSlide(2);
    await previous.click(); await waitSlide(1);
    await track.focus(); await page.keyboard.press("ArrowLeft"); await waitSlide(0);
    await page.keyboard.press("ArrowRight"); await waitSlide(1);
    const jumpSlide = async index => track.evaluate((node, index) => {
      const stride = node.children[0].getBoundingClientRect().width + parseFloat(getComputedStyle(node).columnGap);
      node.scrollTo({ left: stride * (6 + index), behavior: "instant" });
    }, index);
    await jumpSlide(2);
    await waitSlide(2);
    await page.waitForTimeout(200);
    if (viewport.width === 1440 && viewport.height === 900) {
      await page.setViewportSize({ width: 390, height: 844 }); await waitSlide(2); await overflow(page);
      await page.setViewportSize({ width: viewport.width, height: viewport.height }); await waitSlide(2);
    }
    await jumpSlide(0); await waitSlide(0);
    await jump(page, galleryTop - header - 24);
    if (viewport.touch) {
      const bounds = await track.boundingBox();
      const client = await page.context().newCDPSession(page);
      const y = bounds.y + Math.min(100, bounds.height / 2);
      const start = bounds.x + bounds.width * .85;
      await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: start, y }] });
      for (let i = 1; i <= 8; i++) {
        await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: start - bounds.width / visibleSlides * .75 * i / 8, y }] });
        await page.waitForTimeout(40);
      }
      await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await waitSlide(1);
      await client.detach();
    }
    if ([1440, 390].includes(viewport.width) && viewport.height !== 650) await carousel.screenshot({ path: `tmp/project-carousel-${viewport.width}.png` });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await jumpSlide(1); await waitSlide(1);
    await previous.click(); await waitSlide(0);
    await page.emulateMedia({ reducedMotion: "reduce" }); await page.waitForTimeout(100);
    assert.equal(await detail.getAttribute("data-project-motion"), null);
    assert.equal(await detail.locator("[data-project-viewport]").evaluate(node => getComputedStyle(node).position), "static");
    assert.equal(await gallery.locator("[data-project-media]").evaluate(node => getComputedStyle(node).clipPath), "none");
    await page.emulateMedia({ reducedMotion: "no-preference" }); await page.waitForTimeout(100);
    if (full) {
      await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(100);
      assert.equal(await detail.getAttribute("data-project-motion"), "light"); await overflow(page);
      await page.setViewportSize({ width: viewport.width, height: viewport.height }); await page.waitForTimeout(100);
      assert.equal(await detail.getAttribute("data-project-motion"), "full");
    }
    await detail.locator(".breadcrumbs").getByRole("link", { name: "Dự án tiêu biểu", exact: true }).click();
    await page.waitForURL(`${base}/du-an`); await ready(page); await atTop(page);
    await page.goto(`${base}/du-an/cong-trinh-1`, { waitUntil: "networkidle" }); await ready(page);
    assert.equal(await activeRoot(page).locator("[data-project-stage]").count(), 0, "Detail without cover has no empty stage");
    assert.equal(await activeRoot(page).locator(".inner-gallery").count(), 0, "Detail without gallery skips it");
    await overflow(page); assert.deepEqual(errors, []);
    console.log(`PASS ${viewport.width}x${viewport.height}${viewport.touch ? " touch" : ""}: all projects, responsive grid, hover, hero, reverse, detail, focus`);
    await page.close();
  }

  const fallback = await browser.newPage();
  await fallback.goto(`${base}/du-an/cong-trinh-3`, { waitUntil: "networkidle" }); await ready(fallback);
  const singleGallery = fallback.getByRole("region", { name: "Hình ảnh công trình Công trình NewGen 03", exact: true });
  assert.equal(await singleGallery.locator("figure").count(), 1);
  assert.equal(await singleGallery.getByRole("button").count(), 0, "Single image needs no carousel controls");
  await fallback.setViewportSize({ width: 1440, height: 900 });
  await fallback.goto(`${base}/du-an/cong-trinh-4`, { waitUntil: "networkidle" }); await ready(fallback);
  const twoTrack = fallback.locator(".inner-gallery");
  const waitTwo = async index => fallback.waitForFunction(index => {
    const track = document.querySelector(".inner-gallery");
    const stride = track.children[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap);
    return Math.abs(track.scrollLeft - stride * (4 + index)) < 1;
  }, index);
  await waitTwo(0);
  await twoTrack.press("ArrowRight"); await waitTwo(1);
  await twoTrack.press("ArrowRight"); await waitTwo(0);
  await twoTrack.press("ArrowLeft"); await waitTwo(1);
  for (const kind of ["empty", "no-cover"]) {
    scenario = kind;
    await fallback.goto(`${base}/du-an`, { waitUntil: "networkidle" }); await ready(fallback);
    assert.equal(await activeRoot(fallback).locator("[data-project-stage]").count(), 0);
    if (kind === "empty") await fallback.getByText("Chưa có công trình được xuất bản.", { exact: true }).waitFor();
    else assert.equal(await activeRoot(fallback).locator(".content-photo-placeholder").count(), 14);
  }
  scenario = "four";
  await fallback.setViewportSize({ width: 1440, height: 900 });
  await fallback.goto(`${base}/du-an`, { waitUntil: "networkidle" }); await ready(fallback);
  assert.equal(await activeRoot(fallback).locator(".inner-project").count(), 4);
  assert.equal(await activeRoot(fallback).locator(".inner-project-grid").evaluate(node => getComputedStyle(node).gridTemplateColumns.split(" ").length), 2, "Four projects form a balanced 2x2 grid");
  scenario = "normal";
  const removedRoute = await fallback.goto(`${base}/nang-luc`, { waitUntil: "networkidle" });
  assert.equal(removedRoute.status(), 404, "Removed capability route returns 404");
  assert.equal(await fallback.locator("[data-project-page]").count(), 0);
  await fallback.goto(`${base}/blog`, { waitUntil: "networkidle" });
  assert.equal(await fallback.locator("[data-project-page]").count(), 0);
  await fallback.context().addCookies([{ name: "sb-localhost-auth-token", value: `base64-${encode({ access_token: token, refresh_token: "fixture-refresh", expires_at: Math.floor(Date.now() / 1000) + 86400, expires_in: 86400, token_type: "bearer", user })}`, url: base }]);
  await fallback.goto(`${base}/admin/preview/projects/${uuid(2)}`, { waitUntil: "networkidle" });
  await fallback.locator(".admin-preview").waitFor();
  assert.equal(await fallback.locator("[data-project-page]").count(), 0);
  assert.equal(await fallback.locator("[data-project-viewport]").evaluate(node => getComputedStyle(node).position), "static", "Admin preview keeps static cover");
  await fallback.close();

  const hashPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await hashPage.goto(`${base}/du-an#danh-sach-du-an`, { waitUntil: "networkidle" }); await ready(hashPage);
  const hashHeader = await hashPage.locator(".header").evaluate(node => node.offsetHeight);
  near(await hashPage.locator("#danh-sach-du-an").evaluate(node => node.getBoundingClientRect().top), hashHeader + 24, "Direct hash respects navbar offset");
  await hashPage.close();

  for (const options of [
    { javaScriptEnabled: false, viewport: { width: 1440, height: 900 } },
    { javaScriptEnabled: false, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    { reducedMotion: "reduce", viewport: { width: 1440, height: 900 } },
  ]) {
    const accessible = await browser.newPage(options);
    for (const url of ["/du-an", "/du-an/cong-trinh-2"]) {
      await accessible.goto(base + url, { waitUntil: "networkidle" });
      assert.equal(await accessible.locator("[data-project-page]").getAttribute("data-project-motion"), null);
      const hidden = await accessible.locator("[data-project-media]").evaluateAll(nodes => nodes.some(node => getComputedStyle(node).clipPath !== "none"));
      assert.equal(hidden, false, "No-JS/reduced content stays unmasked");
      assert.equal(await accessible.locator("[data-project-reveal] > *").evaluateAll(nodes => nodes.some(node => Number(getComputedStyle(node).opacity) < 1)), false, "Accessible content stays visible");
      assert.equal(await accessible.locator("[data-project-card]").evaluateAll(nodes => nodes.some(node => Number(getComputedStyle(node).opacity) < 1 || node.getAnimations().length > 0)), false, "No-JS and reduced-motion project cards stay visible without entrance effects");
      await overflow(accessible);
    }
    await accessible.close();
  }
  assert.ok(requests.every(request => request.method === "GET"));
  console.log("PASS empty/no-cover/long content, admin preview, other pages, no-JavaScript; fixture only received GET requests");
} catch (error) {
  console.error(error);
  console.error(logs);
  process.exitCode = 1;
} finally {
  await browser?.close();
  if (app && app.exitCode === null) await new Promise(resolve => { app.once("exit", resolve); app.kill(); });
  await new Promise(resolve => fixture.close(resolve));
  if (fixtureApp) {
    const target = path.resolve(fixtureApp);
    assert.equal(path.dirname(target), path.resolve(tmpdir()));
    assert.ok(path.basename(target).startsWith("newgen-project-motion-"));
    await rm(target, { recursive: true, force: true });
  }
}
