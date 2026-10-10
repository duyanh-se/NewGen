import { SiteHeader } from "@/components/story/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import "../pages.css";

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return <div className="inner-site">
    <a className="skip-link" href="#main">Đến nội dung chính</a>
    <SiteHeader />
    <main id="main" tabIndex={-1}>{children}</main>
    <SiteFooter />
  </div>;
}
