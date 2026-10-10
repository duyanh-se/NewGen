"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./about.module.css";

export function PrinciplesStory({ children }: { children: ReactNode }) {
  const storyRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const story = storyRef.current;
    if (!story) return;
    const stage = story.querySelector<HTMLElement>("[data-principle-stage]")!;
    const heading = story.querySelector<HTMLElement>("[data-principle-heading]")!;
    const grid = story.querySelector<HTMLElement>("[data-principle-grid]")!;
    const steps = Array.from(story.querySelectorAll<HTMLElement>("[data-principle-step]"));
    const cards = Array.from(story.querySelectorAll<HTMLElement>("[data-principle-card]"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let scrollStep = 0;
    let rise = 0;
    let header = 0;
    let available = 0;
    let animationStart: number | null = null;
    let settle = 0;
    let frame = 0;

    const setHeight = () => {
      story.style.height = `${available + (animationStart ?? 0) + scrollStep * (steps.length - 1)}px`;
    };
    const paint = () => {
      frame = 0;
      const distance = header - story.getBoundingClientRect().top;
      if (distance < 0 && animationStart !== null) {
        animationStart = null;
        setHeight();
      }
      const phase = scrollStep && animationStart !== null ? Math.max(0, Math.min(steps.length - 1,
        (distance - animationStart) / scrollStep,
      )) : 0;
      steps.forEach((step, index) => {
        const remaining = scrollStep ? Math.max(0, Math.min(1, index - phase)) : 0;
        step.style.transform = `translate3d(0, ${remaining * rise}px, 0)`;
        step.style.opacity = remaining < 1 ? "1" : "0";
        cards[index].dataset.principleActive = String(scrollStep > 0 && index === Math.floor(phase + .001));
      });
    };
    const startAfterPause = () => {
      if (!scrollStep || animationStart !== null) return;
      const distance = header - story.getBoundingClientRect().top;
      if (distance < 0 || distance > story.offsetHeight - available) return;
      animationStart = distance;
      setHeight();
      paint();
    };
    const queuePaint = () => {
      if (!frame) frame = requestAnimationFrame(paint);
      clearTimeout(settle);
      settle = window.setTimeout(startAfterPause, 160);
    };
    const measure = () => {
      cancelAnimationFrame(frame);
      delete story.dataset.principleStack;
      story.style.removeProperty("height");
      header = document.querySelector("header")?.getBoundingClientRect().height ?? 94;
      available = innerHeight - header;
      const cardHeight = Math.max(...cards.map(card => card.offsetHeight));
      const gap = parseFloat(getComputedStyle(grid.parentElement!).gap);
      const fits = heading.offsetHeight + gap + cardHeight + 48 <= available;
      scrollStep = !reduced.matches && fits ? Math.max(420, available * .85) : 0;
      if (scrollStep) {
        story.style.setProperty("--principle-card-height", `${cardHeight}px`);
        story.dataset.principleStack = "true";
        setHeight();
        rise = available - (grid.getBoundingClientRect().top - stage.getBoundingClientRect().top);
      } else {
        animationStart = null;
        rise = 0;
      }
      paint();
      clearTimeout(settle);
      settle = window.setTimeout(startAfterPause, 160);
    };

    const resize = new ResizeObserver(measure);
    resize.observe(stage);
    window.addEventListener("scroll", queuePaint, { passive: true });
    window.addEventListener("resize", measure);
    reduced.addEventListener("change", measure);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settle);
      resize.disconnect();
      window.removeEventListener("scroll", queuePaint);
      window.removeEventListener("resize", measure);
      reduced.removeEventListener("change", measure);
      delete story.dataset.principleStack;
      story.style.removeProperty("height");
      story.style.removeProperty("--principle-card-height");
      steps.forEach(step => { step.style.removeProperty("transform"); step.style.removeProperty("opacity"); });
      cards.forEach(card => { delete card.dataset.principleActive; });
    };
  }, []);

  return (
    <section ref={storyRef} className={`${styles.section} ${styles.principles}`} data-principles-story="" aria-labelledby="principles-title">
      <noscript>
        <style>{`[data-principles-story] [data-principle-step] { opacity: 1; transform: none; }`}</style>
      </noscript>
      <div className={styles.principlesStage} data-principle-stage="">
        <div className={`wrap ${styles.principlesInner}`}>{children}</div>
      </div>
    </section>
  );
}
