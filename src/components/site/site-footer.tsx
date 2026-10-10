import Image from "next/image";
import Link from "next/link";
import { company } from "@/lib/company";

export function SiteFooter() {
  return (
    <footer className="wrap footer">
      <Link href="/" className="footer-brand">
        <Image
          src="/images/logo-transparent.webp"
          alt="NewGen Construction"
          width={75}
          height={60}
        />
        <span className="text-lg">
          {company.name}
          <br />
          <small>Mã số doanh nghiệp: {company.taxId}</small>
        </span>
      </Link>
      <span className="text-lg">
        © {new Date().getFullYear()} NewGen Construction.
      </span>
    </footer>
  );
}
