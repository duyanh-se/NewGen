"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";
import styles from "./organization.module.css";

type Photo = { image: string; width: number; height: number; alt: string };
type Move = { direction: number; instant: boolean };

export function OrganizationCarousel({ photos }: { photos: Photo[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const strideRef = useRef(0);
  const positionRef = useRef(photos.length);
  const movingRef = useRef(false);
  const pendingRef = useRef<Move[]>([]);
  const settleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingFrameRef = useRef(0);
  const wrap = (index: number) => (index % photos.length + photos.length) % photos.length;

  const settle = () => {
    const track = trackRef.current!;
    const position = Math.round(track.scrollLeft / strideRef.current);
    const index = wrap(position);
    // Recenter on the identical middle copy without a visible jump.
    positionRef.current = photos.length + index;
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
      const index = (positionRef.current % photos.length + photos.length) % photos.length;
      strideRef.current = track.children[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap);
      positionRef.current = photos.length + index;
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
    <div className={styles.carousel} role="region" aria-roledescription="carousel" aria-label="Hình ảnh thành viên NewGen">
      <div
        ref={trackRef}
        className={styles.carouselTrack}
        tabIndex={0}
        aria-label="Thư viện ảnh, vuốt ngang hoặc dùng phím mũi tên để chuyển ảnh"
        onScroll={event => {
          const track = event.currentTarget;
          if (!strideRef.current) return;
          const position = Math.round(track.scrollLeft / strideRef.current);
          if (!movingRef.current) positionRef.current = position;
          queueSettle();
        }}
        onKeyDown={event => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
          event.preventDefault();
          goTo({ direction: event.key === "ArrowRight" ? 1 : -1, instant: true });
        }}
      >
        {[0, 1, 2].flatMap(copy => photos.map(({ image, width, height, alt }, index) => (
          <figure key={`${copy}-${image}`} className={styles.carouselSlide} role="group" aria-roledescription="slide" aria-label={`Ảnh ${index + 1} trên ${photos.length}`} aria-hidden={copy !== 1 ? true : undefined}>
            <Image src={`/images/${image}.webp`} alt={alt} width={width} height={height} sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1000px) calc((100vw - 88px) / 2), 400px" />
          </figure>
        )))}
      </div>
      <div className={styles.carouselControls}>
        <button type="button" className={styles.carouselArrow} aria-label="Ảnh trước" onClick={event => goTo({ direction: -1, instant: event.detail === 0 })}><ChevronLeft size={20} aria-hidden="true" /></button>
        <button type="button" className={styles.carouselArrow} aria-label="Ảnh sau" onClick={event => goTo({ direction: 1, instant: event.detail === 0 })}><ChevronRight size={20} aria-hidden="true" /></button>
      </div>
    </div>
  );
}
