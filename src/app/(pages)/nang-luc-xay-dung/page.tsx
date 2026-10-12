import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { ContactCallout } from "@/components/site/page-parts";
import {
  constructionTypes,
  equipmentGroups,
  equipmentPhotos,
} from "./capability-data";
import { CapabilityMotion } from "./capability-motion";
import styles from "./capability.module.css";

export const metadata: Metadata = {
  title: "Năng lực xây dựng | NewGen Construction",
  description:
    "Năng lực thi công chung cư, nhà xưởng, văn phòng, trường học và nhà ở của NewGen. Danh mục thiết bị và hình ảnh máy móc theo hồ sơ năng lực.",
};

export default function ConstructionCapabilityPage() {
  return (
    <>
      <CapabilityMotion>
        <section
          className={styles.hero}
          data-capability-hero=""
          aria-labelledby="capability-title"
        >
          <div className={styles.heroViewport} data-capability-hero-viewport="">
            <div className={`${styles.heroImage} ${styles.heroFirst}`}>
              <Image
                src="/images/pic9.webp"
                alt="Máy xúc tại công trường xây dựng"
                fill
                sizes="100vw"
                preload
              />
            </div>
            <div
              className={`${styles.heroImage} ${styles.heroSecond}`}
              aria-hidden="true"
            >
              <Image
                src="/images/pic15.webp"
                alt=""
                fill
                sizes="100vw"
                loading="eager"
              />
            </div>
            <div className={`wrap ${styles.heroContent}`}>
              <nav className={styles.breadcrumbs} aria-label="Đường dẫn">
                <Link href="/">Trang chủ</Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page">Năng lực xây dựng</span>
              </nav>
              <div className={styles.heroCopy}>
                <span className={styles.heroEyebrow}>NEWGEN CONSTRUCTION</span>
                <h1 id="capability-title">
                  Năng lực
                  <br />
                  xây dựng
                </h1>
                <p>
                  Thi công nhà xưởng, văn phòng, trường học và công trình nhà ở.
                  Đồng hành từ kết cấu đến hoàn thiện.
                </p>
                <a className={styles.heroLink} href="#xay-dung">
                  Khám phá năng lực <ArrowDown size={18} aria-hidden="true" />
                </a>
              </div>
              <span className={styles.heroFootnote}>
                CÔNG TRÌNH THỰC. GIÁ TRỊ THỰC.
              </span>
            </div>
          </div>
        </section>

        <section
          id="xay-dung"
          className={`wrap ${styles.construction}`}
          aria-labelledby="construction-title"
        >
          <div className={styles.sectionHeading}>
            <div data-capability-reveal="">
              <div>
                <span className={styles.eyebrow}>PHẠM VI THI CÔNG</span>
                <h2 id="construction-title">
                  Các công trình
                  <br />
                  xây dựng
                </h2>
              </div>
            </div>
            <div data-capability-reveal="">
              <p>
                Các loại công trình từ công trình dân dụng đến nhà xưởng công
                nghiệp.
              </p>
            </div>
          </div>
          <div className={styles.constructionGrid}>
            {constructionTypes.map(({ name, image }) => (
              <figure
                key={image}
                className={styles.photoCard}
                data-capability-type=""
                data-capability-reveal=""
              >
                <div className={styles.photo}>
                  <Image
                    src={`/images/${image}.webp`}
                    alt={`Minh họa công trình ${name.toLowerCase()}`}
                    fill
                    sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 999px) 45vw, 290px"
                  />
                </div>
                <figcaption>{name}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section
          id="may-moc"
          className={styles.machinery}
          aria-labelledby="machinery-title"
        >
          <div className={styles.machineBanner} data-capability-banner="">
            <div className={styles.bannerImage} data-capability-banner-image="">
              <Image
                src="/images/pic30.webp"
                alt="Máy xúc thi công tại công trường"
                fill
                sizes="100vw"
              />
            </div>
            <div className={`wrap ${styles.bannerCopy}`}>
              <div data-capability-reveal="">
                <div>
                  <span className={styles.heroEyebrow}>
                    TRANG THIẾT BỊ NEWGEN
                  </span>
                  <h2 id="machinery-title">
                    Năng lực
                    <br />
                    máy móc
                  </h2>
                  <p>Danh mục thiết bị thi công và hình ảnh máy móc.</p>
                </div>
              </div>
            </div>
          </div>
          <div className={`wrap ${styles.machineContent}`}>
            <div className={styles.equipment}>
              <div data-capability-reveal="">
                <h3 id="equipment-title">Danh mục thiết bị</h3>
              </div>
              <p id="equipment-scroll-hint" className={styles.tableHint}>
                Vuốt ngang để xem đầy đủ
              </p>
              <div
                className={styles.tableScroll}
                role="region"
                aria-labelledby="equipment-title"
                aria-describedby="equipment-scroll-hint"
                tabIndex={0}
              >
                <table className={styles.table}>
                  <caption className={styles.srOnly}>
                    Số lượng và ghi chú thiết bị theo hồ sơ năng lực NewGen
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">STT</th>
                      <th scope="col">Thiết bị</th>
                      <th scope="col">Số lượng</th>
                      <th scope="col">Ghi chú</th>
                    </tr>
                  </thead>
                  {equipmentGroups.map((group) => (
                    <tbody key={group.name}>
                      <tr className={styles.tableGroup}>
                        <th scope="rowgroup" colSpan={4}>
                          {group.name}
                        </th>
                      </tr>
                      {group.items.map((item, index) => (
                        <tr key={item.name} data-capability-equipment="">
                          <td>{index + 1}</td>
                          <th scope="row">{item.name}</th>
                          <td>{String(item.count).padStart(2, "0")}</td>
                          <td>{item.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  ))}
                </table>
              </div>
            </div>
            <div className={styles.machineGallery}>
              <div data-capability-reveal="">
                <h3>Hình ảnh máy móc</h3>
              </div>
              <div className={styles.machineGrid}>
                {equipmentPhotos.map(({ name, image }) => (
                  <figure
                    key={image}
                    className={`${styles.photoCard} ${styles.machineCard}`}
                    data-capability-machine=""
                    data-capability-reveal=""
                  >
                    <div className={styles.photo}>
                      <Image
                        src={`/images/${image}.webp`}
                        alt={`Hình ảnh ${name.toLowerCase()} trong hồ sơ năng lực`}
                        fill
                        sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 999px) 45vw, 215px"
                      />
                    </div>
                    <figcaption>{name}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </section>
        <div data-capability-reveal="">
          <ContactCallout />
        </div>
      </CapabilityMotion>
    </>
  );
}
