import { notFound } from "next/navigation";
import { z } from "zod";
import { getAdminContent, listCategories } from "@/lib/content/data";
import { requireAdmin } from "@/lib/content/auth";
import { ContentForm } from "@/components/admin/content-form";
export default async function EditContent({
  params,
}: {
  params: Promise<{ kind: string; id: string }>;
}) {
  const { kind, id } = await params;
  if (
    (kind !== "projects" && kind !== "posts") ||
    (id !== "new" && !z.uuid().safeParse(id).success)
  )
    notFound();
  await requireAdmin();
  const [item, categories] = await Promise.all([
    id === "new" ? null : getAdminContent(kind, id),
    kind === "posts" ? listCategories() : [],
  ]);
  if (id !== "new" && !item) notFound();
  return <ContentForm kind={kind} item={item} categories={categories} />;
}
