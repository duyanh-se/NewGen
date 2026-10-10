import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/admin/login-form";
export default function LoginPage() {
  return (
    <main className="admin-login">
      <div className="admin-login-brand">
        <Image
          src="/images/logo-transparent.webp"
          alt="NewGen Construction"
          width={100}
          height={80}
        />
        <p>NEWGEN / QUẢN TRỊ NỘI DUNG</p>
        <h1>
          Công trình và câu chuyện
          <br />
          từ NewGen.
        </h1>
        <p>Đăng nhập để quản lý hồ sơ công trình, hình ảnh và bài blog.</p>
        <Link href="/">← Về website</Link>
      </div>
      <div className="admin-login-card">
        <h2>Đăng nhập</h2>
        <p>Dành cho tài khoản đã được cấp quyền quản trị.</p>
        <LoginForm />
      </div>
    </main>
  );
}
