import "server-only";
import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { publicClient } from "@/lib/supabase/server";
import { hasSupabaseConfig, supabaseConfig } from "@/lib/supabase/config";
import { requireAdmin } from "./auth";
import {
  pageNumber,
  statuses,
  type Category,
  type ContentKind,
  type Media,
  type Post,
  type Project,
} from "./model";

const projectSelect =
  "*,cover:media!cover_id(*),images:project_images(position,media:media(*))";
const postSelect =
  "*,cover:media!cover_id(*),category:categories!category_id(*)";
export const PAGE_SIZE = 12;
export function mediaUrl(path: string) {
  return (
    supabaseConfig().url +
    "/storage/v1/object/public/content-images/" +
    path.split("/").map(encodeURIComponent).join("/")
  );
}
type RawMedia = Omit<Media, "url">;
type RawProject = Omit<Project, "gallery" | "cover"> & {
  cover: RawMedia | null;
  images: { position: number; media: RawMedia }[];
};
type RawPost = Omit<Post, "cover"> & { cover: RawMedia | null };
function image(m: RawMedia): Media {
  return { ...m, url: mediaUrl(m.path) };
}
function project(raw: RawProject): Project {
  const { images, ...rest } = raw;
  return {
    ...rest,
    cover: raw.cover ? image(raw.cover) : null,
    gallery: (images ?? [])
      .sort((a, b) => a.position - b.position)
      .map((i) => image(i.media)),
  };
}
function post(raw: RawPost): Post {
  return { ...raw, cover: raw.cover ? image(raw.cover) : null };
}

export async function listContent(
  kind: ContentKind,
  options: {
    page?: unknown;
    q?: string;
    status?: string;
    featured?: boolean;
    admin?: boolean;
  } = {},
) {
  const page = pageNumber(options.page);
  if (!hasSupabaseConfig())
    return { items: [] as (Project | Post)[], total: 0, page };
  const db: SupabaseClient = options.admin
    ? (await requireAdmin()).db
    : publicClient();
  let query = db
    .from(kind)
    .select(kind === "projects" ? projectSelect : postSelect, {
      count: "exact",
    });
  if (!options.admin) query = query.eq("status", "published");
  else if (statuses.includes(options.status as (typeof statuses)[number]))
    query = query.eq("status", options.status);
  if (options.q?.trim())
    query = query.ilike(
      kind === "projects" ? "name" : "title",
      "%" + options.q.trim().slice(0, 100).replace(/[\%_]/g, "\\$&") + "%",
    );
  if (kind === "projects" && options.featured)
    query = query.eq("featured", true);
  const { data, count, error } = await query
    .order(options.admin ? "updated_at" : "published_at", { ascending: false })
    .order("id")
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (error) {
    console.error("Content list:", error.code);
    throw new Error("Không thể tải nội dung. Vui lòng thử lại.");
  }
  return {
    items:
      kind === "projects"
        ? (data as unknown as RawProject[]).map(project)
        : (data as unknown as RawPost[]).map(post),
    total: count ?? 0,
    page,
  };
}
export async function listPublishedProjects(): Promise<Project[]> {
  const first = await listContent("projects");
  const remaining = await Promise.all(Array.from(
    { length: Math.max(0, Math.ceil(first.total / PAGE_SIZE) - 1) },
    (_, index) => listContent("projects", { page: index + 2 }),
  ));
  return [...first.items, ...remaining.flatMap(result => result.items)] as Project[];
}

export const getPublishedProject = cache(async (slug: string) => {
  if (!hasSupabaseConfig()) return null;
  const { data, error } = await publicClient()
    .from("projects")
    .select(projectSelect)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error("Không thể tải công trình.");
  return data ? project(data as unknown as RawProject) : null;
});
export const getPublishedPost = cache(async (slug: string) => {
  if (!hasSupabaseConfig()) return null;
  const { data, error } = await publicClient()
    .from("posts")
    .select(postSelect)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error("Không thể tải bài viết.");
  return data ? post(data as unknown as RawPost) : null;
});
export async function getAdminContent(kind: ContentKind, id: string) {
  const { db } = await requireAdmin();
  const { data, error } = await db
    .from(kind)
    .select(kind === "projects" ? projectSelect : postSelect)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Không thể tải nội dung.");
  if (!data) return null;
  return kind === "projects"
    ? project(data as unknown as RawProject)
    : post(data as unknown as RawPost);
}
export async function listCategories() {
  if (!hasSupabaseConfig()) return [];
  const { data, error } = await publicClient()
    .from("categories")
    .select("id,name,slug")
    .order("name");
  if (error) throw new Error("Không thể tải chuyên mục.");
  return data as Category[];
}
export async function listMedia(page: unknown = 1) {
  const { db } = await requireAdmin();
  const n = pageNumber(page);
  const { data, count, error } = await db
    .from("media")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id")
    .range((n - 1) * 24, n * 24 - 1);
  if (error) throw new Error("Không thể tải thư viện ảnh.");
  return { items: (data as RawMedia[]).map(image), total: count ?? 0, page: n };
}
