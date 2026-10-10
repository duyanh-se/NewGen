// UI fixture only: security is verified separately against the PostgreSQL migration.
import { chromium } from "@playwright/test";
import http from "node:http";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";
const userId = "00000000-0000-4000-8000-000000000001";
const user = {
  id: userId,
  aud: "authenticated",
  role: "authenticated",
  email: "admin@example.test",
  app_metadata: { provider: "email" },
  user_metadata: {},
  created_at: new Date().toISOString(),
};
const encode = (v) => Buffer.from(JSON.stringify(v)).toString("base64url");
const token =
  encode({ alg: "HS256", typ: "JWT" }) +
  "." +
  encode({
    sub: userId,
    role: "authenticated",
    aud: "authenticated",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400,
  }) +
  ".signature";
const store = { projects: [], posts: [], categories: [], media: [] };
const uiErrors = [];
const requests = [];
let app, browser, page;
let logs = "";
const server = http.createServer(async (req, res) => {
  try {
    let body = "";
    for await (const chunk of req) body += chunk;
    const url = new URL(req.url, "http://localhost:3105");
    const data = body ? JSON.parse(body) : {};
    requests.push({
      method: req.method,
      path: url.pathname,
      query: url.search,
    });
    res.setHeader("Content-Type", "application/json");
    let result;
    if (url.pathname === "/auth/v1/token")
      result = {
        access_token: token,
        refresh_token: "fixture-refresh",
        token_type: "bearer",
        expires_in: 86400,
        user,
      };
    else if (url.pathname === "/auth/v1/user") result = user;
    else if (url.pathname === "/auth/v1/logout") {
      res.statusCode = 204;
      res.end();
      return;
    } else if (url.pathname === "/rest/v1/admin_users")
      result = [{ user_id: userId }];
    else if (url.pathname === "/rest/v1/rpc/save_project") {
      if (
        store.projects.some(
          (p) => p.slug === data.payload.slug && p.id !== data.payload.id,
        )
      ) {
        res.statusCode = 409;
        res.end(JSON.stringify({ code: "23505", message: "Duplicate slug" }));
        return;
      }
      const item = {
        ...data.payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published_at:
          data.payload.status === "published" ? new Date().toISOString() : null,
        cover: null,
        images: [],
      };
      const ix = store.projects.findIndex((p) => p.id === item.id);
      if (ix < 0) store.projects.push(item);
      else store.projects[ix] = item;
      result = item.id;
    } else if (url.pathname.startsWith("/rest/v1/")) {
      const table = url.pathname.split("/").pop();
      let rows = store[table] ?? [];
      if (req.method === "POST") {
        const item = {
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          published_at:
            data.status === "published" ? new Date().toISOString() : null,
          cover: null,
          category: null,
        };
        rows.push(item);
        result = item;
      } else if (req.method === "PATCH") {
        const id = url.searchParams.get("id")?.slice(3);
        const item = rows.find((r) => r.id === id);
        if (item)
          Object.assign(item, data, { updated_at: new Date().toISOString() });
        result = item;
      } else {
        rows = rows.filter((row) =>
          [...url.searchParams].every(
            ([key, v]) =>
              !["id", "slug", "status"].includes(key) ||
              (v.startsWith("eq.") && String(row[key]) === v.slice(3)),
          ),
        );
        res.setHeader(
          "Content-Range",
          "0-" + Math.max(0, rows.length - 1) + "/" + rows.length,
        );
        result = (req.headers.accept ?? "").includes("vnd.pgrst.object")
          ? (rows[0] ?? null)
          : rows;
      }
    } else {
      res.statusCode = 404;
      result = { message: "Fixture route missing" };
    }
    res.end(JSON.stringify(result));
  } catch (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ message: e.message }));
  }
});
(async () => {
  await new Promise((resolve) => server.listen(3105, "127.0.0.1", resolve));
  app = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "--port", "3104"],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: "http://localhost:3105",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "fixture-key",
      },
      windowsHide: true,
    },
  );
  app.stdout.on("data", (b) => (logs += b));
  app.stderr.on("data", (b) => (logs += b));
  await new Promise((resolve) => {
    app.stdout.on("data", (b) => {
      if (b.toString().includes("Ready")) resolve();
    });
    setTimeout(resolve, 3000);
  });
  browser = await chromium.launch({
    executablePath:
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
      (process.platform === "win32"
        ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
        : undefined),
    headless: true,
  });
  page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultTimeout(7000);
  page.on("pageerror", (e) => uiErrors.push(e.message));
  await page.goto("http://localhost:3104/admin/login");
  await page.getByLabel("Email", { exact: true }).fill("admin@example.test");
  await page.getByLabel("Mật khẩu", { exact: true }).fill("password");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await page.waitForURL("**/admin/projects");
  await page.getByRole("link", { name: "Thêm công trình +" }).click();
  await page
    .getByLabel("Tên công trình", { exact: true })
    .fill("Công trình kiểm tra");
  await page
    .getByLabel("Mô tả ngắn", { exact: true })
    .fill("Hồ sơ công trình cho kiểm tra giao diện.");
  await page.locator(".tiptap").fill("Nội dung công trình thử nghiệm.");
  await page.getByRole("button", { name: "Đánh số", exact: true }).click();
  await page.getByRole("button", { name: "Lưu nháp", exact: true }).click();
  await page.waitForURL(
    (url) =>
      url.pathname.startsWith("/admin/projects/") &&
      url.pathname.endsWith(store.projects[0]?.id ?? "missing"),
  );
  assert.equal(store.projects.length, 1);
  await page.getByRole("button", { name: "Xuất bản", exact: true }).click();
  await page.getByText("Đã lưu nội dung.", { exact: true }).waitFor();
  const publicPage = await browser.newPage();
  let response = await publicPage.goto(
    "http://localhost:3104/du-an/cong-trinh-kiem-tra",
  );
  assert.equal(response.status(), 200);
  assert.equal(
    await publicPage.locator(".content-prose").innerText(),
    "Nội dung công trình thử nghiệm.",
  );
  await page
    .getByRole("button", { name: "Gỡ xuất bản và lưu nháp", exact: true })
    .click();
  await page.getByRole("button", { name: "Xuất bản", exact: true }).waitFor();
  response = await publicPage.goto(
    "http://localhost:3104/du-an/cong-trinh-kiem-tra",
  );
  assert.equal(response.status(), 404);
  await page.screenshot({
    path: "tmp/backend-editor-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "tmp/backend-editor-mobile.png",
    fullPage: true,
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
    false,
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("http://localhost:3104/admin/projects/new");
  await page
    .getByLabel("Tên công trình", { exact: true })
    .fill("Công trình kiểm tra");
  await page
    .getByLabel("Mô tả ngắn", { exact: true })
    .fill("Giữ dữ liệu khi lỗi");
  await page.locator(".tiptap").fill("Nội dung cần giữ");
  await page.getByRole("button", { name: "Lưu nháp", exact: true }).click();
  await page
    .getByText("Đường dẫn đã tồn tại. Hãy chọn đường dẫn khác.", {
      exact: true,
    })
    .waitFor();
  assert.equal(
    await page.getByLabel("Mô tả ngắn", { exact: true }).inputValue(),
    "Giữ dữ liệu khi lỗi",
  );
  assert.equal(await page.locator(".tiptap").innerText(), "Nội dung cần giữ");
  await page
    .locator("input[type=file]")
    .first()
    .setInputFiles({
      name: "fake.png",
      mimeType: "image/png",
      buffer: Buffer.from("not an image"),
    });
  await page
    .getByText("File không phải ảnh tĩnh hợp lệ hoặc có kích thước quá lớn.", {
      exact: true,
    })
    .waitFor();
  await page.goto("http://localhost:3104/admin/posts/new");
  await page
    .getByLabel("Tiêu đề bài viết", { exact: true })
    .fill("Bài blog kiểm tra");
  await page
    .getByLabel("Mô tả ngắn", { exact: true })
    .fill("Bài viết thử nghiệm");
  await page.locator(".tiptap").fill("Nội dung bài blog");
  await page.getByRole("button", { name: "Xuất bản", exact: true }).click();
  await page.waitForURL((url) =>
    url.pathname.endsWith(store.posts[0]?.id ?? "missing"),
  );
  response = await publicPage.goto(
    "http://localhost:3104/blog/bai-blog-kiem-tra",
  );
  assert.equal(response.status(), 200);
  assert.equal(
    await publicPage.locator(".content-prose").innerText(),
    "Nội dung bài blog",
  );
  assert.equal(
    await publicPage.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
    false,
  );
  await page.getByRole("button", { name: "Lưu trữ", exact: true }).click();
  await page.getByRole("button", { name: "Xuất bản", exact: true }).waitFor();
  response = await publicPage.goto(
    "http://localhost:3104/blog/bai-blog-kiem-tra",
  );
  assert.equal(response.status(), 404);
  assert.deepEqual(uiErrors, []);
  console.log(
    "PASS: login, rich editor, draft, publish/unpublish, archive, validation preserves inputs, fake upload rejected, mobile overflow",
  );
})()
  .catch(async (e) => {
    console.error(e.message);
    if (page)
      console.error(
        "PAGE:",
        await page
          .locator("main")
          .innerText()
          .catch(() => ""),
      );
    console.error("REQUESTS:", JSON.stringify(requests));
    console.error("SERVER:", logs);
    process.exitCode = 1;
  })
  .finally(async () => {
    await browser?.close();
    app?.kill();
    server.close();
  });
