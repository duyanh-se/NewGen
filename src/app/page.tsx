"use client";

import Image from "next/image";
import Link from "next/link";
import { company, leaders, personnelTotal } from "@/lib/company";
import { SiteFooter } from "@/components/site/site-footer";

import { StoryMotion, PartnerCarousel } from "@/components/story/experience";
import { WebsiteIntro } from "@/components/story/website-intro";
import { SiteHeader } from "@/components/story/site-header";
import { ServicesSection } from "@/components/story/services-section";
import { FoundationSection } from "@/components/story/foundation-section";
import {
  Phone,
  Mail,
  MapPin,
  Check,
  ShieldCheck,
  HardHat,
  Ruler,
  Plus,
  House,
  ArrowUpRight,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  [
    "NewGen triển khai những loại công trình nào?",
    "NewGen hoạt động trong xây dựng dân dụng, công nghiệp, nhà xưởng, hạ tầng kỹ thuật, chống thấm và xử lý nứt bê tông. Chúng tôi trao đổi trực tiếp để xác định phạm vi phù hợp với từng dự án.",
  ],
  [
    "Tôi cần chuẩn bị thông tin gì để trao đổi về dự án?",
    "Bạn có thể cung cấp địa điểm, loại công trình, quy mô dự kiến, bản vẽ hiện có và yêu cầu tiến độ. Đội ngũ NewGen sẽ tiếp nhận và cùng bạn làm rõ các yêu cầu kỹ thuật.",
  ],
  [
    "Có thể xem thêm hồ sơ năng lực của NewGen ở đâu?",
    "Vui lòng liên hệ hotline 0967 779 137 hoặc email newgenconstruction.hz@gmail.com để nhận hồ sơ năng lực và trao đổi về các dự án liên quan.",
  ],
  [
    "NewGen có thực hiện các hạng mục riêng lẻ không?",
    "Bên cạnh xây dựng, hồ sơ năng lực có các hạng mục kết cấu, hoàn thiện, điện nước, chống thấm và xử lý nứt bê tông. Phạm vi công việc sẽ được thống nhất theo nhu cầu và điều kiện thực tế.",
  ],
];
export default function Home() {
  return (
    <StoryMotion>
      <WebsiteIntro />
      <div id="site-content">
        <a className="skip-link" href="#main">
          Đến nội dung chính
        </a>
        <SiteHeader />
        <main id="main" className="landing-page">
          <div className="hero-foundation-stage">
            <section className="hero">
              <Image
                src="/images/pic1.webp"
                alt="Cần trục và công trường xây dựng trong hồ sơ NewGen"
                fill
                preload
                sizes="100vw"
                className="hero-image"
              />
              <div className="hero-shade" />
              <div className="wrap hero-content">
                <div className="eyebrow light">
                  <span /> NEWGEN CONSTRUCTION
                </div>
                <h1>
                  Chuẩn công trình.
                  <br />
                  <span>Vững niềm tin.</span>
                </h1>
                <p>
                  Bền vững từ nền móng. Tận tâm từng chi tiết.
                  <br className="desktop-break" /> NewGen đồng hành cùng bạn
                  kiến tạo những công trình có giá trị lâu dài.
                </p>
                <div className="hero-actions">
                  <Link
                    data-slot="button"
                    className={buttonVariants() + " button-white"}
                    href="/du-an"
                  >
                    Khám phá dự án
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </Link>
                  <Link className="hero-secondary" href="/lien-he">
                    Trao đổi cùng NewGen{" "}
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </Link>
                </div>
                <div className="hero-values">
                  <span>
                    <Check size={16} aria-hidden="true" /> Chất lượng
                  </span>
                  <span>
                    <Check size={16} aria-hidden="true" /> Uy tín
                  </span>
                  <span>
                    <Check size={16} aria-hidden="true" /> Đúng tiến độ
                  </span>
                </div>
              </div>
              <div className="hero-caption">
                XÂY NỀN TẢNG VỮNG CHẮC
                <br />
                <strong>KIẾN TẠO TƯƠNG LAI</strong>
              </div>
            </section>
            <div className="foundation-about-stage">
              <FoundationSection />
              <section
                className="about-overlap"
                id="gioi-thieu"
                aria-labelledby="about-title"
              >
                <div className="about-background" aria-hidden="true">
                  <Image src="/images/pic69.webp" alt="" fill sizes="100vw" />
                </div>
                <div className="wrap about-screen">
                  <div className="about-copy">
                    <div className="eyebrow about-step">VỀ NEWGEN</div>
                    <h2 id="about-title" className="about-step">
                      Xây bằng năng lực.
                      <br />
                      <span>Gắn kết bằng niềm tin.</span>
                    </h2>
                    <p className="about-step">
                      Công ty Cổ phần Đầu tư Xây dựng NewGen hoạt động trong xây
                      dựng dân dụng, công nghiệp, nhà xưởng và hạ tầng kỹ thuật;
                      đồng thời triển khai chống thấm, xử lý nứt bê tông và các
                      hạng mục hoàn thiện. NewGen có vốn điều lệ{" "}
                      {company.capital} và đội ngũ {personnelTotal} cán bộ
                      chuyên môn gồm kỹ sư xây dựng, cầu đường, điện, cấp thoát
                      nước, kiến trúc sư và chuyên ngành khảo sát trắc địa.
                    </p>

                    <Link
                      className="text-link about-step"
                      href="/nang-luc-xay-dung"
                    >
                      Tìm hiểu năng lực NewGen{" "}
                      <Plus size={17} aria-hidden="true" />
                    </Link>
                  </div>
                  <div className="about-values about-step">
                    <span>Chất lượng</span>
                    <span>Uy tín</span>
                    <span>Đúng tiến độ</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
          <ServicesSection />
          <section
            className="leadership-section story-snap-target"
            aria-labelledby="leadership-title"
          >
            <div className="section wrap leadership">
              <div className="section-heading leadership-heading">
                <div>
                  <div className="eyebrow">BAN LÃNH ĐẠO</div>
                  <h2 id="leadership-title">
                    Đội ngũ của
                    <br />
                    NEWGEN
                  </h2>
                </div>
                <p>
                  Đội ngũ điều hành NewGen đồng hành cùng đối tác trong từng
                  quyết định và công trình.
                </p>
              </div>
              <div className="leadership-grid">
                {leaders.map((leader) => (
                  <article
                    className="leader-card"
                    key={leader.name}
                    tabIndex={0}
                  >
                    <div className="leader-portrait">
                      <Image
                        src={`/images/${leader.image}.jpg`}
                        alt={leader.name}
                        fill
                        sizes="(max-width: 800px) 38vw, 30vw"
                      />
                    </div>
                    <div className="leader-details">
                      <p className="leader-role">{leader.role}</p>
                      <h3>{leader.name}</h3>
                      <p className="leader-qualification">
                        {leader.qualification}
                      </p>
                    </div>
                    <div className="leader-intro">
                      <p>“{leader.summary}”</p>
                      <span>Định hướng & kinh nghiệm</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
          <section className="capability" id="nang-luc">
            <div className="wrap capability-grid">
              <div>
                <div className="eyebrow light">NĂNG LỰC NEWGEN</div>
                <h2>
                  Nền tảng vững vàng.
                  <br />
                  Sẵn sàng đồng hành.
                </h2>
                <p>
                  Con người, thiết bị và tinh thần trách nhiệm tạo nên năng lực
                  triển khai của NewGen.
                </p>
                <div className="capability-items">
                  {[
                    [
                      HardHat,
                      "Đội ngũ chuyên môn",
                      "Kỹ sư xây dựng, cầu đường, điện, cấp thoát nước và kiến trúc sư, với thâm niên công tác từ 2 đến 15 năm.",
                    ],
                    [
                      Ruler,
                      "Thiết bị phục vụ thi công",
                      "Máy xúc, máy lu, máy ủi, vận thăng và thiết bị trắc đạc phục vụ các hạng mục xây dựng.",
                    ],
                    [
                      ShieldCheck,
                      "Cam kết trong từng hạng mục",
                      "Lấy chất lượng, uy tín và tiến độ làm trọng tâm; tôn trọng yêu cầu và đồng hành cùng chủ đầu tư.",
                    ],
                  ].map(([Icon, title, text]) => {
                    const I = Icon as typeof HardHat;
                    return (
                      <div className="capability-item" key={title as string}>
                        <I size={26} aria-hidden="true" />
                        <div>
                          <h3>{title as string}</h3>
                          <p>{text as string}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Link
                  className="text-link capability-link"
                  href="/nang-luc-xay-dung"
                >
                  Khám phá năng lực xây dựng{" "}
                  <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
              </div>
              <div className="capability-photo">
                <Image
                  src="/images/pic24.webp"
                  alt="Thi công kết cấu nhà xưởng trong hồ sơ năng lực"
                  fill
                  sizes="(max-width: 768px) 100vw, 45vw"
                />
                <div>
                  <span>HIỆN ĐẠI · CHUYÊN NGHIỆP · NHÂN VĂN</span>
                  <p>
                    Thành công của khách hàng
                    <br />
                    là niềm tự hào của chúng tôi.
                  </p>
                </div>
              </div>
            </div>
          </section>
          <PartnerCarousel />
          <section className="faq-section">
            <div className="wrap faq-grid">
              <div>
                <div className="eyebrow">THÔNG TIN HỮU ÍCH</div>
                <h2>
                  Trước khi <br />
                  bắt đầu hợp tác.
                </h2>
                <p>
                  Hiểu rõ nhu cầu là bước đầu tiên
                  <br />
                  để xây dựng một giải pháp phù hợp.
                </p>
                <Link className="text-link partner-contact" href="/lien-he">
                  Trao đổi cùng NewGen{" "}
                  <ArrowUpRight size={24} aria-hidden="true" />
                </Link>
              </div>

              <Accordion multiple={false} className="faq-list">
                {faqs.map(([q, a], i) => (
                  <AccordionItem value={"faq-" + i} key={q}>
                    <AccordionTrigger>{q}</AccordionTrigger>
                    <AccordionContent>{a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
          <section className="contact-section" id="lien-he">
            <div className="wrap contact-grid">
              <div>
                <div className="eyebrow light">KẾT NỐI VỚI NEWGEN</div>
                <h2>
                  Công trình tiếp theo.
                  <br />
                  Bắt đầu từ một cuộc trò chuyện.
                </h2>
                <p>
                  Chia sẻ nhu cầu của bạn. NewGen sẵn sàng lắng nghe
                  <br className="desktop-break" /> và trao đổi giải pháp cho dự
                  án.
                </p>
                <a
                  data-slot="button"
                  className={buttonVariants() + " button-white"}
                  href={company.phoneHref}
                >
                  <Phone size={17} aria-hidden="true" />
                  {company.phone}
                </a>
              </div>
              <div className="contact-details">
                <a href={`mailto:${company.email}`}>
                  <Mail aria-hidden="true" />
                  <div>
                    <span>EMAIL</span>
                    <strong>
                      {company.email.split("@")[0]}
                      <wbr />@{company.email.split("@")[1]}
                    </strong>
                  </div>
                </a>
                <div>
                  <MapPin aria-hidden="true" />
                  <div>
                    <span>TRỤ SỞ</span>
                    <strong>{company.address}</strong>
                  </div>
                </div>
                <div>
                  <House aria-hidden="true" />
                  <div>
                    <span> Văn Phòng Đại diện</span>
                    <strong>{company.office}</strong>
                  </div>
                </div>
                <div className="contact-note">
                  TẬN TÂM TỪ TIẾP NHẬN ĐẾN THI CÔNG
                </div>
              </div>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    </StoryMotion>
  );
}
