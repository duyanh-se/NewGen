"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Landmark, UsersRound, Blocks } from "lucide-react";

export function FoundationSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".hero");
    const section = sectionRef.current;
    const stage = section?.closest<HTMLElement>(".foundation-about-stage");
    if (!hero || !section || !stage) return;
    const root = document.documentElement;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
    let frame = 0;
    let flight = 0;
    let moving = false;
    let draining = false;
    let lastWheel = 0;
    let accumulated = 0;
    let lastScrollY = window.scrollY;
    let settled: ReturnType<typeof setTimeout>;
    let revealTimer: ReturnType<typeof setTimeout>;
    let drainTimer: ReturnType<typeof setTimeout>;
    section.dataset.reveal = motion.matches ? "ready" : "pending";

    // Measure the normal-flow stage; the sticky section moves with the viewport.
    const destination = () =>
      window.scrollY + stage.getBoundingClientRect().top;
    const returnToPast = () => {
      clearTimeout(revealTimer);
      if (!motion.matches && section.dataset.reveal === "ready") {
        section.dataset.reveal = "returning";
      }
    };
    const reveal = () => {
      clearTimeout(revealTimer);
      if (moving || section.dataset.reveal === "ready") return;
      if (motion.matches) section.dataset.reveal = "ready";
      else if (section.getBoundingClientRect().top <= 2) {
        revealTimer = setTimeout(() => {
          if (!moving && section.getBoundingClientRect().top <= 2)
            section.dataset.reveal = "ready";
        }, 100);
      }
    };
    const update = () => {
      frame = 0;
      const scrollY = window.scrollY;
      const scrollingUp = scrollY < lastScrollY;
      lastScrollY = scrollY;
      const bounds = hero.getBoundingClientRect();
      if (scrollingUp && section.getBoundingClientRect().top > 2) {
        returnToPast();
      }
      hero.toggleAttribute(
        "data-scroll-active",
        !motion.matches && bounds.bottom > 0,
      );
      const progress = motion.matches
        ? 0
        : Math.min(1, Math.max(0, scrollY / Math.max(1, destination())));
      hero.style.setProperty("--hero-drift", "0px");
      hero.style.setProperty("--hero-copy-drift", "0px");
      hero.style.setProperty("--hero-copy-opacity", "1");
      section.style.setProperty(
        "--foundation-overlap-offset",
        `${(1 - progress) * 84}px`,
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
      clearTimeout(revealTimer);
      clearTimeout(settled);
      settled = setTimeout(reveal, 160);
    };
    const cancel = () => {
      cancelAnimationFrame(flight);
      moving = false;
      draining = false;
      accumulated = 0;
      clearTimeout(drainTimer);
      root.removeAttribute("data-section-transition");
    };
    const drain = () => {
      // A fixed settling period lets sustained touchpad input continue afterward.
      clearTimeout(drainTimer);
      drainTimer = setTimeout(() => {
        draining = false;
      }, 180);
    };
    const travel = (target: number) => {
      if (target < window.scrollY) returnToPast();
      moving = true;
      draining = true;
      clearTimeout(revealTimer);
      root.setAttribute("data-section-transition", "");
      const from = window.scrollY;
      const started = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - started) / 900);
        const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        window.scrollTo({
          top: from + (target - from) * eased,
          behavior: "instant",
        });
        if (t < 1) flight = requestAnimationFrame(tick);
        else {
          moving = false;
          root.removeAttribute("data-section-transition");
          drain();
          reveal();
        }
      };
      flight = requestAnimationFrame(tick);
    };
    const wheel = (event: WheelEvent) => {
      if (
        event.defaultPrevented ||
        root.hasAttribute("data-about-transition") ||
        root.hasAttribute("data-about-services-transition") ||
        root.hasAttribute("data-services-transition") ||
        root.hasAttribute("data-lower-section-transition") ||
        motion.matches ||
        coarse.matches ||
        root.dataset.intro ||
        document.querySelector('[role="dialog"]:not([hidden])') ||
        event.ctrlKey ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
      )
        return;
      // Preserve forms, menus, dialogs and independently scrollable elements.
      let element = event.target instanceof Element ? event.target : null;
      if (
        element?.closest(
          "input, textarea, select, [role=dialog], .navigation.open",
        )
      )
        return;
      while (element && element !== document.body) {
        if (
          element.scrollHeight > element.clientHeight &&
          /auto|scroll/.test(getComputedStyle(element).overflowY)
        )
          return;
        element = element.parentElement;
      }
      if (moving || draining) {
        event.preventDefault();
        return;
      }
      const y = window.scrollY;
      const end = destination();
      const down =
        event.deltaY > 0 &&
        y < end - 2 &&
        hero.getBoundingClientRect().bottom <= window.innerHeight + 2;
      const up = event.deltaY < 0 && y > 2 && y <= end + 2;
      if (!down && !up) {
        accumulated = 0;
        return;
      }
      event.preventDefault();
      const now = performance.now();
      if (
        now - lastWheel > 180 ||
        Math.sign(accumulated) !== Math.sign(event.deltaY)
      )
        accumulated = 0;
      lastWheel = now;
      accumulated +=
        event.deltaY *
        (event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? window.innerHeight
            : 1);
      if (Math.abs(accumulated) >= 32) {
        accumulated = 0;
        travel(down ? end : 0);
      }
    };
    const measure = () => {
      cancel();
      root.toggleAttribute("data-hero-snap", !motion.matches);
      schedule();
      if (motion.matches) reveal();
    };
    const interrupt = (event: Event) => {
      if (
        event.type === "click" &&
        !(
          event.target instanceof Element &&
          event.target.closest("a[href], [data-drawer-trigger]")
        )
      )
        return;
      cancel();
      schedule();
    };
    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("scrollend", reveal);
    window.addEventListener("resize", measure);
    window.addEventListener("keydown", interrupt);
    window.addEventListener("touchstart", interrupt, { passive: true });
    window.addEventListener("click", interrupt);
    window.addEventListener("hashchange", interrupt);
    window.addEventListener("newgen:back-to-top", interrupt);
    motion.addEventListener("change", measure);
    measure();
    update();
    reveal();
    return () => {
      cancel();
      cancelAnimationFrame(frame);
      clearTimeout(settled);
      clearTimeout(revealTimer);
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("scrollend", reveal);
      window.removeEventListener("resize", measure);
      window.removeEventListener("keydown", interrupt);
      window.removeEventListener("touchstart", interrupt);
      window.removeEventListener("click", interrupt);
      window.removeEventListener("hashchange", interrupt);
      window.removeEventListener("newgen:back-to-top", interrupt);
      motion.removeEventListener("change", measure);
      root.removeAttribute("data-hero-snap");
      delete section.dataset.reveal;
      hero.removeAttribute("data-scroll-active");
      ["--hero-drift", "--hero-copy-drift", "--hero-copy-opacity"].forEach(
        (property) => hero.style.removeProperty(property),
      );
      section.style.removeProperty("--foundation-overlap-offset");
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="foundation"
      id="nen-tang"
      aria-labelledby="foundation-title"
    >
      <div className="foundation-portrait" aria-hidden="true">
        <Image
          src="/images/NewGen1.webp"
          alt=""
          fill
          sizes="(max-width: 800px) 100vw, 55vw"
        />
      </div>
      <div className="wrap foundation-content">
        <div className="foundation-heading">
          <div className="eyebrow">NEWGEN QUA NHỮNG CON SỐ</div>
          <h2 id="foundation-title">
            Nền tảng cho
            <br />
            <span>niềm tin vững bền.</span>
          </h2>
        </div>
        <div className="foundation-metrics">
          <div className="foundation-metric">
            <Landmark aria-hidden="true" strokeWidth={1.2} />
            <p className="foundation-number">
              10 <span>tỷ đồng</span>
            </p>
            <h3>Vốn điều lệ</h3>
          </div>
          <div className="foundation-metric">
            <UsersRound aria-hidden="true" strokeWidth={1.2} />
            <p className="foundation-number">
              36 <span>nhân sự</span>
            </p>
            <h3>Cán bộ chuyên môn</h3>
          </div>
          <div className="foundation-metric foundation-solutions">
            <div>
              <Blocks aria-hidden="true" strokeWidth={1.2} />
              <p className="foundation-number">
                04 <span>lĩnh vực</span>
              </p>
              <h3>Giải pháp xây dựng chủ lực</h3>
            </div>
            <ul>
              <li>Xây dựng dân dụng</li>
              <li>Xây dựng công nghiệp</li>
              <li>Hạ tầng kỹ thuật</li>
              <li>Công trình thủy lợi</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
