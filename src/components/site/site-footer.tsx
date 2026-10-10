import Image from "next/image";
import Link from "next/link";
import { company } from "@/lib/company";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import styles from "./site-footer.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.grid}`}>
        <div className={styles.identity}>
          <Link href="/" className={styles.brand} aria-label="NewGen - Trang chủ">
            <Image src="/images/logo-transparent.webp" alt="NewGen Construction" width={88} height={70} />
          </Link>
          <p className={styles.company}>{company.name}</p>
          <p className={styles.address}>{company.address}</p>
        </div>
        <nav className={styles.links} aria-label="Điều hướng cuối trang">
          <h2>Khám phá NewGen</h2>
          <Link href="/gioi-thieu">Giới thiệu về NewGen <ArrowUpRight size={16} aria-hidden="true" /></Link>
          <Link href="/nang-luc-xay-dung">Năng lực xây dựng <ArrowUpRight size={16} aria-hidden="true" /></Link>
          <Link href="/du-an">Dự án tiêu biểu <ArrowUpRight size={16} aria-hidden="true" /></Link>
          <Link href="/blog">Blog <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </nav>
        <div className={styles.contact}>
          <h2>Liên hệ hợp tác</h2>
          <a href={company.phoneHref}><Phone size={18} aria-hidden="true" />{company.phone}</a>
          <a href={`mailto:${company.email}`}><Mail size={18} aria-hidden="true" /><span>{company.email.split("@")[0]}<wbr />@{company.email.split("@")[1]}</span></a>
          <Link className={styles.contactLink} href="/lien-he">Liên hệ hợp tác <ArrowUpRight size={17} aria-hidden="true" /></Link>
        </div>
      </div>
      <div className={`wrap ${styles.bottom}`}>
        <span>© {new Date().getFullYear()} NewGen Construction.</span>
        <span>Mã số doanh nghiệp: {company.taxId}</span>
      </div>
    </footer>
  );
}
