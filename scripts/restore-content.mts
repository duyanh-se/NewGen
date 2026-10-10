import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { contentClient, checked, safePath } from "./content-client";
if (!process.argv[2])
  throw new Error(
    "Dùng: npm run content:restore -- backups/thu-muc [--confirm]",
  );
const source = resolve(process.argv[2]);
const manifest = JSON.parse(
  await readFile(resolve(source, "manifest.json"), "utf8"),
);
if (manifest.version !== 1 || !manifest.data || !manifest.files)
  throw new Error("Bản sao lưu không hợp lệ.");
const buffers = new Map<string, Buffer>();
for (const media of manifest.data.media) {
  const path = safePath(media.path);
  const bytes = await readFile(resolve(source, "files", path));
  if (
    createHash("sha256").update(bytes).digest("hex") !== manifest.files[path] ||
    bytes.length !== media.size_bytes
  )
    throw new Error("Ảnh thiếu hoặc không khớp checksum: " + path);
  buffers.set(path, bytes);
}
const db = contentClient();
console.log(
  "Đích khôi phục:",
  new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname,
);
for (const table of [
  "categories",
  "media",
  "projects",
  "posts",
  "project_images",
]) {
  const count = await db
    .from(table)
    .select("*", { head: true, count: "exact" });
  if (count.error) throw new Error(count.error.message);
  if (count.count)
    throw new Error(
      "Chỉ khôi phục vào database nội dung trống. Bảng đang có dữ liệu: " +
        table,
    );
}
if (!process.argv.includes("--confirm")) {
  console.log(
    "Kiểm tra thành công:",
    manifest.data.projects.length,
    "công trình,",
    manifest.data.posts.length,
    "bài viết,",
    buffers.size,
    "ảnh. Thêm --confirm để khôi phục vào project thử nghiệm trống.",
  );
  process.exit(0);
}
for (const media of manifest.data.media)
  checked(
    await db.storage
      .from("content-images")
      .upload(media.path, buffers.get(media.path)!, {
        contentType: media.mime_type,
        upsert: false,
      }),
  );
for (const table of [
  "categories",
  "media",
  "projects",
  "posts",
  "project_images",
]) {
  for (let offset = 0; offset < manifest.data[table].length; offset += 100)
    checked(
      await db
        .from(table)
        .insert(manifest.data[table].slice(offset, offset + 100)),
    );
}
console.log(
  "Đã khôi phục. Kiểm tra website, ảnh và cấp lại admin nếu dùng project mới.",
);
