import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { resolve, sep } from "node:path";
import sharp from "sharp";
import { testDatabase } from "./fixtures/database";

test("backup/restore preserves records and image bytes; seed is repeatable and preserves edits", async () => {
  const db = await testDatabase();
  const imageA = crypto.randomUUID(),
    imageB = crypto.randomUUID(),
    project = crypto.randomUUID(),
    post = crypto.randomUUID();
  const bytesA = await sharp({
    create: { width: 12, height: 8, channels: 3, background: "#21598a" },
  })
    .webp()
    .toBuffer();
  const bytesB = await sharp({
    create: { width: 10, height: 10, channels: 3, background: "#b8d8ee" },
  })
    .webp()
    .toBuffer();
  const files = new Map<string, Buffer>([
    ["a.webp", bytesA],
    ["b.webp", bytesB],
  ]);
  await db.query(
    "insert into public.media(id,path,alt,mime_type,size_bytes) values ($1,'a.webp','Ảnh A','image/webp',$2),($3,'b.webp','Ảnh B','image/webp',$4)",
    [imageA, bytesA.length, imageB, bytesB.length],
  );
  const doc = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: "Nội dung được khôi phục" }],
      },
    ],
  };
  await db.query(
    "insert into public.projects(id,name,slug,content,cover_id,status) values ($1,'Công trình backup','cong-trinh-backup',$2,$3,'published')",
    [project, JSON.stringify(doc), imageA],
  );
  await db.query(
    "insert into public.posts(id,title,slug,content,cover_id,status) values ($1,'Bài blog backup','bai-blog-backup',$2,$3,'published')",
    [post, JSON.stringify(doc), imageB],
  );
  await db.query(
    "insert into public.project_images values ($1,$2,0),($1,$3,1)",
    [project, imageB, imageA],
  );
  const tables = new Set([
    "categories",
    "media",
    "projects",
    "posts",
    "project_images",
  ]);
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url!, "http://localhost");
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(Buffer.from(chunk));
      const body = Buffer.concat(chunks);
      const storage = url.pathname.match(
        new RegExp(
          "^/storage/v1/object/(?:authenticated/)?content-images/(.+)$",
        ),
      );
      if (storage) {
        const path = decodeURIComponent(storage[1]);
        if (req.method === "GET") {
          const bytes = files.get(path);
          if (!bytes) {
            res.statusCode = 404;
            res.end(JSON.stringify({ message: "Missing image" }));
            return;
          }
          res.setHeader("Content-Type", "image/webp");
          res.end(bytes);
          return;
        }
        if (req.method === "POST") {
          if (files.has(path)) throw new Error("File exists");
          files.set(path, body);
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ Key: "content-images/" + path }));
          return;
        }
      }
      const table = url.pathname.slice("/rest/v1/".length);
      if (!url.pathname.startsWith("/rest/v1/") || !tables.has(table))
        throw new Error("Unsupported fixture request: " + url.pathname);
      const count = (
        await db.query<{ count: number }>(
          "select count(*)::int as count from public." + table,
        )
      ).rows[0].count;
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Range",
        "0-" + Math.max(0, count - 1) + "/" + count,
      );
      if (req.method === "HEAD") {
        res.end();
        return;
      }
      if (req.method === "GET") {
        const where: string[] = [];
        const values: unknown[] = [];
        for (const column of ["slug", "path"]) {
          const filter = url.searchParams.get(column);
          if (filter?.startsWith("eq.")) {
            values.push(filter.slice(3));
            where.push(column + "=$" + values.length);
          }
        }
        values.push(
          Number(url.searchParams.get("limit") ?? 1000),
          Number(url.searchParams.get("offset") ?? 0),
        );
        const rows = (
          await db.query(
            "select * from public." +
              table +
              (where.length ? " where " + where.join(" and ") : "") +
              " order by " +
              (table === "project_images" ? "project_id,media_id" : "id") +
              " limit $" +
              (values.length - 1) +
              " offset $" +
              values.length,
            values,
          )
        ).rows;
        res.end(
          JSON.stringify(
            (req.headers.accept ?? "").includes("vnd.pgrst.object")
              ? rows[0]
              : rows,
          ),
        );
        return;
      }
      if (req.method === "POST") {
        const incoming = JSON.parse(body.toString());
        const rows = Array.isArray(incoming) ? incoming : [incoming];
        const inserted: unknown[] = [];
        for (const row of rows) {
          const keys = Object.keys(row);
          if (!keys.every((k) => /^[a-z_]+$/.test(k)))
            throw new Error("Invalid column");
          const result = await db.query(
            "insert into public." +
              table +
              " (" +
              keys.join(",") +
              ") values (" +
              keys.map((_, i) => "$" + (i + 1)).join(",") +
              ") returning *",
            keys.map((k) =>
              k === "content" ? JSON.stringify(row[k]) : row[k],
            ),
          );
          inserted.push(...result.rows);
        }
        res.statusCode = 201;
        if ((req.headers.prefer ?? "").includes("return=representation"))
          res.end(
            JSON.stringify(
              (req.headers.accept ?? "").includes("vnd.pgrst.object")
                ? inserted[0]
                : inserted,
            ),
          );
        else res.end();
        return;
      }
      throw new Error("Unsupported method");
    } catch (error) {
      res.statusCode = 400;
      res.end(
        JSON.stringify({
          message: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("No fixture address");
  const directory = await mkdtemp(resolve("tmp/backend-backup-"));
  const destination = resolve(directory, "snapshot");
  const env = {
    ...process.env,
    NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:" + address.port,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "fixture",
    SUPABASE_SERVICE_ROLE_KEY: "fixture",
  };
  const run = (script: string, args: string[] = []) =>
    new Promise<{ code: number; out: string }>((resolve) =>
      execFile(
        process.execPath,
        [
          "node_modules/tsx/dist/cli.mjs",
          "scripts/" + script + ".mts",
          ...args,
        ],
        { cwd: process.cwd(), env, timeout: 15000 },
        (error, stdout, stderr) =>
          resolve({
            code: typeof error?.code === "number" ? error.code : error ? 1 : 0,
            out: stdout + stderr,
          }),
      ),
    );
  try {
    const backup = await run("backup-content", [destination]);
    assert.equal(backup.code, 0, backup.out);
    const manifest = JSON.parse(
      await readFile(resolve(destination, "manifest.json"), "utf8"),
    );
    assert.equal(manifest.data.projects.length, 1);
    assert.equal(manifest.data.posts.length, 1);
    assert.equal(Object.keys(manifest.files).length, 2);
    await writeFile(resolve(destination, "files/a.webp"), "tampered");
    const corrupt = await run("restore-content", [destination]);
    assert.notEqual(corrupt.code, 0);
    assert.match(corrupt.out, /checksum/);
    await writeFile(resolve(destination, "files/a.webp"), bytesA);
    const occupied = await run("restore-content", [destination]);
    assert.notEqual(occupied.code, 0);
    assert.match(occupied.out, /đang có dữ liệu/);
    await db.exec(
      "truncate public.project_images,public.projects,public.posts,public.media,public.categories",
    );
    files.clear();
    const dry = await run("restore-content", [destination]);
    assert.equal(dry.code, 0, dry.out);
    assert.equal(files.size, 0);
    const restored = await run("restore-content", [destination, "--confirm"]);
    assert.equal(restored.code, 0, restored.out);
    assert.deepEqual(files.get("a.webp"), bytesA);
    assert.deepEqual(files.get("b.webp"), bytesB);
    const restoredProject = (
      await db.query<{ name: string; content: unknown; status: string }>(
        "select name,content,status from public.projects",
      )
    ).rows[0];
    assert.equal(restoredProject.name, "Công trình backup");
    assert.equal(restoredProject.status, "published");
    assert.deepEqual(restoredProject.content, doc);
    assert.equal((await db.query("select * from public.posts")).rows.length, 1);
    assert.deepEqual(
      (
        await db.query<{ media_id: string }>(
          "select media_id from public.project_images order by position",
        )
      ).rows.map((r) => r.media_id),
      [imageB, imageA],
    );
    const seeded = await run("seed-content");
    assert.equal(seeded.code, 0, seeded.out);
    const countBefore = (
      await db.query<{ count: number }>(
        "select count(*)::int as count from public.projects",
      )
    ).rows[0].count;
    assert.equal(countBefore, 5);
    const mediaBefore = (
      await db.query<{ count: number }>(
        "select count(*)::int as count from public.media",
      )
    ).rows[0].count;
    await db.exec(
      "update public.projects set description='Admin đã chỉnh sửa' where slug='khu-dan-cu-hoa-dat-3'",
    );
    const repeated = await run("seed-content");
    assert.equal(repeated.code, 0, repeated.out);
    assert.equal(
      (
        await db.query<{ count: number }>(
          "select count(*)::int as count from public.projects",
        )
      ).rows[0].count,
      countBefore,
    );
    assert.equal(
      (
        await db.query<{ count: number }>(
          "select count(*)::int as count from public.media",
        )
      ).rows[0].count,
      mediaBefore,
    );
    assert.equal(
      (
        await db.query<{ description: string }>(
          "select description from public.projects where slug='khu-dan-cu-hoa-dat-3'",
        )
      ).rows[0].description,
      "Admin đã chỉnh sửa",
    );
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await db.close();
    if (!directory.startsWith(resolve("tmp") + sep))
      throw new Error("Unsafe test cleanup target");
    await rm(directory, { recursive: true, force: true });
  }
});
