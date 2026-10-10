"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prepareImage } from "@/lib/content/image";
import { z } from "zod";
import { sessionClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/content/auth";
import { mediaUrl } from "@/lib/content/data";
import {
  postSchema,
  projectSchema,
  type ContentKind,
  type Media,
} from "@/lib/content/model";

export type ActionResult = { error?: string; id?: string; message?: string };
function errorMessage(error: { code?: string; message?: string }): string {
  if (error.code === "23505")
    return "Đường dẫn đã tồn tại. Hãy chọn đường dẫn khác.";
  if (error.code === "23503")
    return "Ảnh hoặc chuyên mục đang được sử dụng, hoặc không còn tồn tại.";
  if (error.code === "23514")
    return "Dữ liệu hoặc ảnh không hợp lệ. Hãy kiểm tra lại.";
  return "Không thể lưu thay đổi. Nội dung của bạn vẫn được giữ trên biểu mẫu; hãy thử lại.";
}
export async function login(
  _previous: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  const parsed = z
    .object({ email: z.email(), password: z.string().min(1) })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Nhập email và mật khẩu hợp lệ." };
  const db = await sessionClient();
  const { data, error } = await db.auth.signInWithPassword(parsed.data);
  if (error || !data.user)
    return {
      error:
        "Email hoặc mật khẩu không đúng, hoặc dịch vụ đăng nhập chưa sẵn sàng.",
    };
  const { data: admin, error: adminError } = await db
    .from("admin_users")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (adminError || !admin) {
    await db.auth.signOut();
    return { error: "Tài khoản chưa được cấp quyền quản trị." };
  }
  redirect("/admin/projects");
}
export async function logout() {
  const db = await sessionClient();
  await db.auth.signOut();
  redirect("/admin/login");
}

export async function saveContent(
  kind: ContentKind,
  input: unknown,
): Promise<ActionResult> {
  const { db } = await requireAdmin();
  if (kind !== "projects" && kind !== "posts")
    return { error: "Loại nội dung không hợp lệ." };
  const parsed = (kind === "projects" ? projectSchema : postSchema).safeParse(
    input,
  );
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
    };
  try {
    const { id } = parsed.data;
    const savedId = id ?? crypto.randomUUID();
    const old = id
      ? await db.from(kind).select("slug").eq("id", id).maybeSingle()
      : null;
    if (id && (!old?.data || old.error))
      return { error: "Nội dung không còn tồn tại. Hãy tải lại danh sách." };
    if (kind === "projects") {
      const { gallery, ...payload } = projectSchema.parse(input);
      const { error } = await db.rpc("save_project", {
        payload: { ...payload, id: savedId },
        gallery,
      });
      if (error) return { error: errorMessage(error) };
    } else {
      const values = postSchema.omit({ id: true }).parse(input);
      const payload = { ...values, id: savedId };
      const { error } = id
        ? await db.from("posts").update(values).eq("id", id)
        : await db.from("posts").insert(payload);
      if (error) return { error: errorMessage(error) };
    }
    const prefix = kind === "projects" ? "/du-an" : "/blog";
    revalidatePath(prefix);
    revalidatePath(prefix + "/" + parsed.data.slug);
    if (old?.data?.slug) revalidatePath(prefix + "/" + old.data.slug);
    revalidatePath("/admin/" + kind);
    revalidatePath("/admin/" + kind + "/" + savedId);
    return { id: savedId, message: "Đã lưu nội dung." };
  } catch {
    return {
      error:
        "Kết nối bị gián đoạn. Nội dung vẫn ở trên biểu mẫu; hãy thử lưu lại.",
    };
  }
}

export async function uploadImage(
  form: FormData,
): Promise<{ media?: Media; error?: string }> {
  const { db } = await requireAdmin();
  const file = form.get("file");
  if (!(file instanceof File)) return { error: "Chọn ảnh cần tải lên." };
  let buffer: Buffer;
  try {
    buffer = await prepareImage(file);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Ảnh không hợp lệ.",
    };
  }
  const path = crypto.randomUUID() + ".webp";
  const { error: uploadError } = await db.storage
    .from("content-images")
    .upload(path, buffer, { contentType: "image/webp", upsert: false });
  if (uploadError)
    return { error: "Không thể tải ảnh lên. Hãy kiểm tra kết nối và thử lại." };
  const { data, error } = await db
    .from("media")
    .insert({
      path,
      alt: String(form.get("alt") ?? "")
        .trim()
        .slice(0, 300),
      mime_type: "image/webp",
      size_bytes: buffer.length,
    })
    .select()
    .single();
  if (error) {
    await db.storage.from("content-images").remove([path]);
    return { error: "Không thể đăng ký ảnh trong thư viện." };
  }
  revalidatePath("/admin/media");
  return { media: { ...data, url: mediaUrl(path) } as Media };
}
export async function deleteImage(id: string): Promise<ActionResult> {
  const { db } = await requireAdmin();
  if (!z.uuid().safeParse(id).success) return { error: "Ảnh không hợp lệ." };
  const { data: path, error } = await db.rpc("begin_media_delete", {
    target_id: id,
  });
  if (error)
    return {
      error:
        error.code === "23503"
          ? "Ảnh đang được dùng. Hãy gỡ ảnh khỏi nội dung trước."
          : "Không thể xóa ảnh.",
    };
  const { error: storageError } = await db.storage
    .from("content-images")
    .remove([path]);
  if (storageError)
    return {
      error:
        "Chưa xóa được file. Ảnh được đánh dấu đang xóa; hãy bấm xóa lại để hoàn tất.",
    };
  const { error: deleteError } = await db.from("media").delete().eq("id", id);
  if (deleteError)
    return { error: "File đã xóa; hãy bấm xóa lại để hoàn tất dọn thư viện." };
  revalidatePath("/admin/media");
  return { message: "Đã xóa ảnh." };
}
export async function updateImageAlt(
  id: string,
  alt: string,
): Promise<ActionResult> {
  const { db } = await requireAdmin();
  if (
    !z.uuid().safeParse(id).success ||
    typeof alt !== "string" ||
    alt.length > 300
  )
    return { error: "Mô tả ảnh không hợp lệ." };
  const { error } = await db
    .from("media")
    .update({ alt: alt.trim() })
    .eq("id", id);
  if (error) return { error: "Không thể lưu mô tả ảnh." };
  revalidatePath("/admin/media");
  revalidatePath("/du-an", "layout");
  revalidatePath("/blog", "layout");
  return { message: "Đã lưu mô tả ảnh." };
}
export async function saveCategory(form: FormData): Promise<ActionResult> {
  const { db } = await requireAdmin();
  const parsed = z
    .object({
      name: z.string().trim().min(1).max(100),
      slug: z
        .string()
        .max(200)
        .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return { error: "Nhập tên và đường dẫn chuyên mục hợp lệ." };
  const { error } = await db.from("categories").insert(parsed.data);
  if (error) return { error: errorMessage(error) };
  revalidatePath("/admin/categories");
  return { message: "Đã thêm chuyên mục." };
}
export async function deleteCategory(id: string): Promise<ActionResult> {
  const { db } = await requireAdmin();
  if (!z.uuid().safeParse(id).success)
    return { error: "Chuyên mục không hợp lệ." };
  const { error } = await db.from("categories").delete().eq("id", id);
  if (error)
    return {
      error:
        error.code === "23503"
          ? "Chuyên mục đang có bài viết. Hãy đổi chuyên mục của các bài trước."
          : "Không thể xóa chuyên mục.",
    };
  revalidatePath("/admin/categories");
  return { message: "Đã xóa chuyên mục." };
}

export async function findMedia(page: number) {
  const { listMedia } = await import("@/lib/content/data");
  return listMedia(page);
}
