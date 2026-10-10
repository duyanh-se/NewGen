"use client";

import { useEffect, useRef, type ReactNode } from "react";

const selector = "[data-page-reveal], .inner-heading > :not(.breadcrumbs), .inner-cover, .inner-callout > .wrap, .blog-byline, .blog-article > .content-prose > *, .blog-article > .text-link";

export function PageReveal({ children }: { children: ReactNode }) {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    const targets = Array.from(page.querySelectorAll<HTMLElement>(selector));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const entered = new Set<HTMLElement>();
    const animations = new Map<HTMLElement, Animation>();
    let observer: IntersectionObserver | null = null;

    const stop = () => {
      observer?.disconnect();
      animations.forEach(animation => animation.cancel());
      animations.clear();
    };
    const watch = () => {
      stop();
      if (reduced.matches) return;
      observer = new IntersectionObserver(entries => {
        let stagger = 0;
        entries.forEach(entry => {
          const target = entry.target as HTMLElement;
          if (!entry.isIntersecting || entered.has(target)) return;
          entered.add(target);
          observer?.unobserve(target);
          const animation = target.animate([
            { opacity: 0, transform: "translate3d(0, 24px, 0)" },
            { opacity: 1, transform: "translate3d(0, 0, 0)" },
          ], {
            duration: 480,
            delay: Math.min(stagger++ * 70, 210),
            easing: "cubic-bezier(0.23, 1, 0.32, 1)",
            fill: "backwards",
          });
          animations.set(target, animation);
          animation.onfinish = () => animations.delete(target);
        });
      }, { rootMargin: "0px 0px -48px 0px", threshold: .08 });
      targets.forEach(target => {
        if (!entered.has(target)) observer?.observe(target);
      });
    };
    const onFocus = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      const target = event.target.closest<HTMLElement>(selector);
      if (!target || !page.contains(target)) return;
      entered.add(target);
      observer?.unobserve(target);
      animations.get(target)?.cancel();
      animations.delete(target);
    };

    page.addEventListener("focusin", onFocus);
    reduced.addEventListener("change", watch);
    watch();
    return () => {
      stop();
      page.removeEventListener("focusin", onFocus);
      reduced.removeEventListener("change", watch);
    };
  }, []);

  return <div ref={pageRef} data-page-motion="">{children}</div>;
}
