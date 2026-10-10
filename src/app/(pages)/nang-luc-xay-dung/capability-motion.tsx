"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./capability.module.css";

export function CapabilityMotion({ children }: { children: ReactNode }) {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const header = document.querySelector<HTMLElement>("header");
    const hero = page.querySelector<HTMLElement>("[data-capability-hero]");
    const viewport = page.querySelector<HTMLElement>(
      "[data-capability-hero-viewport]",
    );
    const banner = page.querySelector<HTMLElement>("[data-capability-banner]");
    if (!header || !hero || !viewport || !banner) {
      return;
    }
    const targets = Array.from(
      page.querySelectorAll<HTMLElement>("[data-capability-reveal]"),
    );
    const enabled = window.matchMedia(
      "(min-width: 1000px) and (min-height: 700px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const clamp = (value: number) => Math.max(0, Math.min(1, value));
    let frame = 0;
    let headerHeight = header.offsetHeight;

    const paint = () => {
      frame = 0;
      if (reduced.matches) return;

      // The wrappers stay in normal flow; only their children are transformed.
      let column = 0;
      let previousTop = 0;
      let previousParent: HTMLElement | null = null;
      const reveals = targets.map((target) => {
        const top = target.getBoundingClientRect().top;
        column = target.parentElement === previousParent && Math.abs(top - previousTop) < 1
          ? column + 1 : 0;
        previousTop = top;
        previousParent = target.parentElement;
        const stagger = Math.min(column * 18, innerHeight * 0.1);
        const progress = clamp(
          (innerHeight * 0.9 - top - stagger) / (innerHeight * 0.25 - stagger),
        );
        return { target, progress: progress * progress * (3 - 2 * progress) };
      });
      const travel = hero.offsetHeight - viewport.offsetHeight;
      const progress = enabled.matches ? clamp(
        (headerHeight - hero.getBoundingClientRect().top) / Math.max(1, travel),
      ) : 0;
      const reveal = clamp((progress - 0.2) / 0.6);
      const bannerProgress = clamp(
        (innerHeight - banner.getBoundingClientRect().top) /
          (innerHeight + banner.offsetHeight),
      );
      reveals.forEach(({ target, progress }) => {
        target.style.setProperty("--reveal-progress", String(progress));
      });
      page.style.setProperty("--hero-cover", `${(1 - reveal) * 100}%`);
      page.style.setProperty("--hero-scale", String(enabled.matches ? 1.04 - progress * 0.04 : 1));
      page.style.setProperty(
        "--banner-shift",
        `${enabled.matches ? (bannerProgress - 0.5) * 48 : 0}px`,
      );
    };
    const queuePaint = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const measure = () => {
      headerHeight = header.offsetHeight;
      page.style.setProperty("--capability-header", `${headerHeight}px`);
      queuePaint();
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (reduced.matches) {
        delete page.dataset.capabilityMotion;
        page.style.removeProperty("--hero-cover");
        page.style.removeProperty("--hero-scale");
        page.style.removeProperty("--banner-shift");
        targets.forEach(target => target.style.removeProperty("--reveal-progress"));
      } else {
        paint();
        page.dataset.capabilityMotion = enabled.matches ? "full" : "light";
      }
      measure();
    };

    const resize = new ResizeObserver(measure);
    resize.observe(header);
    resize.observe(page);
    window.addEventListener("scroll", queuePaint, { passive: true });
    window.addEventListener("resize", measure);
    enabled.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    sync();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", queuePaint);
      window.removeEventListener("resize", measure);
      enabled.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
      delete page.dataset.capabilityMotion;
      ["--hero-cover", "--hero-scale", "--banner-shift", "--capability-header"].forEach(property => page.style.removeProperty(property));
      targets.forEach(target => target.style.removeProperty("--reveal-progress"));
    };
  }, []);

  return (
    <div ref={pageRef} className={styles.page} data-capability-page="">
      {children}
    </div>
  );
}
