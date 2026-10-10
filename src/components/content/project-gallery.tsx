"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Media } from "@/lib/content/model";
import styles from "./project-gallery.module.css";

type Move = { direction: number; instant: boolean };

export function ProjectGallery({ photos, name }: {
  photos: Pick<Media, "id" | "url" | "alt">[];
  name: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const strideRef = useRef(0);
  const positionRef = useRef(photos.length > 1 ? photos.length * 2 : 0);
  const movingRef = useRef(false);
  const pendingRef = useRef<Move[]>([]);
  const settleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingFrameRef = useRef(0);
  const wrap = (index: number) => (index % photos.length + photos.length) % photos.length;

  const settle = () => {
    const track = trackRef.current!;
    const position = Math.round(track.scrollLeft / strideRef.current);
    positionRef.current = photos.length * 2 + wrap(position);
    // Recenter on the identical middle copy without a visible jump.
    if (position !== positionRef.current) {
      track.scrollTo({ left: strideRef.current * positionRef.current, behavior: "instant" });
    }
    movingRef.current = false;
    const next = pendingRef.current.shift();
    if (next) pendingFrameRef.current = requestAnimationFrame(() => { pendingFrameRef.current = 0; goTo(next); });
  };

  const queueSettle = () => {
    if (settleRef.current) clearTimeout(settleRef.current);
    settleRef.current = setTimeout(settle, 160);
  };

  const goTo = (move: Move) => {
    if (movingRef.current) {
      pendingRef.current.push(move);
      return;
    }
    const track = trackRef.current!;
    movingRef.current = true;
    positionRef.current += move.direction;
    const instant = move.instant || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({
      left: strideRef.current * positionRef.current,
      behavior: instant ? "instant" : "smooth",
    });
    if (instant) settle();
    else queueSettle();
  };

  useEffect(() => {
    const track = trackRef.current!;
    const measure = () => {
      if (settleRef.current) clearTimeout(settleRef.current);
      cancelAnimationFrame(pendingFrameRef.current);
      const index = (positionRef.current % photos.length + photos.length) % photos.length;
      strideRef.current = track.children[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap);
      positionRef.current = photos.length > 1 ? photos.length * 2 + index : 0;
      track.scrollTo({ left: strideRef.current * positionRef.current, behavior: "instant" });
      movingRef.current = false;
      pendingRef.current = [];
    };
    const resize = new ResizeObserver(measure);
    resize.observe(track);
    measure();
    return () => {
      resize.disconnect();
      if (settleRef.current) clearTimeout(settleRef.current);
      cancelAnimationFrame(pendingFrameRef.current);
    };
  }, [photos.length]);

  return (
    <div className={styles.gallery} role="region" aria-roledescription="carousel" aria-label={`Hình ảnh công trình ${name}`}>
      <div
        ref={trackRef}
        className={`inner-gallery ${styles.track}`}
        tabIndex={photos.length > 1 ? 0 : undefined}
        aria-label="Thư viện ảnh, vuốt ngang hoặc dùng phím mũi tên để chuyển ảnh"
        onScroll={event => {
          const track = event.currentTarget;
          if (photos.length < 2 || !strideRef.current) return;
          const stride = track.children[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap);
          if (Math.abs(stride - strideRef.current) > .5) return;
          const position = Math.round(track.scrollLeft / strideRef.current);
          if (!movingRef.current) positionRef.current = position;
          queueSettle();
        }}
        onKeyDown={event => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
          event.preventDefault();
          if (photos.length > 1) goTo({ direction: event.key === "ArrowRight" ? 1 : -1, instant: true });
        }}
      >
        {(photos.length > 1 ? [0, 1, 2, 3, 4] : [2]).flatMap(copy => photos.map((photo, i) => (
          <figure key={`${copy}-${photo.id}`} className={styles.slide} role="group" aria-roledescription="slide" aria-label={`Ảnh ${i + 1} trên ${photos.length}`} aria-hidden={copy !== 2 ? true : undefined} data-project-reveal={copy === 2 ? "" : undefined}>
            <div className={styles.media} data-project-media="">
              <Image src={photo.url} alt={photo.alt || `${name} — hình ảnh ${i + 1}`} fill sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1000px) calc((100vw - 88px) / 2), 400px" />
            </div>
          </figure>
        )))}
      </div>
      {photos.length > 1 && (
        <div className={styles.controls}>
          <button type="button" aria-label="Ảnh trước" onClick={event => goTo({ direction: -1, instant: event.detail === 0 })}><ChevronLeft size={20} aria-hidden="true" /></button>
          <button type="button" aria-label="Ảnh sau" onClick={event => goTo({ direction: 1, instant: event.detail === 0 })}><ChevronRight size={20} aria-hidden="true" /></button>
        </div>
      )}
    </div>
  );
}
