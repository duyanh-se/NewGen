import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHeading,ContactCallout } from "@/components/site/page-parts";
import { Pagination } from "@/components/site/pagination";
import { listContent } from "@/lib/content/data";
import type { Post } from "@/lib/content/model";
import { PageReveal } from "@/components/site/page-reveal";
export const dynamic = "force-dynamic";
export const metadata:Metadata={title:"Blog | NewGen Construction",description:"Tin tức và bài viết từ NewGen Construction."};
export default async function BlogPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const filters = await searchParams;
  const { items, total, page } = await listContent("posts", filters);
  return (
    <PageReveal key={page}>
      <PageHeading label="Blog" title="Góc nhìn từ NewGen." description="Tin tức, kinh nghiệm và những câu chuyện trên hành trình xây dựng." />
      <section className="wrap inner-section inner-blog-list" aria-label="Bài viết từ NewGen">
        {items.length ? (
          <div className="inner-project-grid inner-blog-grid">
            {(items as Post[]).map(post => (
              <Link className="inner-project inner-blog-card" key={post.id} href={"/blog/" + post.slug} data-page-reveal="">
                <div className="inner-project-photo">
                  {post.cover ? <Image src={post.cover.url} alt={post.cover.alt || post.title} fill sizes="(max-width:700px) calc(100vw - 40px), (min-width:1400px) 600px, 50vw" /> : <span className="content-photo-placeholder">NEWGEN / BLOG</span>}
                </div>
                <div className="inner-blog-copy">
                  <div className="inner-project-meta">
                    <span>{post.category?.name || "Blog NewGen"}</span>
                    {post.published_at && <time dateTime={post.published_at}>{new Date(post.published_at).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</time>}
                  </div>
                  <h2>{post.title}</h2>
                  <p>{post.description}</p>
                  <span className="inner-project-link">Đọc bài viết <ArrowUpRight size={18} aria-hidden="true" /></span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="inner-empty" data-page-reveal="">
            <h2>Bài viết đang được cập nhật.</h2>
            <p>Chưa có bài viết được xuất bản.</p>
            <Link className="text-link" href="/du-an">Khám phá công trình NewGen <ArrowUpRight size={18} aria-hidden="true" /></Link>
          </div>
        )}
        {total > 0 && <Pagination base="/blog" page={page} total={total} />}
      </section>
      <ContactCallout />
    </PageReveal>
  );
}
