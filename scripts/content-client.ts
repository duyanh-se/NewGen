import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
if (existsSync(resolve(".env.local")))
  process.loadEnvFile(resolve(".env.local"));
export function contentClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error(
      "Điền NEXT_PUBLIC_SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY trong .env.local trước khi chạy script.",
    );
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
export function checked<
  R extends { data: unknown; error: { message: string } | null },
>(result: R): R["data"] {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}
export function safePath(path: string) {
  if (
    !/^[a-zA-Z0-9_/-]+\.(webp|jpg|jpeg|png)$/.test(path) ||
    path.split("/").some((p) => p === ".." || p === "")
  )
    throw new Error("Đường dẫn ảnh không hợp lệ: " + path);
  return path;
}

export function requiredData<
  R extends { data: unknown; error: { message: string } | null },
>(result: R): NonNullable<R["data"]> {
  const data = checked(result);
  if (data === null || data === undefined)
    throw new Error("Dịch vụ không trả về dữ liệu.");
  return data as NonNullable<R["data"]>;
}
