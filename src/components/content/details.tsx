import Link from "next/link";
import {
  PageHeading,
  PagePhoto,
  ContactCallout,
} from "@/components/site/page-parts";
import { RichText } from "./rich-text";
import { ProjectGallery } from "./project-gallery";
import type { Post, Project } from "@/lib/content/model";
const constructionLabels = {
  unspecified: "Chưa xác định",
  planned: "Dự kiến",
  in_progress: "Đang thi công",
  completed: "Hoàn thành",
};
export function ProjectDetails({ project }: { project: Project }) {
  return (
    <>
      <PageHeading
        label={project.name}
        title={project.name}
        description={project.description}
        parent={{ label: "Dự án tiêu biểu", href: "/du-an" }}
      />
      {project.cover && (
        <div data-project-stage="">
          <div data-project-viewport="">
            <PagePhoto
              src={project.cover.url}
              alt={project.cover.alt || project.name}
            />
          </div>
        </div>
      )}
      <section className="wrap inner-section inner-split">
        <div data-project-reveal="">
          <div>
            <div className="eyebrow">THÔNG TIN DỰ ÁN</div>
            <h2>
              Công trình &<br />
              hạng mục thực hiện.
            </h2>
          </div>
        </div>
        <div className="inner-prose">
          <div data-project-reveal=""><RichText content={project.content} /></div>
          <dl className="inner-facts" data-project-reveal="">
            {[
              ["Địa điểm", project.location],
              ["Loại công trình", project.type],
              ["Chủ đầu tư", project.owner],
              [
                "Diện tích",
                project.area
                  ? project.area.toLocaleString("vi-VN") + " m²"
                  : "",
              ],
              ["Năm thực hiện", project.year],
              [
                "Trạng thái thi công",
                project.construction_status === "unspecified"
                  ? ""
                  : constructionLabels[project.construction_status],
              ],
            ]
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={String(label)}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
          </dl>
        </div>
      </section>
      {project.gallery.length > 0 && (
        <section className="wrap inner-section inner-gallery-section">
          <ProjectGallery photos={project.gallery} name={project.name} />
          <Link className="text-link" href="/du-an">
            ← Tất cả dự án
          </Link>
        </section>
      )}
      <div data-project-reveal=""><ContactCallout /></div>
    </>
  );
}
export function PostDetails({ post }: { post: Post }) {
  return (
    <>
      <PageHeading
        label={post.title}
        title={post.title}
        description={post.description}
        parent={{ label: "Blog", href: "/blog" }}
      />
      {post.cover && (
        <PagePhoto src={post.cover.url} alt={post.cover.alt || post.title} />
      )}
      <article className="wrap inner-section blog-article">
        <p className="blog-byline">
          {[
            post.category?.name,
            post.author,
            post.published_at
              ? new Date(post.published_at).toLocaleDateString("vi-VN", {
                  timeZone: "Asia/Ho_Chi_Minh",
                })
              : "Bản nháp",
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <RichText content={post.content} />
        <Link className="text-link" href="/blog">
          ← Tất cả bài viết
        </Link>
      </article>
      <ContactCallout />
    </>
  );
}
