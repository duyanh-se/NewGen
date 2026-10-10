"use client";
import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteImage, updateImageAlt } from "@/app/admin/actions";
import type { Media } from "@/lib/content/model";
import { ImagePicker } from "./image-picker";
function MediaCard({ media }: { media: Media }) {
  const router = useRouter();
  const [alt, setAlt] = useState(media.alt);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  return (
    <article className="admin-media-card">
      <Image
        src={media.url}
        alt={media.alt || "Ảnh trong thư viện"}
        width={360}
        height={240}
      />
      <label>
        Mô tả ảnh
        <input
          value={alt}
          maxLength={300}
          onChange={(e) => setAlt(e.target.value)}
        />
      </label>
      <small>
        {Math.ceil(media.size_bytes / 1024)} KB
        {media.state === "deleting"
          ? " · Đang xóa, bấm xóa lại để hoàn tất"
          : ""}
      </small>
      <div className="admin-row">
        <button
          disabled={pending || media.state === "deleting"}
          onClick={() =>
            start(async () => {
              try {
                const r = await updateImageAlt(media.id, alt);
                setMessage(r.error ?? r.message ?? "");
                router.refresh();
              } catch {
                setMessage("Không thể lưu mô tả ảnh.");
              }
            })
          }
        >
          Lưu mô tả
        </button>
        <button
          disabled={pending}
          onClick={() => {
            if (
              !window.confirm(
                "Xóa ảnh này khỏi thư viện? Ảnh đang được dùng sẽ được giữ lại.",
              )
            )
              return;
            start(async () => {
              try {
                const r = await deleteImage(media.id);
                setMessage(r.error ?? r.message ?? "");
                if (!r.error) router.refresh();
              } catch {
                setMessage("Không thể xóa ảnh. Hãy thử lại.");
              }
            });
          }}
        >
          Xóa ảnh
        </button>
      </div>
      <p role="status">{message}</p>
    </article>
  );
}
export function MediaLibrary({ items }: { items: Media[] }) {
  const router = useRouter();
  return (
    <>
      <ImagePicker label="Mở thư viện" onSelect={() => router.refresh()} />
      <div className="admin-media-grid">
        {items.map((m) => (
          <MediaCard key={m.id} media={m} />
        ))}
      </div>
      {!items.length && (
        <div className="admin-empty">
          <h2>Thư viện đang trống</h2>
          <p>Tải ảnh công trình hoặc ảnh bài viết để bắt đầu.</p>
        </div>
      )}
    </>
  );
}
