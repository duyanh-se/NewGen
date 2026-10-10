import { mkdir, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { createHash } from "node:crypto";
import { contentClient, requiredData, safePath } from "./content-client";
const db = contentClient();
const destination = resolve(
  process.argv[2] ??
    "backups/" + new Date().toISOString().replace(/[:.]/g, "-"),
);
await mkdir(dirname(destination), { recursive: true });
await mkdir(destination);
const tables = [
  "categories",
  "media",
  "projects",
  "posts",
  "project_images",
] as const;
const data: Record<string, Record<string, unknown>[]> = {};
for (const table of tables) {
  data[table] = [];
  for (let offset = 0; ; offset += 1000) {
    let query = db
      .from(table)
      .select("*")
      .order(table === "project_images" ? "project_id" : "id");
    if (table === "project_images") query = query.order("media_id");
    const rows = requiredData(await query.range(offset, offset + 999));
    data[table].push(...rows);
    if (rows.length < 1000) break;
  }
}
if (data.media.some((m) => m.state !== "ready"))
  throw new Error("Hoàn tất xóa ảnh đang chờ trước khi backup.");
const files: Record<string, string> = {};
for (const media of data.media) {
  const path = safePath(String(media.path));
  const blob = requiredData(
    await db.storage.from("content-images").download(path),
  );
  const bytes = Buffer.from(await blob.arrayBuffer());
  const file = resolve(destination, "files", path);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, bytes);
  files[path] = createHash("sha256").update(bytes).digest("hex");
}
await writeFile(
  resolve(destination, "manifest.json"),
  JSON.stringify(
    { version: 1, created_at: new Date().toISOString(), data, files },
    null,
    2,
  ),
);
console.log(
  "Đã sao lưu nội dung và",
  Object.keys(files).length,
  "ảnh vào",
  destination,
);
