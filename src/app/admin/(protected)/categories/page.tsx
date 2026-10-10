import { listCategories } from "@/lib/content/data";
import { requireAdmin } from "@/lib/content/auth";
import { Categories } from "@/components/admin/categories";
export default async function CategoriesPage() {
  await requireAdmin();
  const items = await listCategories();
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">BLOG NEWGEN</p>
          <h1>Chuyên mục</h1>
        </div>
      </div>
      <Categories items={items} />
    </>
  );
}
