import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/content/model";
import styles from "./project-motion.module.css";

export function PageHeading({
  title,
  label,
  description,
  parent,
}: {
  title: string;
  label: string;
  description: string;
  parent?: { label: string; href: string };
}) {
  return (
    <div className="wrap inner-heading" data-project-reveal="">
      <nav className="breadcrumbs" aria-label="Đường dẫn">
        <Link href="/">Trang chủ</Link>
        <span aria-hidden="true">/</span>
        {parent && (
          <>
            <Link href={parent.href}>{parent.label}</Link>
            <span aria-hidden="true">/</span>
          </>
        )}
        <span aria-current="page">{label}</span>
      </nav>
      <div className="eyebrow">{parent?.label ?? label}</div>
      <h1>{title}</h1>
      <p className="inner-intro">{description}</p>
    </div>
  );
}

export function PagePhoto({ image, src, alt }: { image?: string; src?: string; alt: string }) {
  return (
    <div className="wrap inner-cover">
      <Image
        src={src ?? `/images/${image}.webp`}
        alt={alt}
        fill
        sizes="(min-width: 1400px) 1240px, 100vw"
        loading="eager"
      />
    </div>
  );
}

export function ContactCallout() {
  return (
    <section className="inner-callout">
      <div className="wrap">
        <div>
          <div className="eyebrow light">ĐỒNG HÀNH CÙNG NEWGEN</div>
          <h2>Cùng bắt đầu công trình tiếp theo.</h2>
          <p>Chia sẻ nhu cầu và trao đổi trực tiếp với đội ngũ NewGen.</p>
        </div>
        <Link className="inner-button light" href="/lien-he">
          Liên hệ hợp tác <ArrowUpRight size={19} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

export function ProjectCards({
  items,
}: {
  items: Project[];
}) {
  return (
    <div className={`inner-project-grid ${styles.projectGrid}`}>
      {items.map((project) => (
        <Link
          className={`inner-project ${styles.card}`}
          href={`/du-an/${project.slug}`}
          key={project.slug}
          data-project-card=""
        >
          <div className={`inner-project-photo ${styles.cardPhoto}`} data-project-media="">
            {project.cover ? <Image
              src={project.cover.url}
              alt={project.cover.alt || project.name}
              fill
              sizes={items.length === 4 ? "(max-width: 700px) 100vw, 50vw" : "(max-width: 700px) 100vw, (min-width: 1200px) 33vw, 50vw"}
            /> : <span className="content-photo-placeholder">NEWGEN / CÔNG TRÌNH</span>}
          </div>
          <div className={styles.cardContent} data-project-card-content="">
            <h2>
              {project.name}
              <ArrowUpRight size={21} aria-hidden="true" />
            </h2>
            <div className={styles.cardDetails} data-project-card-details="">
              <div>
                <dl className={styles.cardFacts}>
                  {[
                    ["Loại công trình", project.type],
                    ["Địa điểm", project.location],
                    ["Diện tích", project.area ? `${project.area.toLocaleString("vi-VN")} m²` : ""],
                    ["Năm thực hiện", project.year],
                  ].filter(([, value]) => value).map(([label, value]) => (
                    <div key={String(label)}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <span className={styles.cardLink}>Xem chi tiết dự án</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
