import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Download,
  HeartHandshake,
  Users,
  Lightbulb,
} from "lucide-react";
import { company, leaders } from "@/lib/company";
import styles from "./about.module.css";
import { AboutMotion } from "./about-motion";
import { ValuesStory } from "./values-story";
import { PrinciplesStory } from "./principles-story";
import { OrganizationSection } from "./organization-section";

export const metadata: Metadata = {
  title: "Giới thiệu về NewGen | NewGen Construction",
  description:
    "Giới thiệu NewGen, thông điệp từ ban lãnh đạo, giá trị cốt lõi, tầm nhìn và sứ mệnh. Tải hồ sơ doanh nghiệp NewGen.",
};

const values = [
  {
    title: "Tận tâm",
    icon: HeartHandshake,
    text: "Lắng nghe và hồi đáp kịp thời nhu cầu của khách hàng; tạo điều kiện để người lao động phát triển và được đối xử công bằng.",
  },
  {
    title: "Hợp tác",
    icon: Users,
    text: "Xây dựng quan hệ chân thành, thiện chí và hiệu quả, hướng đến lợi ích hài hòa giữa khách hàng, đối tác và doanh nghiệp.",
  },
  {
    title: "Đổi mới",
    icon: Lightbulb,
    text: "Không ngừng cải thiện chuyên môn, đào tạo nhân lực và nâng cao chất lượng sản phẩm, dịch vụ.",
  },
];

const principles = [
  {
    title: "Với khách hàng",
    text: "Tôn trọng yêu cầu, cởi mở và cầu thị; lấy chất lượng, uy tín và tiến độ làm trọng tâm.",
    image: "/images/pic21.webp",
    alt: "Hai kỹ sư trao đổi bản vẽ tại công trường",
    position: "70% center",
  },
  {
    title: "Với người lao động",
    text: "Khuyến khích học tập, nâng cao tay nghề và phát triển trên cơ sở hiệu quả công việc.",
    image: "/images/pic69.webp",
    alt: "Đội ngũ NewGen phối hợp làm việc tại công trường",
    position: "center 70%",
  },
  {
    title: "Với đối tác",
    text: "Duy trì quan hệ ổn định, lâu dài, cùng có lợi và giữ chữ tín trong hợp tác.",
    image: "/images/doi-tac.webp",
    alt: "Hai đối tác bắt tay hợp tác trước công trình nhà xưởng",
    position: "center",
  },
  {
    title: "Với cộng đồng",
    text: "Giữ gìn đạo đức kinh doanh, thực hiện trách nhiệm xã hội và chấp hành pháp luật.",
    image: "/images/pic47.webp",
    alt: "Không gian sinh hoạt ngoài trời với cây xanh và đường dạo",
    position: "center",
  },
];

export default function AboutPage() {
  return (
    <AboutMotion>
      <section
        className={`${styles.section} ${styles.intro}`}
        aria-labelledby="about-title"
      >
        <div
          className={styles.introPhoto}
          data-about-background=""
          aria-hidden="true"
        >
          <Image
            src="/images/office.webp"
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 65vw"
            preload
          />
        </div>
        <div className="wrap">
          <nav className={styles.breadcrumbs} aria-label="Đường dẫn">
            <Link href="/">Trang chủ</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Giới thiệu về NewGen</span>
          </nav>
          <div className={styles.split}>
            <div>
              <div className="eyebrow" data-about-item="" data-about-order="0">
                GIỚI THIỆU NEWGEN
              </div>
              <h1 id="about-title" data-about-item="" data-about-order="1">
                Xây bằng năng lực.
                <br />
                <span>Gắn kết bằng niềm tin.</span>
              </h1>
              <p data-about-item="" data-about-order="2">
                Công ty Cổ phần Đầu tư Xây dựng NewGen hoạt động trong lĩnh vực
                xây dựng dân dụng và công nghiệp, nhà xưởng, hạ tầng kỹ thuật;
                đồng thời triển khai chống thấm, xử lý nứt bê tông và các hạng
                mục hoàn thiện.
              </p>
              <dl
                className={styles.facts}
                data-about-item=""
                data-about-order="3"
              >
                <div>
                  <dt>Mã số doanh nghiệp</dt>
                  <dd>{company.taxId}</dd>
                </div>
                <div>
                  <dt>Vốn điều lệ</dt>
                  <dd>{company.capital}</dd>
                </div>
              </dl>
              <a
                className={styles.download}
                data-about-item=""
                data-about-order="4"
                href="https://drive.google.com/file/d/1DIVEkslJcCimmMROrV4H07m2cS82dyaE/view?usp=drivesdk"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download size={22} aria-hidden="true" /> Tải hồ sơ doanh nghiệp
              </a>
              <span
                className={styles.downloadNote}
                data-about-item=""
                data-about-order="5"
              >
                Hồ sơ đầy đủ trên Google Drive · Mở trong tab mới
              </span>
            </div>
          </div>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.message}`}
        aria-labelledby="message-title"
        data-about-native-next=""
      >
        <div
          className={styles.messagePhoto}
          data-about-background=""
          aria-hidden="true"
        >
          <Image
            src="/images/NewGen1.webp"
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 60vw"
          />
        </div>
        <div className={`wrap ${styles.messageGrid}`}>
          <div>
            <div
              className="eyebrow light"
              data-about-item=""
              data-about-order="0"
            >
              THÔNG ĐIỆP
            </div>
            <h2 id="message-title" data-about-item="" data-about-order="1">
              Đồng hành bằng trách nhiệm.
            </h2>
            <blockquote data-about-item="" data-about-order="2">
              “Thành công của quý khách hàng là niềm tự hào của chúng tôi.”
            </blockquote>
            <p data-about-item="" data-about-order="3">
              NewGen chú trọng đầu tư vào con người, máy móc và sự phối hợp với
              đối tác. Tinh thần trách nhiệm, tính kỷ luật và sự đoàn kết của
              đội ngũ là nền tảng để đáp ứng yêu cầu của từng công trình.
            </p>
            <p data-about-item="" data-about-order="4">
              NewGen cam kết mang đến cho chủ đầu tư và khách hàng các sản phẩm
              chất lượng, dịch vụ chuyên nghiệp và đáp ứng yêu cầu tiến độ.
            </p>
          </div>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.values}`}
        aria-labelledby="values-title"
        data-about-native-scroll=""
      >
        <div className="wrap">
          <h2
            id="values-title"
            className={styles.valuesHeading}
            data-about-item=""
            data-about-order="0"
          >
            Giá trị cốt lõi
          </h2>

          <ValuesStory>
            {values.map(({ title, text, icon: Icon }) => (
              <article
                key={title}
                className={styles.valueNode}
                data-value-node=""
              >
                <div className={styles.valueCard} data-value-card="">
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <span className={styles.valueIcon}>
                    <Icon size={36} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                </div>
              </article>
            ))}
          </ValuesStory>
        </div>
      </section>

      <PrinciplesStory>
        <div className={styles.principlesHeading} data-principle-heading="">
          <h2 id="principles-title">Nguyên tắc hoạt động</h2>
          <p className={styles.principlesLead}>
            Từ giá trị chung đến từng hành động.
          </p>
        </div>
        <div className={styles.principleGrid} data-principle-grid="">
          {principles.map(({ title, text, image, alt, position }) => (
            <article key={title} data-principle-step="">
              <div className={styles.principleCard} data-principle-card="">
                <div className={styles.principleCopy}>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
                <div className={styles.principleMedia}>
                  <Image
                    src={image}
                    alt={alt}
                    fill
                    sizes="(max-width: 700px) calc(100vw - 80px), 45vw"
                    style={{ objectPosition: position }}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </PrinciplesStory>

      <section
        className={`${styles.section} ${styles.vision}`}
        aria-labelledby="vision-title"
      >
        <div
          className={styles.visionPhoto}
          data-about-background=""
          aria-hidden="true"
        >
          <Image
            src="/images/centa1.webp"
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 65vw"
          />
        </div>
        <div className={`wrap ${styles.split}`}>
          <div className={styles.visionContent}>
            <div className="eyebrow" data-about-item="" data-about-order="0">
              TẦM NHÌN VÀ SỨ MỆNH
            </div>
            <h2 id="vision-title" data-about-item="" data-about-order="1">
              Hiện đại.
              <br />
              Chuyên nghiệp.
              <br />
              <span>Nhân văn.</span>
            </h2>
            <div className={styles.visionCopy}>
              <article data-about-item="" data-about-order="2">
                <h3>Tầm nhìn</h3>
                <p>
                  Phát triển NewGen theo tiêu chí hiện đại, chuyên nghiệp và
                  nhân văn; đề cao trách nhiệm với khách hàng thông qua chất
                  lượng sản phẩm và dịch vụ.
                </p>
              </article>
              <article data-about-item="" data-about-order="3">
                <h3>Sứ mệnh</h3>
                <p>
                  Phối hợp với các đối tác chuyên môn để tạo nên không gian sống
                  và làm việc phù hợp; đồng hành cùng khách hàng trong suốt quá
                  trình triển khai dự án.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.leadership}`}
        aria-labelledby="leaders-title"
      >
        <div className="wrap">
          <div className="eyebrow" data-about-item="" data-about-order="0">
            BAN LÃNH ĐẠO
          </div>
          <h2 id="leaders-title" data-about-item="" data-about-order="1">
            Con người định hướng <span>NewGen.</span>
          </h2>
          <div className={styles.leaderGrid}>
            {leaders.map((leader, index) => (
              <article key={leader.name}>
                <div
                  className={styles.leaderPhoto}
                  data-about-item="photo"
                  data-about-order={index + 2}
                >
                  <Image
                    src={`/images/${leader.image}.jpg`}
                    alt={leader.name}
                    fill
                    sizes="(max-width: 600px) 100vw, (max-width: 1100px) 35vw, 25vw"
                  />
                </div>
                <div
                  className={styles.leaderCopy}
                  data-about-item="copy"
                  data-about-order={index + 3}
                >
                  <span>{leader.role}</span>
                  <h3>{leader.name}</h3>
                  <p>{leader.summary}</p>
                  <p className={styles.qualification}>{leader.qualification}</p>
                </div>
              </article>
            ))}
          </div>
          <p
            className={styles.representative}
            data-about-item=""
            data-about-order="5"
          >
            Đại diện pháp luật: Ông Nguyễn Văn Tuệ — Tổng Giám đốc.
          </p>
          <Link
            className={styles.contact}
            data-about-item=""
            data-about-order="6"
            href="/lien-he"
          >
            Trao đổi cùng NewGen <ArrowUpRight size={24} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <OrganizationSection />
    </AboutMotion>
  );
}
