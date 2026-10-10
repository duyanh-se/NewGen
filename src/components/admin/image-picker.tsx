"use client";
import Image from "next/image";
import { useState, useTransition } from "react";
import { findMedia, uploadImage } from "@/app/admin/actions";
import type { Media } from "@/lib/content/model";

export function ImagePicker({
  label,
  onSelect,
}: {
  label: string;
  onSelect: (media: Media) => void;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Media[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  function load(n: number) {
    start(async () => {
      try {
        const result = await findMedia(n);
        setItems(result.items);
        setTotal(result.total);
        setPage(n);
        setOpen(true);
        setError("");
      } catch {
        setError("Không thể tải thư viện ảnh. Hãy thử lại.");
      }
    });
  }
  return (
    <div className="admin-picker">
      <div className="admin-row">
        <button
          type="button"
          disabled={pending}
          onClick={() => (open ? setOpen(false) : load(1))}
        >
          {open ? "Đóng thư viện" : label}
        </button>
        <label className="admin-upload">
          {pending ? "Đang xử lý…" : "Tải ảnh mới"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={pending}
            onChange={(e) => {
              const file = e.currentTarget.files?.[0];
              e.currentTarget.value = "";
              if (!file) return;
              start(async () => {
                try {
                  const form = new FormData();
                  form.set("file", file);
                  const result = await uploadImage(form);
                  if (result.error) setError(result.error);
                  if (result.media) {
                    onSelect(result.media);
                    setError("");
                    setOpen(false);
                  }
                } catch {
                  setError("Không thể tải ảnh. Hãy thử lại.");
                }
              });
            }}
          />
        </label>
      </div>
      {error && (
        <p role="alert" className="admin-error">
          {error}
        </p>
      )}
      {open && (
        <div className="admin-picker-panel">
          <p>Ảnh JPEG, PNG hoặc WebP, tối đa 5 MB. Ảnh được lưu công khai.</p>
          <div className="admin-image-grid">
            {items
              .filter((m) => m.state === "ready")
              .map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => {
                    onSelect(m);
                    setOpen(false);
                  }}
                >
                  <Image
                    src={m.url}
                    alt={m.alt || "Chọn ảnh"}
                    width={160}
                    height={100}
                  />
                  <span>{m.alt || "Ảnh chưa có mô tả"}</span>
                </button>
              ))}
          </div>
          {items.length === 0 && <p>Chưa có ảnh. Tải ảnh mới để bắt đầu.</p>}
          <div className="admin-row">
            <button
              type="button"
              disabled={page <= 1 || pending}
              onClick={() => load(page - 1)}
            >
              Trang trước
            </button>
            <span>Trang {page}</span>
            <button
              type="button"
              disabled={page * 24 >= total || pending}
              onClick={() => load(page + 1)}
            >
              Trang sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
