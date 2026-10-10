import { listMedia } from "@/lib/content/data";
import { MediaLibrary } from "@/components/admin/media-library";
import { Pagination } from "@/components/site/pagination";
export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const result = await listMedia(page);
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">HÌNH ẢNH WEBSITE</p>
          <h1>Thư viện ảnh</h1>
          <p>
            JPEG, PNG, WebP tối đa 5 MB. Ảnh được xử lý thành WebP và lưu công
            khai.
          </p>
        </div>
      </div>
      <MediaLibrary items={result.items} />
      <Pagination base="/admin/media" {...result} size={24} />
    </>
  );
}
