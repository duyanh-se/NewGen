import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { projects } from "../src/lib/company";
import { contentClient, checked, requiredData } from "./content-client";
const db = contentClient();
const sources = new Map<string, Buffer>();
// Verify every source before making any remote changes.
for (const p of projects)
  for (const name of new Set([p.image, ...p.gallery])) {
    if (sources.has(name)) continue;
    const bytes = await readFile("public/images/" + name + ".webp");
    if (bytes.length > 5242880) throw new Error("Ảnh vượt 5 MB: " + name);
    const image = sharp(bytes, { limitInputPixels: 40000000 });
    const info = await image.metadata();
    if (info.format !== "webp") throw new Error("Sai định dạng: " + name);
    await image.stats();
    sources.set(name, bytes);
  }
async function ensureMedia(name: string, alt: string) {
  const bytes = sources.get(name)!;
  const path =
    "seed/" + createHash("sha256").update(bytes).digest("hex") + ".webp";
  const existing = checked(
    await db.from("media").select("id").eq("path", path).maybeSingle(),
  );
  if (existing) return existing.id as string;
  const uploaded = await db.storage
    .from("content-images")
    .upload(path, bytes, { contentType: "image/webp", upsert: false });
  if (uploaded.error) {
    const download = await db.storage.from("content-images").download(path);
    if (download.error) throw uploaded.error;
    const actual = Buffer.from(await download.data.arrayBuffer());
    if (!actual.equals(bytes))
      throw new Error("File có sẵn không khớp: " + path);
  }
  return requiredData(
    await db
      .from("media")
      .insert({ path, alt, mime_type: "image/webp", size_bytes: bytes.length })
      .select("id")
      .single(),
  ).id as string;
}
for (const source of projects) {
  const existing = checked(
    await db
      .from("projects")
      .select("id")
      .eq("slug", source.slug)
      .maybeSingle(),
  );
  if (existing) {
    console.log("Giữ nội dung đã có:", source.slug);
    continue;
  }
  const ids = await Promise.all(
    source.gallery.map((name, index) =>
      ensureMedia(name, source.name + " — hình ảnh " + (index + 1)),
    ),
  );
  const cover =
    ids[source.gallery.indexOf(source.image)] ??
    (await ensureMedia(source.image, source.name));
  const record = requiredData(
    await db
      .from("projects")
      .insert({
        name: source.name,
        slug: source.slug,
        description: source.description,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: source.scope }],
            },
          ],
        },
        type: source.type,
        location: source.location,
        owner: source.owner,
        cover_id: cover,
        status: "published",
        featured: true,
      })
      .select("id")
      .single(),
  );
  const gallery = await db
    .from("project_images")
    .insert(
      ids.map((id, position) => ({
        project_id: record.id,
        media_id: id,
        position,
      })),
    );
  if (gallery.error) {
    await db.from("projects").delete().eq("id", record.id);
    throw new Error(gallery.error.message);
  }
  console.log("Đã nhập:", source.slug);
}
console.log("Hoàn tất. Chưa có bài blog mẫu; tạo bài trong /admin/posts.");
