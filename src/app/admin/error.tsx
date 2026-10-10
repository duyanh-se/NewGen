"use client";
import Link from "next/link";
export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <main className="admin-setup">
      <h1>Chưa thể mở trang quản trị</h1>
      <p>Kiểm tra kết nối và quyền admin của tài khoản, sau đó thử lại.</p>
      <button onClick={reset}>Thử lại</button>{" "}
      <Link href="/admin/login">Về đăng nhập</Link>
    </main>
  );
}
