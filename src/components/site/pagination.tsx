import Link from "next/link";
export function Pagination({ base, page, total, size = 12, query = {} }: { base: string; page: number; total: number; size?: number; query?: Record<string,string> }) {
  const pages = Math.max(1, Math.ceil(total/size));
  const href = (n: number) => base + "?" + new URLSearchParams({ ...query, page: String(n) }).toString();
  return <nav className="content-pagination" aria-label="Phân trang">{page > 1 && <Link href={href(page-1)}>← Trang trước</Link>}<span>Trang {page} / {pages} · {total} nội dung</span>{page < pages && <Link href={href(page+1)}>Trang sau →</Link>}</nav>;
}
