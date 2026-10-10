import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/content/auth";
import { logout } from "../actions";
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();
  return (
    <>
      <header className="admin-header">
        <Link href="/admin/projects" className="admin-brand">
          <Image src="/images/logo-transparent.webp" alt="NewGen" width={58} height={46} />
          <span>QUẢN TRỊ NỘI DUNG</span>
        </Link>
        <nav aria-label="Quản trị">
          <Link href="/admin/projects">Công trình</Link>
          <Link href="/admin/posts">Blog</Link>
          <Link href="/admin/categories">Chuyên mục</Link>
          <Link href="/admin/media">Thư viện ảnh</Link>
        </nav>
        <div className="admin-account">
          <span>{user.email}</span>
          <form action={logout}>
            <button>Đăng xuất</button>
          </form>
        </div>
      </header>
      <main className="admin-main">{children}</main>
    </>
  );
}
