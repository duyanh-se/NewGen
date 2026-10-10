"use client";
import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { saveCategory, deleteCategory } from "@/app/admin/actions";
import { slugify, type Category } from "@/lib/content/model";
export function Categories({ items }: { items: Category[] }) {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    start(async () => {
      try {
        const r = await saveCategory(data);
        setMessage(r.error ?? r.message ?? "");
        if (!r.error) {
          form.reset();
          setSlug("");
          router.refresh();
        }
      } catch {
        setMessage("Không thể lưu chuyên mục. Hãy thử lại.");
      }
    });
  }
  return (
    <>
      <form onSubmit={submit} className="admin-filters">
        <label>
          Tên chuyên mục
          <input
            name="name"
            required
            maxLength={100}
            onBlur={(e) => {
              if (!slug) setSlug(slugify(e.target.value));
            }}
          />
        </label>
        <label>
          Đường dẫn
          <input
            name="slug"
            required
            maxLength={200}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </label>
        <button className="admin-primary" disabled={pending}>
          Thêm chuyên mục
        </button>
      </form>
      <p role="status">{message}</p>
      <ul className="admin-category-list">
        {items.map((c) => (
          <li key={c.id}>
            <div>
              <strong>{c.name}</strong>
              <small>{c.slug}</small>
            </div>
            <button
              disabled={pending}
              onClick={() => {
                if (!window.confirm("Xóa chuyên mục này?")) return;
                start(async () => {
                  try {
                    const r = await deleteCategory(c.id);
                    setMessage(r.error ?? r.message ?? "");
                    if (!r.error) router.refresh();
                  } catch {
                    setMessage("Không thể xóa chuyên mục.");
                  }
                });
              }}
            >
              Xóa
            </button>
          </li>
        ))}
      </ul>
      {!items.length && (
        <p>Chưa có chuyên mục. Thêm chuyên mục để phân loại bài viết.</p>
      )}
    </>
  );
}
