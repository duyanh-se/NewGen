// Builds an isolated app with read-only blog fixtures; never writes to the real database.
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import http from "node:http";
import { cp, mkdtemp, readFile, rm, symlink } from "node:fs/promises";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";

const appPort = Number(process.env.REVEAL_TEST_PORT || 3110);
const fixturePort = Number(process.env.REVEAL_TEST_DB_PORT || 3111);
const base = `http://localhost:${appPort}`;
const posts = Array.from({ length: 13 }, (_, index) => ({
  id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
  slug: `bai-viet-${index + 1}`, title: `Blog NewGen ${index + 1}`,
  description: "Kinh nghiệm xây dựng và câu chuyện từ công trình NewGen.",
  author: "NewGen", category: { name: "Công trình" }, status: "published",
  published_at: "2026-01-01T00:00:00Z", seo_title: "", seo_description: "",
  cover: index % 2 ? null : { path: "office.webp", alt: "Văn phòng NewGen" },
  content: { type: "doc", content: Array.from({ length: 8 }, () => ({
    type: "paragraph", content: [{ type: "text", text: "Chia sẻ kinh nghiệm thi công, phối hợp và hoàn thiện công trình. ".repeat(5) }],
  })) },
}));
let empty = false;
const fixture = http.createServer(async (req, res) => {
  try {
    assert.equal(req.method, "GET");
    const url = new URL(req.url, `http://localhost:${fixturePort}`);
    if (url.pathname.startsWith("/storage/")) {
      res.setHeader("Content-Type", "image/webp");
      res.end(await readFile("public/images/office1.webp"));
      return;
    }
    let rows = url.pathname === "/rest/v1/posts" && !empty ? posts : [];
    if (url.searchParams.has("slug")) rows = rows.filter(post => post.slug === url.searchParams.get("slug").slice(3));
    const total = rows.length;
    const offset = Number(url.searchParams.get("offset") || 0);
    rows = rows.slice(offset, offset + Number(url.searchParams.get("limit") || total));
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Range", `${offset}-${Math.max(offset, offset + rows.length - 1)}/${total}`);
    res.end(JSON.stringify((req.headers.accept || "").includes("vnd.pgrst.object") ? rows[0] || null : rows));
  } catch (error) {
    res.writeHead(500);
    res.end(JSON.stringify({ message: error.message }));
  }
});

let fixtureApp, app, browser;
let logs = "";
const track = () => {
  window.revealCounts = new WeakMap();
  const animate = Element.prototype.animate;
  Element.prototype.animate = function (frames, options) {
    if (this.closest("[data-page-motion]")) window.revealCounts.set(this, (window.revealCounts.get(this) || 0) + 1);
    return animate.call(this, frames, options);
  };
};
const scrollThrough = async page => {
  for (let y = 0; y < await page.evaluate(() => document.documentElement.scrollHeight); y += 500) {
    await page.evaluate(top => window.scrollTo({ top, behavior: "instant" }), y);
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(800);
};
const targets = "[data-page-reveal], .inner-heading > :not(.breadcrumbs), .inner-cover, .inner-callout > .wrap, .blog-byline, .blog-article > .content-prose > *, .blog-article > .text-link";

try {
  const logo = await sharp("public/images/logo-transparent.webp").raw().toBuffer({ resolveWithObject: true });
  assert.equal(logo.info.channels, 4);
  assert.equal(logo.data[3], 0, "Logo background must have real transparency");
  assert.ok(logo.data.some((value, index) => index % 4 === 3 && value > 240), "Logo itself stays opaque");
  await new Promise(resolve => fixture.listen(fixturePort, "127.0.0.1", resolve));
  fixtureApp = await mkdtemp(path.join(tmpdir(), "newgen-page-reveal-"));
  for (const file of ["src", "package.json", "package-lock.json", "tsconfig.json", "next.config.ts", "postcss.config.mjs"]) {
    await cp(path.resolve(file), path.join(fixtureApp, file), { recursive: true });
  }
  for (const directory of ["node_modules", "public"]) await symlink(path.resolve(directory), path.join(fixtureApp, directory), "junction");
  const next = path.resolve("node_modules/next/dist/bin/next");
  const options = { cwd: fixtureApp, windowsHide: true, env: { ...process.env,
    NEXT_PUBLIC_SUPABASE_URL: `http://localhost:${fixturePort}`, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "fixture-key" } };
  console.log("Building isolated blog/contact fixture app...");
  await new Promise((resolve, reject) => {
    const build = spawn(process.execPath, [next, "build", "--webpack"], options);
    build.stdout.on("data", chunk => { logs += chunk; });
    build.stderr.on("data", chunk => { logs += chunk; });
    build.once("error", reject);
    build.once("exit", code => code === 0 ? resolve() : reject(new Error(`Build exited ${code}`)));
  });
  app = spawn(process.execPath, [next, "start", "--port", String(appPort)], options);
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("App startup timed out")), 20000);
    app.stdout.on("data", chunk => { logs += chunk; if (chunk.toString().includes("Ready")) { clearTimeout(timer); resolve(); } });
    app.stderr.on("data", chunk => { logs += chunk; });
    app.once("exit", code => { clearTimeout(timer); reject(new Error(`App exited ${code}`)); });
  });
  browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (process.platform === "win32" ? "C:/Program Files/Google/Chrome/Application/chrome.exe" : undefined), headless: true });
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 320, height: 740 }]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.addInitScript(track);
    for (const route of ["/blog", "/blog/bai-viet-1", "/lien-he"]) {
      await page.goto(base + route, { waitUntil: "networkidle" });
      await scrollThrough(page);
      assert.equal(await page.locator(targets).evaluateAll(nodes => nodes.every(node => window.revealCounts.get(node) === 1)), true, `${route}: every target enters once`);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await scrollThrough(page);
      assert.equal(await page.locator(targets).evaluateAll(nodes => nodes.every(node => window.revealCounts.get(node) === 1 && Number(getComputedStyle(node).opacity) === 1)), true, `${route}: scrolling back must not replay`);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    }
    await page.goto(base + "/blog", { waitUntil: "networkidle" });
    assert.equal(await page.locator(".inner-blog-card").count(), 12);
    await page.locator('.content-pagination a[href="/blog?page=2"]').click();
    await page.waitForURL("**/blog?page=2");
    await page.waitForFunction(() => document.querySelectorAll(".inner-blog-card").length === 1);
    await scrollThrough(page);
    assert.equal(await page.locator(".inner-blog-card").evaluate(node => window.revealCounts.get(node)), 1, "New pagination results animate");
    assert.deepEqual(errors, []);
    await page.close();
    console.log(`PASS ${viewport.width}px: list, article, contact, pagination, once-only entrances`);
  }
  const focus = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await focus.goto(base + "/lien-he", { waitUntil: "domcontentloaded" });
  await focus.waitForFunction(() => document.querySelector(".inner-contact-primary").getAnimations().length > 0);
  await focus.locator(".inner-contact-primary a").first().focus();
  assert.equal(await focus.locator(".inner-contact-primary").evaluate(node => node.getAnimations().length), 0, "Keyboard focus immediately reveals the contact panel");
  await focus.close();
  for (const settings of [{ reducedMotion: "reduce" }, { javaScriptEnabled: false }]) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, ...settings });
    for (const route of ["/blog", "/blog/bai-viet-1", "/lien-he"]) {
      await page.goto(base + route, { waitUntil: "networkidle" });
      assert.equal(await page.locator(targets).evaluateAll(nodes => nodes.every(node => node.getAnimations().length === 0 && Number(getComputedStyle(node).opacity) === 1)), true, "Accessible content remains visible without motion");
    }
    await page.close();
  }
  empty = true;
  const page = await browser.newPage();
  await page.goto(base + "/blog", { waitUntil: "networkidle" });
  await page.locator(".inner-empty").waitFor();
  assert.equal(await page.locator(".content-pagination").count(), 0);
  await page.close();
  console.log("PASS transparent logo, keyboard focus, reduced motion, no JavaScript, empty blog");
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
    assert.ok(path.basename(target).startsWith("newgen-page-reveal-"));
    await rm(target, { recursive: true, force: true });
  }
}
