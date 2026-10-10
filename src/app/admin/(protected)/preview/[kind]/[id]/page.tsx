import { notFound } from "next/navigation";
import { z } from "zod";
import { getAdminContent } from "@/lib/content/data";
import { ProjectDetails, PostDetails } from "@/components/content/details";
import type { Project, Post } from "@/lib/content/model";
import "@/app/pages.css";
export default async function Preview({
  params,
}: {
  params: Promise<{ kind: string; id: string }>;
}) {
  const { kind, id } = await params;
  if (
    (kind !== "projects" && kind !== "posts") ||
    !z.uuid().safeParse(id).success
  )
    notFound();
  const item = await getAdminContent(kind, id);
  if (!item) notFound();
  return (
    <div className="inner-site admin-preview">
      <p className="admin-preview-banner">
        Bản xem trước nội dung đã lưu · Chỉ dành cho admin
      </p>
      {kind === "projects" ? (
        <ProjectDetails project={item as Project} />
      ) : (
        <PostDetails post={item as Post} />
      )}
    </div>
  );
}
