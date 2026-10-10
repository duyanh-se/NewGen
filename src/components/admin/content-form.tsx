"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { saveContent } from "@/app/admin/actions";
import {
  emptyDocument,
  slugify,
  statusLabels,
  type Category,
  type ContentKind,
  type Media,
  type Post,
  type Project,
  type PublicationStatus,
} from "@/lib/content/model";
import { ImagePicker } from "./image-picker";
const RichEditor = dynamic(() => import("./rich-editor"), {
  ssr: false,
  loading: () => <p>Đang tải trình soạn thảo…</p>,
});

export function ContentForm({
  kind,
  item,
  categories,
}: {
  kind: ContentKind;
  item: Project | Post | null;
  categories: Category[];
}) {
  const router = useRouter();
  const project = kind === "projects" ? (item as Project | null) : null;
  const post = kind === "posts" ? (item as Post | null) : null;
  const [content, setContent] = useState(item?.content ?? emptyDocument);
  const [cover, setCover] = useState<Media | null>(item?.cover ?? null);
  const [gallery, setGallery] = useState<Media[]>(project?.gallery ?? []);
  const [slug, setSlug] = useState(item?.slug ?? "");
  const [status, setStatus] = useState<PublicationStatus>(
    item?.status ?? "draft",
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const targetStatus =
      ((event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)
        ?.value || status;
    const values = {
      ...Object.fromEntries(data),
      id: item?.id ?? "",
      slug,
      content,
      cover_id: cover?.id ?? "",
      status: targetStatus,
      featured: data.has("featured"),
      gallery: gallery.map((m) => m.id),
    };
    setMessage("");
    setError("");
    start(async () => {
      try {
        const result = await saveContent(kind, values);
        if (result.error) setError(result.error);
        else {
          setStatus(targetStatus as PublicationStatus);
          setMessage(result.message ?? "Đã lưu.");
          if (!item && result.id)
            router.replace("/admin/" + kind + "/" + result.id);
          else router.refresh();
        }
      } catch {
        setError("Không thể lưu. Nội dung vẫn trên biểu mẫu; hãy thử lại.");
      }
    });
  }
  function move(index: number, offset: number) {
    setGallery((current) => {
      const next = [...current];
      [next[index], next[index + offset]] = [next[index + offset], next[index]];
      return next;
    });
  }
  return (
    <form onSubmit={submit} className="admin-content-form">
      <div className="admin-page-heading">
        <div>
          <Link href={"/admin/" + kind}>
            ← Danh sách {kind === "projects" ? "công trình" : "bài viết"}
          </Link>
          <h1>
            {item ? "Chỉnh sửa" : "Thêm"}{" "}
            {kind === "projects" ? "công trình" : "bài blog"}
          </h1>
        </div>
        <span className={"admin-status " + status}>{statusLabels[status]}</span>
      </div>
      <fieldset disabled={pending} className="admin-form-grid">
        <div className="admin-form-main">
          <label>
            {kind === "projects" ? "Tên công trình" : "Tiêu đề bài viết"}
            <input
              name={kind === "projects" ? "name" : "title"}
              required
              maxLength={200}
              defaultValue={project?.name ?? post?.title ?? ""}
              onBlur={(e) => {
                if (!slug) setSlug(slugify(e.target.value));
              }}
            />
          </label>
          <label>
            Đường dẫn
            <input
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              maxLength={200}
            />
            <small>
              {kind === "projects" ? "/du-an/" : "/blog/"}
              {slug || "duong-dan"}
            </small>
          </label>
          <label>
            Mô tả ngắn
            <textarea
              name="description"
              rows={3}
              maxLength={2000}
              defaultValue={item?.description ?? ""}
            />
          </label>
          <div>
            <p className="admin-field-label">Nội dung chi tiết</p>
            <RichEditor
              disabled={pending}
              initial={item?.content ?? emptyDocument}
              onChange={setContent}
            />
          </div>
          {kind === "projects" ? (
            <div className="admin-fields-two">
              <label>
                Loại công trình
                <input
                  name="type"
                  maxLength={200}
                  defaultValue={project?.type ?? ""}
                />
              </label>
              <label>
                Địa điểm
                <input
                  name="location"
                  maxLength={300}
                  defaultValue={project?.location ?? ""}
                />
              </label>
              <label>
                Chủ đầu tư
                <input
                  name="owner"
                  maxLength={300}
                  defaultValue={project?.owner ?? ""}
                />
              </label>
              <label>
                Diện tích (m²)
                <input
                  name="area"
                  type="number"
                  min="0.01"
                  step="any"
                  defaultValue={project?.area ?? ""}
                />
              </label>
              <label>
                Năm thực hiện
                <input
                  name="year"
                  type="number"
                  min="1900"
                  max="2200"
                  defaultValue={project?.year ?? ""}
                />
              </label>
              <label>
                Trạng thái thi công
                <select
                  name="construction_status"
                  defaultValue={project?.construction_status ?? "unspecified"}
                >
                  <option value="unspecified">Chưa xác định</option>
                  <option value="planned">Dự kiến</option>
                  <option value="in_progress">Đang thi công</option>
                  <option value="completed">Hoàn thành</option>
                </select>
              </label>
              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  name="featured"
                  defaultChecked={project?.featured ?? false}
                />
                Công trình nổi bật
              </label>
            </div>
          ) : (
            <div className="admin-fields-two">
              <label>
                Tác giả
                <input
                  name="author"
                  maxLength={200}
                  defaultValue={post?.author ?? ""}
                />
              </label>
              <label>
                Chuyên mục
                <select
                  name="category_id"
                  defaultValue={post?.category_id ?? ""}
                >
                  <option value="">Chưa chọn</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          <details className="admin-seo">
            <summary>Thông tin SEO</summary>
            <label>
              Tiêu đề SEO
              <input
                name="seo_title"
                maxLength={200}
                defaultValue={item?.seo_title ?? ""}
              />
            </label>
            <label>
              Mô tả SEO
              <textarea
                name="seo_description"
                maxLength={500}
                defaultValue={item?.seo_description ?? ""}
              />
            </label>
          </details>
        </div>
        <aside className="admin-form-aside">
          <h2>Ảnh đại diện</h2>
          {cover ? (
            <div className="admin-cover">
              <Image
                src={cover.url}
                alt={cover.alt || "Ảnh đại diện"}
                width={440}
                height={280}
              />
              <button type="button" onClick={() => setCover(null)}>
                Gỡ ảnh đại diện
              </button>
            </div>
          ) : (
            <p>Chưa chọn ảnh.</p>
          )}
          <ImagePicker label="Chọn ảnh đại diện" onSelect={setCover} />
          {kind === "projects" && (
            <>
              <h2>Thư viện công trình</h2>
              <ol className="admin-gallery">
                {gallery.map((m, i) => (
                  <li key={m.id}>
                    <Image
                      src={m.url}
                      alt={m.alt || "Ảnh công trình"}
                      width={100}
                      height={75}
                    />
                    <div>
                      <span>Ảnh {i + 1}</span>
                      <div className="admin-row">
                        <button
                          type="button"
                          aria-label={"Đưa ảnh " + (i + 1) + " lên"}
                          disabled={i === 0}
                          onClick={() => move(i, -1)}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          aria-label={"Đưa ảnh " + (i + 1) + " xuống"}
                          disabled={i === gallery.length - 1}
                          onClick={() => move(i, 1)}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setGallery(gallery.filter((g) => g.id !== m.id))
                          }
                        >
                          Gỡ
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
              <ImagePicker
                label="Thêm ảnh thư viện"
                onSelect={(m) =>
                  setGallery((current) =>
                    current.some((g) => g.id === m.id)
                      ? current
                      : [...current, m],
                  )
                }
              />
            </>
          )}
          <p className="admin-hint">Lưu nội dung trước khi mở bản xem trước.</p>
          {item && (
            <Link
              target="_blank"
              className="admin-preview-link"
              href={"/admin/preview/" + kind + "/" + item.id}
            >
              Xem trước nội dung đã lưu ↗
            </Link>
          )}
          {item?.published_at && (
            <p>
              Ngày xuất bản:{" "}
              {new Date(item.published_at).toLocaleDateString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
              })}
            </p>
          )}
        </aside>
      </fieldset>
      <div className="admin-save-bar">
        <div aria-live="polite">
          {error ? (
            <p role="alert" className="admin-error">
              {error}
            </p>
          ) : (
            <p>
              {pending
                ? "Đang lưu…"
                : message || "Thay đổi chỉ được lưu khi bạn bấm nút."}
            </p>
          )}
        </div>
        <div className="admin-row">
          <button type="submit" value="draft" disabled={pending}>
            {status === "published" ? "Gỡ xuất bản và lưu nháp" : "Lưu nháp"}
          </button>
          <button type="submit" value="archived" disabled={pending}>
            Lưu trữ
          </button>
          <button
            className="admin-primary"
            type="submit"
            value="published"
            disabled={pending}
          >
            {status === "published" ? "Cập nhật bài đã xuất bản" : "Xuất bản"}
          </button>
        </div>
      </div>
    </form>
  );
}
