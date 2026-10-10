import { z } from "zod";

export const statuses = ["draft", "published", "archived"] as const;
export type ContentKind = "projects" | "posts";
export type PublicationStatus = (typeof statuses)[number];
export interface RichNode {
  type: string;
  text?: string;
  attrs?: {
    level?: number;
    start?: number;
    language?: string | null;
    type?: string | null;
  };
  marks?: { type: string }[];
  content?: RichNode[];
}
export interface RichDocument extends RichNode {
  type: "doc";
}
export const emptyDocument: RichDocument = { type: "doc", content: [] };
const nodeTypes = new Set([
  "doc",
  "paragraph",
  "text",
  "heading",
  "bulletList",
  "orderedList",
  "listItem",
  "blockquote",
  "codeBlock",
  "hardBreak",
  "horizontalRule",
]);
const markTypes = new Set(["bold", "italic", "strike", "code"]);
export function validDocument(value: unknown): value is RichDocument {
  let nodes = 0;
  function visit(value: unknown, depth: number): boolean {
    if (!value || typeof value !== "object" || depth > 20 || ++nodes > 10000)
      return false;
    const n = value as RichNode;
    if (!nodeTypes.has(n.type) || (depth > 0 && n.type === "doc")) return false;
    if (
      n.type === "text" &&
      (typeof n.text !== "string" || n.text.length > 100000)
    )
      return false;
    if (
      n.attrs &&
      (typeof n.attrs !== "object" ||
        Object.keys(n.attrs).some(
          (k) => !["level", "start", "language", "type"].includes(k),
        ))
    )
      return false;
    if (n.type === "heading" && ![2, 3, 4].includes(n.attrs?.level ?? 0))
      return false;
    if (
      n.attrs?.start !== undefined &&
      (!Number.isInteger(n.attrs.start) || n.attrs.start < 1)
    )
      return false;
    if (
      n.marks &&
      (!Array.isArray(n.marks) ||
        !n.marks.every((m) => m && markTypes.has(m.type)))
    )
      return false;
    return (
      n.content === undefined ||
      (Array.isArray(n.content) && n.content.every((c) => visit(c, depth + 1)))
    );
  }
  return (
    !!value &&
    (value as RichNode).type === "doc" &&
    JSON.stringify(value).length <= 500000 &&
    visit(value, 0)
  );
}
const optionalId = z
  .union([z.uuid(), z.literal("")])
  .transform((v) => v || null);
const common = {
  id: optionalId,
  slug: z
    .string()
    .trim()
    .min(1, "Nhập đường dẫn.")
    .max(200)
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Đường dẫn chỉ gồm chữ thường không dấu, số và dấu gạch ngang.",
    ),
  description: z.string().trim().max(2000, "Mô tả tối đa 2.000 ký tự."),
  content: z.custom<RichDocument>(
    validDocument,
    "Nội dung không hợp lệ hoặc quá dài.",
  ),
  cover_id: optionalId,
  status: z.enum(statuses),
  seo_title: z.string().trim().max(200),
  seo_description: z.string().trim().max(500),
};
export const projectSchema = z.object({
  ...common,
  name: z.string().trim().min(1, "Nhập tên công trình.").max(200),
  type: z.string().trim().max(200),
  location: z.string().trim().max(300),
  owner: z.string().trim().max(300),
  area: z
    .union([z.literal(""), z.coerce.number().positive()])
    .transform((v) => (v === "" ? null : v)),
  year: z
    .union([z.literal(""), z.coerce.number().int().min(1900).max(2200)])
    .transform((v) => (v === "" ? null : v)),
  construction_status: z.enum([
    "unspecified",
    "planned",
    "in_progress",
    "completed",
  ]),
  featured: z.boolean(),
  gallery: z
    .array(z.uuid())
    .max(100)
    .refine((v) => new Set(v).size === v.length, "Thư viện có ảnh trùng."),
});
export const postSchema = z.object({
  ...common,
  title: z.string().trim().min(1, "Nhập tiêu đề bài viết.").max(200),
  category_id: optionalId,
  author: z.string().trim().max(200),
});
export type ProjectInput = z.infer<typeof projectSchema>;
export type PostInput = z.infer<typeof postSchema>;
export interface Media {
  id: string;
  path: string;
  alt: string;
  mime_type: string;
  size_bytes: number;
  state: "ready" | "deleting";
  created_at: string;
  url: string;
}
export interface Category {
  id: string;
  name: string;
  slug: string;
}
interface BaseContent {
  id: string;
  slug: string;
  description: string;
  content: RichDocument;
  cover_id: string | null;
  status: PublicationStatus;
  seo_title: string;
  seo_description: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  cover: Media | null;
}
export interface Project extends BaseContent {
  name: string;
  type: string;
  location: string;
  owner: string;
  area: number | null;
  year: number | null;
  construction_status: ProjectInput["construction_status"];
  featured: boolean;
  gallery: Media[];
}
export interface Post extends BaseContent {
  title: string;
  category_id: string | null;
  author: string;
  category: Category | null;
}
export const statusLabels: Record<PublicationStatus, string> = {
  draft: "Nháp",
  published: "Đã xuất bản",
  archived: "Lưu trữ",
};
export function pageNumber(value: unknown): number {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? Math.min(n, 100000) : 1;
}
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
