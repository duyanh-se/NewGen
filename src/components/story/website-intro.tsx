"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { logoPaths } from "./logo-paths";

export function WebsiteIntro() {
  const introRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const intro = introRef.current!;
    const content = document.getElementById("site-content")!;
    const brand = content.querySelector<HTMLAnchorElement>(".brand")!;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Direct section links and restored scroll positions should open immediately.
    if (motion.matches || window.location.hash || window.scrollY > 0) return;

    let finished = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const animations: Animation[] = [];
    const root = document.documentElement;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = root.style.overflow;
    const previousInert = content.inert;
    const finish = (restoreFocus = true) => {
      if (finished) return;
      finished = true;
      timers.forEach(clearTimeout);
      animations.forEach((animation) => animation.cancel());
      intro.hidden = true;
      content.inert = previousInert;
      root.style.overflow = previousOverflow;
      delete root.dataset.intro;
      if (restoreFocus && intro.contains(document.activeElement)) {
        const target =
          previousFocus && previousFocus !== document.body
            ? previousFocus
            : brand;
        target.focus({ preventScroll: true });
      }
    };
    const later = (callback: () => void, delay: number) => {
      timers.push(setTimeout(callback, delay));
    };

    intro.hidden = false;
    content.inert = true;
    root.style.overflow = "hidden";
    root.dataset.intro = "playing";
    intro.focus({ preventScroll: true });

    const dockLogo = () => {
      const logo = intro.querySelector<HTMLElement>(".intro-logo")!;
      const source = logo.getBoundingClientRect();
      const target = brand.querySelector("img")!.getBoundingClientRect();
      const dx = target.x + target.width / 2 - source.x - source.width / 2;
      const dy = target.y + target.height / 2 - source.y - source.height / 2;
      root.dataset.intro = "docking";
      intro.dataset.phase = "docking";
      animations.push(
        logo.animate(
          [
            { transform: "translate(-50%, -50%)" },
            {
              transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(${target.width / source.width}, ${target.height / source.height})`,
            },
          ],
          {
            duration: 1400,
            easing: "cubic-bezier(.76, 0, .24, 1)",
            fill: "forwards",
          },
        ),
      );
      later(() => finish(), 1430);
    };

    intro.dataset.phase = "playing";
    later(dockLogo, 2600);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
      if (event.key === "Tab" && !finished) {
        event.preventDefault();
        intro.focus({ preventScroll: true });
      }
    };
    const onMotion = () => {
      if (motion.matches) finish();
    };
    const onResize = () => {
      // A viewport change during the flight invalidates the measured destination.
      if (intro.dataset.phase === "docking") finish();
    };
    const onVisibility = () => {
      if (document.hidden) finish();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize);
    motion.addEventListener("change", onMotion);
    later(() => finish(), 5000);

    return () => {
      finish(false);
      delete intro.dataset.phase;
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      motion.removeEventListener("change", onMotion);
    };
  }, []);

  return (
    <div
      ref={introRef}
      className="website-intro"
      hidden
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Chào mừng đến với NewGen"
    >
      <div className="intro-scene" aria-hidden="true" />
      <div className="intro-logo" aria-hidden="true">
        <svg viewBox="0 0 548 434" fillRule="evenodd" className="intro-logo-vector">
          {logoPaths.map(({ d, y }, index) => (
            <path key={index} d={d} pathLength={1}
              style={{
                "--piece-x": index === 0 ? "-54px" : index === 1 ? "54px" : "0px",
                "--piece-y": y < 210 ? "-16px" : "18px",
                "--piece-delay": `${y < 210 ? index * 120 : 450 + index * 24}ms`,
              } as CSSProperties} />
          ))}
        </svg>
      </div>
    </div>
  );
}
