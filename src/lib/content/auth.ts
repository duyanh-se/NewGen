import "server-only";
import { redirect } from "next/navigation";
import { sessionClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const db = await sessionClient();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user) redirect("/admin/login");
  const { data: admin, error: adminError } = await db
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (adminError || !admin)
    throw new Error("Tài khoản chưa được cấp quyền quản trị.");
  return { db, user };
}
