"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./project-motion.module.css";

export function ProjectMotion({ children, mode }: { children: ReactNode; mode: "list" | "detail" }) {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    const cards = Array.from(page.querySelectorAll<HTMLElement>("[data-project-card]"));
    if (!cards.length) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const entered = new Set<HTMLElement>();
    const animations = new Map<HTMLElement, Animation>();
    let observer: IntersectionObserver | null = null;

    const stopAnimations = () => {
      animations.forEach(animation => animation.cancel());
      animations.clear();
    };
    const watch = () => {
      observer?.disconnect();
      stopAnimations();
      if (reduced.matches) return;
      observer = new IntersectionObserver(entries => {
        let stagger = 0;
        entries.forEach(entry => {
          const card = entry.target as HTMLElement;
          if (!entry.isIntersecting || entered.has(card)) return;
          entered.add(card);
          observer?.unobserve(card);
          const animation = card.animate([
            { opacity: 0, transform: "translate3d(0, 24px, 0)" },
            { opacity: 1, transform: "translate3d(0, 0, 0)" },
          ], {
            duration: 480,
            delay: Math.min(stagger++ * 70, 210),
            easing: "cubic-bezier(0.23, 1, 0.32, 1)",
            fill: "backwards",
          });
          animations.set(card, animation);
          animation.onfinish = () => animations.delete(card);
        });
      }, { rootMargin: "0px 0px -48px 0px", threshold: .08 });
      cards.forEach(card => {
        if (!entered.has(card)) observer?.observe(card);
      });
    };
    const onFocus = (event: FocusEvent) => {
      const card = event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-project-card]") : null;
      if (!card) return;
      entered.add(card);
      observer?.unobserve(card);
      animations.get(card)?.cancel();
      animations.delete(card);
    };

    page.addEventListener("focusin", onFocus);
    reduced.addEventListener("change", watch);
    watch();
    return () => {
      observer?.disconnect();
      stopAnimations();
      page.removeEventListener("focusin", onFocus);
      reduced.removeEventListener("change", watch);
    };
  }, [mode]);

  useEffect(() => {
    const page = pageRef.current;
    const header = document.querySelector<HTMLElement>(".header");
    if (!page || !header) return;
    const targets = Array.from(page.querySelectorAll<HTMLElement>("[data-project-reveal]"));
    const stage = page.querySelector<HTMLElement>("[data-project-stage]");
    const viewport = page.querySelector<HTMLElement>("[data-project-viewport]");
    const full = window.matchMedia(
      "(min-width: 1000px) and (min-height: 700px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const clamp = (value: number) => Math.max(0, Math.min(1, value));
    let frame = 0;
    let headerHeight = header.offsetHeight;

    const paint = () => {
      frame = 0;
      if (reduced.matches) return;
      let previousParent: HTMLElement | null = null;
      let previousTop = 0;
      let column = 0;
      // Measure the normal-flow wrappers, then animate only their children.
      const reveals = targets.map((target) => {
        const top = target.getBoundingClientRect().top;
        column = target.parentElement === previousParent && Math.abs(top - previousTop) < 1
          ? column + 1 : 0;
        previousParent = target.parentElement;
        previousTop = top;
        const stagger = Math.min(column * 24, innerHeight * 0.1);
        const progress = clamp((innerHeight * 0.9 - top - stagger) / (innerHeight * 0.3 - stagger));
        return { target, progress: progress * progress * (3 - 2 * progress) };
      });
      const travel = stage && viewport ? stage.offsetHeight - viewport.offsetHeight : 0;
      const heroProgress = full.matches && stage && travel > 0
        ? clamp((headerHeight - stage.getBoundingClientRect().top) / travel) : 0;
      reveals.forEach(({ target, progress }) => target.style.setProperty("--project-progress", String(progress)));
      page.style.setProperty("--project-hero-scale", String(full.matches ? 1.06 - heroProgress * 0.06 : 1));
    };
    const queuePaint = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const measure = () => {
      headerHeight = header.offsetHeight;
      page.style.setProperty("--project-header", `${headerHeight}px`);
      queuePaint();
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (reduced.matches) {
        delete page.dataset.projectMotion;
        page.style.removeProperty("--project-hero-scale");
        targets.forEach(target => target.style.removeProperty("--project-progress"));
      } else {
        paint();
        page.dataset.projectMotion = full.matches ? "full" : "light";
      }
      measure();
    };

    // A new pagination result mounts a new wrapper after its content is committed.
    if (!window.location.hash) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const resize = new ResizeObserver(measure);
    resize.observe(header);
    resize.observe(page);
    window.addEventListener("scroll", queuePaint, { passive: true });
    window.addEventListener("resize", measure);
    full.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    sync();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", queuePaint);
      window.removeEventListener("resize", measure);
      full.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
      delete page.dataset.projectMotion;
      page.style.removeProperty("--project-header");
      page.style.removeProperty("--project-hero-scale");
      targets.forEach(target => target.style.removeProperty("--project-progress"));
    };
  }, [mode]);

  return <div ref={pageRef} className={styles.page} data-project-page="" data-project-mode={mode}>{children}</div>;
}
