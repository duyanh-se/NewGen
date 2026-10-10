import type { Metadata } from "next";
import Link from "next/link";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import "./admin.css";
export const metadata: Metadata = {
  title: "Quản trị nội dung | NewGen",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-shell">
      {hasSupabaseConfig() ? (
        children
      ) : (
        <main className="admin-setup">
          <Link href="/">← Website NewGen</Link>
          <h1>Thiết lập quản trị nội dung</h1>
          <p>
            Thực hiện hướng dẫn trong README: tạo project Supabase, chạy
            migration, cấp tài khoản admin và điền thông tin kết nối vào
            .env.local.
          </p>
          <p>Sau khi khởi động lại Next.js, trang đăng nhập sẽ sẵn sàng.</p>
        </main>
      )}
    </div>
  );
}
