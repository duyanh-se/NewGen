import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import {
  ProjectCards,
  ContactCallout,
} from "@/components/site/page-parts";
import { ProjectMotion } from "@/components/site/project-motion";
import styles from "@/components/site/project-motion.module.css";
import { listPublishedProjects } from "@/lib/content/data";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Dự án tiêu biểu | NewGen Construction",
  description:
    "Các dự án và công trình được giới thiệu bởi NewGen Construction.",
};
export default async function ProjectsPage() {
  const projects = await listPublishedProjects();
  return (
    <ProjectMotion mode="list">
      <section
        id="danh-sach-du-an"
        className="wrap inner-section inner-projects"
        aria-label="Danh sách dự án"
      >
        <div className={styles.projectHeading} data-project-reveal="">
          <div>
            <div className="eyebrow">DỰ ÁN TIÊU BIỂU</div>
            <h1>Các công trình của NewGen.</h1>
          </div>
        </div>
        {projects.length ? (
          <ProjectCards items={projects} />
        ) : (
          <div className="inner-empty">
            <h2>Công trình đang được cập nhật.</h2>
            <p>Chưa có công trình được xuất bản.</p>
            <Link className="text-link" href="/nang-luc-xay-dung">
              Tìm hiểu năng lực xây dựng <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        )}
      </section>
      <div data-project-reveal="">
        <ContactCallout />
      </div>
    </ProjectMotion>
  );
}
