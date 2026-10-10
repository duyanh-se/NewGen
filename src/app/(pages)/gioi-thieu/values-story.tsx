"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import styles from "./about.module.css";

export function ValuesStory({ children }: { children: ReactNode }) {
  const storyRef = useRef<HTMLDivElement>(null);
  const gradientId = useId();
  const maskId = useId();

  useEffect(() => {
    const story = storyRef.current;
    if (!story) return;
    const svg = story.querySelector("svg")!;
    const nodes = Array.from(story.querySelectorAll<HTMLElement>("[data-value-node]"));
    const cards = Array.from(story.querySelectorAll<HTMLElement>("[data-value-card]"));
    const paths = Array.from(svg.querySelectorAll<SVGPathElement>("[data-value-path]"));
    const cutouts = Array.from(svg.querySelectorAll<SVGRectElement>("[data-value-cutout]"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let points: { x: number; y: number }[] = [];
    let frame = 0;

    const paint = () => {
      frame = 0;
      const bounds = story.getBoundingClientRect();
      const readingLine = innerHeight * .72 - bounds.top;
      cards.forEach((card, index) => {
        const progress = reduced.matches ? 1 : Math.max(0, Math.min(1, (readingLine - points[index].y) / 90));
        card.style.opacity = String(progress);
        card.style.transform = `translate3d(0, ${(1 - progress) * 24}px, 0)`;
        cutouts[index].setAttribute("y", String(points[index].y - 64 + (1 - progress) * 24));
      });
      paths.forEach((path, index) => {
        const progress = reduced.matches ? 1 : Math.max(0, Math.min(1,
          (readingLine - points[index].y) / (points[index + 1].y - points[index].y),
        ));
        path.style.strokeDashoffset = String(1 - progress);
        path.style.opacity = progress > 0 ? "1" : "0";
      });
    };
    const queuePaint = () => { if (!frame) frame = requestAnimationFrame(paint); };
    const measure = () => {
      cancelAnimationFrame(frame);
      const bounds = story.getBoundingClientRect();
      const mobile = window.matchMedia("(max-width: 700px)").matches;
      svg.setAttribute("viewBox", `0 0 ${bounds.width} ${bounds.height}`);
      points = nodes.map((node, index) => {
        const box = node.getBoundingClientRect();
        const top = box.top - bounds.top;
        const cutout = cutouts[index];
        cutout.setAttribute("x", String(box.left - bounds.left));
        cutout.setAttribute("width", String(box.width));
        cutout.setAttribute("height", String(box.height));
        cutout.setAttribute("rx", String(parseFloat(getComputedStyle(cards[index]).borderTopLeftRadius)));
        return {
          x: mobile ? 16 : box.left - bounds.left + box.width / 2,
          y: top + 64,
        };
      });
      paths.forEach((path, index) => {
        const from = points[index];
        const to = points[index + 1];
        const bend = index % 2 === 0 ? bounds.width * 1.14 : bounds.width * -.14;
        const d = mobile ? `M ${from.x} ${from.y} L ${to.x} ${to.y}`
          : `M ${from.x} ${from.y} C ${bend} ${from.y}, ${bend} ${to.y}, ${to.x} ${to.y}`;
        path.setAttribute("d", d);
      });
      paint();
    };

    const resize = new ResizeObserver(measure);
    resize.observe(story);
    reduced.addEventListener("change", measure);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", queuePaint, { passive: true });
    measure();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      reduced.removeEventListener("change", measure);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", queuePaint);
      cards.forEach(card => { card.style.removeProperty("opacity"); card.style.removeProperty("transform"); });
    };
  }, []);

  return (
    <div ref={storyRef} className={styles.valueStory} data-value-story="">
      <noscript>
        <style>{`[data-value-story] [data-value-card] { opacity: 1; transform: none; }`}</style>
      </noscript>
      <svg className={styles.valueRibbon} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="100%">
            <stop offset="0%" stopColor="#77b9e5" />
            <stop offset="55%" stopColor="#377bab" />
            <stop offset="100%" stopColor="#21598a" />
          </linearGradient>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="-50%" y="-50%" width="200%" height="200%">
            <rect x="-50%" y="-50%" width="200%" height="200%" fill="white" />
            {[0, 1, 2].map(index => (
              <rect key={index} data-value-cutout="" fill="black" />
            ))}
          </mask>
        </defs>
        <g mask={`url(#${maskId})`}>
          {[0, 1].map(index => (
            <path key={index} data-value-path="" pathLength="1" stroke={`url(#${gradientId})`} />
          ))}
        </g>
      </svg>
      {children}
    </div>
  );
}
