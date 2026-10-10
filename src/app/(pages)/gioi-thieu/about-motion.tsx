"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./about.module.css";

export function AboutMotion({ children }: { children: ReactNode }) {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    const sections = Array.from(page.querySelectorAll<HTMLElement>("section"));
    const nativeSection = page.querySelector<HTMLElement>("[data-about-native-scroll]");
    const targets = Array.from(page.querySelectorAll<HTMLElement>(
      "section, [data-about-item], [data-about-background]",
    ));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 1000px) and (min-height: 700px)");
    let observer: IntersectionObserver | undefined;
    let flight = 0;
    let cooldownUntil = 0;
    let accumulated = 0;
    let lastWheel = 0;
    const headerHeight = () => document.querySelector("header")?.getBoundingClientRect().height ?? 94;

    const interrupt = () => {
      cancelAnimationFrame(flight);
      flight = 0;
      cooldownUntil = 0;
      accumulated = 0;
      delete page.dataset.aboutTravel;
    };

    const sync = () => {
      interrupt();
      observer?.disconnect();
      if (reduced.matches) {
        delete page.dataset.aboutMotion;
        targets.forEach(target => { target.dataset.aboutShown = "true"; });
        return;
      }
      page.dataset.aboutMotion = "true";
      const header = headerHeight();
      targets.forEach(target => {
        const bounds = target.getBoundingClientRect();
        target.dataset.aboutShown = String(bounds.bottom > header && bounds.top < innerHeight * .94);
      });
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const target = entry.target as HTMLElement;
          if (entry.isIntersecting) target.dataset.aboutShown = "true";
          else if (entry.boundingClientRect.top >= innerHeight || entry.boundingClientRect.bottom <= header) {
            target.dataset.aboutShown = "false";
          }
        });
      }, { rootMargin: `-${header}px 0px -6% 0px`, threshold: 0 });
      targets.forEach(target => observer!.observe(target));
    };

    const travel = (target: number) => {
      const from = window.scrollY;
      const started = performance.now();
      page.dataset.aboutTravel = "true";
      const tick = (now: number) => {
        const t = Math.min(1, (now - started) / 760);
        const eased = t * t * (3 - 2 * t);
        window.scrollTo({ top: from + (target - from) * eased, behavior: "instant" });
        if (t < 1) flight = requestAnimationFrame(tick);
        else {
          flight = 0;
          // A fixed cooldown lets continuous touchpad input advance again.
          cooldownUntil = now + 180;
          delete page.dataset.aboutTravel;
        }
      };
      flight = requestAnimationFrame(tick);
    };

    const wheel = (event: WheelEvent) => {
      if (!desktop.matches || reduced.matches || event.defaultPrevented || event.ctrlKey ||
        Math.abs(event.deltaX) >= Math.abs(event.deltaY) || document.querySelector('[role="dialog"]')) return;
      let element = event.target instanceof Element ? event.target : null;
      if (element?.closest("input, textarea, select, [contenteditable=true]")) return;
      while (element && element !== document.body) {
        if (element.scrollHeight > element.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(element).overflowY)) return;
        element = element.parentElement;
      }
      const header = headerHeight();
      if (nativeSection && nativeSection.getBoundingClientRect().top <= header + 2) {
        if (flight) interrupt();
        accumulated = 0;
        return;
      }
      const now = performance.now();
      if (flight || now < cooldownUntil) {
        event.preventDefault();
        return;
      }
      const y = window.scrollY;
      const tops = sections.map(section => y + section.getBoundingClientRect().top);
      const starts = tops.map((top, index) => index === 0 ? 0 : top - header);
      let current = 0;
      starts.forEach((start, index) => { if (start <= y + 2) current = index; });
      const end = Math.max(starts[current], tops[current] + sections[current].offsetHeight - innerHeight);
      const down = event.deltaY > 0;
      let destination: number;
      if (down) {
        if (current === sections.length - 1 || y < end - 2) { accumulated = 0; return; }
        if (sections[current].hasAttribute("data-about-native-next")) { accumulated = 0; return; }
        destination = starts[current + 1];
      } else {
        // Keep the return from values native until the message reaches its start.
        if (sections[current].hasAttribute("data-about-native-next") && y > starts[current] + 2) { accumulated = 0; return; }
        // Keep reading long sections and the footer with native scrolling.
        if (y > starts[current] + 2 && (y <= end + 2 || current === sections.length - 1)) { accumulated = 0; return; }
        if (y > starts[current] + 2) destination = starts[current];
        else if (current > 0) {
          const previous = current - 1;
          if (sections[previous].hasAttribute("data-about-native-next")) { accumulated = 0; return; }
          destination = Math.max(starts[previous], tops[previous] + sections[previous].offsetHeight - innerHeight);
        } else { accumulated = 0; return; }
      }
      event.preventDefault();
      if (now - lastWheel > 180 || Math.sign(accumulated) !== Math.sign(event.deltaY)) accumulated = 0;
      lastWheel = now;
      accumulated += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
      if (Math.abs(accumulated) < 24) return;
      accumulated = 0;
      travel(destination);
    };

    const focus = (event: FocusEvent) => {
      const section = event.target instanceof Element ? event.target.closest("section") : null;
      if (section) {
        section.dataset.aboutShown = "true";
        section.querySelectorAll<HTMLElement>("[data-about-item], [data-about-background]").forEach(target => {
          target.dataset.aboutShown = "true";
        });
      }
    };

    sync();
    reduced.addEventListener("change", sync);
    desktop.addEventListener("change", sync);
    window.addEventListener("resize", sync);
    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("keydown", interrupt);
    window.addEventListener("pointerdown", interrupt);
    window.addEventListener("touchstart", interrupt, { passive: true });
    window.addEventListener("hashchange", interrupt);
    page.addEventListener("focusin", focus);
    return () => {
      interrupt();
      observer?.disconnect();
      reduced.removeEventListener("change", sync);
      desktop.removeEventListener("change", sync);
      window.removeEventListener("resize", sync);
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("keydown", interrupt);
      window.removeEventListener("pointerdown", interrupt);
      window.removeEventListener("touchstart", interrupt);
      window.removeEventListener("hashchange", interrupt);
      page.removeEventListener("focusin", focus);
      delete page.dataset.aboutMotion;
      targets.forEach(target => { delete target.dataset.aboutShown; });
    };
  }, []);

  return <div className={styles.page} ref={pageRef}>{children}</div>;
}
