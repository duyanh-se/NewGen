import Link from "next/link";
import { notFound } from "next/navigation";
import { listContent } from "@/lib/content/data";
import { statusLabels } from "@/lib/content/model";
import { Pagination } from "@/components/site/pagination";
export default async function ContentList({
  params,
  searchParams,
}: {
  params: Promise<{ kind: string }>;
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { kind } = await params;
  if (kind !== "projects" && kind !== "posts") notFound();
  const filters = await searchParams;
  const { items, total, page } = await listContent(kind, {
    ...filters,
    admin: true,
  });
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">NỘI DUNG WEBSITE</p>
          <h1>{kind === "projects" ? "Hồ sơ công trình" : "Bài blog"}</h1>
        </div>
        <Link className="admin-primary" href={"/admin/" + kind + "/new"}>
          {kind === "projects" ? "Thêm công trình" : "Viết bài mới"} +
        </Link>
      </div>
      <form className="admin-filters">
        <label>
          Tìm nội dung
          <input
            name="q"
            placeholder="Tìm theo tên…"
            maxLength={100}
            defaultValue={filters.q}
          />
        </label>
        <label>
          Trạng thái
          <select name="status" defaultValue={filters.status ?? ""}>
            <option value="">Tất cả trạng thái</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button className="admin-primary">Lọc danh sách</button>
      </form>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nội dung</th>
              <th>Trạng thái</th>
              <th>Cập nhật</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <Link href={"/admin/" + kind + "/" + item.id}>
                    {"name" in item ? item.name : item.title}
                  </Link>
                  <small>
                    /{kind === "projects" ? "du-an" : "blog"}/{item.slug}
                  </small>
                </td>
                <td>
                  <span className={"admin-status " + item.status}>
                    {statusLabels[item.status]}
                  </span>
                </td>
                <td>
                  {new Date(item.updated_at).toLocaleDateString("vi-VN", {
                    timeZone: "Asia/Ho_Chi_Minh",
                  })}
                </td>
                <td>
                  <Link href={"/admin/" + kind + "/" + item.id}>
                    Chỉnh sửa →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && (
          <div className="admin-empty">
            <h2>Chưa có nội dung phù hợp</h2>
            <p>
              Thử đổi bộ lọc hoặc thêm{" "}
              {kind === "projects" ? "công trình" : "bài viết"} đầu tiên.
            </p>
          </div>
        )}
      </div>
      <Pagination
        base={"/admin/" + kind}
        page={page}
        total={total}
        query={{ q: filters.q ?? "", status: filters.status ?? "" }}
      />
    </>
  );
}
