import type { Metadata } from "next";
import { ArrowUpRight, Phone, Mail, MapPin, Building2 } from "lucide-react";
import { company } from "@/lib/company";
import { PageHeading, PagePhoto } from "@/components/site/page-parts";
import { PageReveal } from "@/components/site/page-reveal";

export const metadata: Metadata = {
  title: "Liên hệ hợp tác | NewGen Construction",
  description:
    "Liên hệ NewGen qua hotline 0967 779 137 hoặc email newgenconstruction.hz@gmail.com để trao đổi về dự án xây dựng.",
};

export default function ContactPage() {
  return (
    <PageReveal>
      <PageHeading
        label="Liên hệ hợp tác"
        title="Công trình tiếp theo. Bắt đầu từ một cuộc trò chuyện."
        description="Chia sẻ địa điểm, quy mô, bản vẽ hiện có và yêu cầu tiến độ. Đội ngũ NewGen sẽ cùng bạn làm rõ nhu cầu của dự án."
      />
      <section className="wrap inner-contact" aria-label="Thông tin liên hệ">
        <div className="inner-contact-primary" data-page-reveal="">
          <div className="eyebrow light">KẾT NỐI TRỰC TIẾP</div>
          <h2>Trao đổi cùng NewGen.</h2>
          <a href={company.phoneHref}>
            <Phone size={22} aria-hidden="true" />
            <span>
              <small>HOTLINE</small>
              <strong>{company.phone}</strong>
            </span>
            <ArrowUpRight aria-hidden="true" />
          </a>
          <a href={`mailto:${company.email}`}>
            <Mail size={22} aria-hidden="true" />
            <span>
              <small>EMAIL</small>
              <strong>{company.email.split("@")[0]}<wbr />@{company.email.split("@")[1]}</strong>
            </span>
            <ArrowUpRight aria-hidden="true" />
          </a>
          <p>
            Bạn cũng có thể liên hệ để nhận hồ sơ năng lực và trao đổi về các
            công trình liên quan.
          </p>
        </div>
        <div className="inner-contact-addresses">
          <article data-page-reveal="">
            <MapPin aria-hidden="true" />
            <h2>Trụ sở</h2>
            <p>{company.address}</p>
          </article>
          <article data-page-reveal="">
            <Building2 aria-hidden="true" />
            <h2>Văn phòng đại diện</h2>
            <p>{company.office}</p>
          </article>
          <p className="inner-caption" data-page-reveal="">
            {company.name}
            <br />
            Mã số doanh nghiệp: {company.taxId}
          </p>
        </div>
      </section>
      <PagePhoto
        image="office1"
        alt="Không gian đón tiếp tại văn phòng NewGen"
      />
      <section className="wrap inner-section inner-split">
        <div data-page-reveal="">
          <div className="eyebrow">CHUẨN BỊ CHO BUỔI TRAO ĐỔI</div>
          <h2>
            Hiểu rõ nhu cầu.
            <br />
            Cùng tìm giải pháp.
          </h2>
        </div>
        <div className="inner-prose" data-page-reveal="">
          <p>
            Để cuộc trao đổi thuận tiện hơn, bạn có thể chuẩn bị những thông tin
            đã có về công trình:
          </p>
          <ul className="inner-checklist">
            <li>Địa điểm và loại công trình dự kiến.</li>
            <li>Quy mô, hạng mục cần triển khai và bản vẽ hiện có.</li>
            <li>Yêu cầu kỹ thuật và tiến độ mong muốn.</li>
            <li>Thông tin người phụ trách để NewGen trao đổi trực tiếp.</li>
          </ul>
        </div>
      </section>
    </PageReveal>
  );
}
