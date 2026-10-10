import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading } from "@/components/site/page-parts";
import { LegacyRedirect } from "./legacy-redirect";

export const metadata: Metadata = {
  title: "Năng lực xây dựng | NewGen Construction",
  robots: { index: false, follow: true },
};

export default function LegacyServicesPage() {
  return <>
    <LegacyRedirect />
    <PageHeading label="Năng lực xây dựng" title="Năng lực xây dựng" description="Trang này đã chuyển sang đường dẫn mới." />
    <div className="wrap inner-section"><Link className="inner-button" href="/nang-luc-xay-dung">Xem năng lực xây dựng</Link></div>
  </>;
}
