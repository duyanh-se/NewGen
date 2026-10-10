"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { partners } from "./data";

const MotionContext = createContext(false);

export function StoryMotion({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState(false);
  const stopped = reduced;
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    const visibility = () =>
      document.documentElement.toggleAttribute(
        "data-page-hidden",
        document.hidden,
      );
    document.addEventListener("visibilitychange", visibility);
    visibility();
    return () => {
      query.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", visibility);
      document.documentElement.removeAttribute("data-page-hidden");
    };
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.motion = stopped ? "off" : "on";
    const targets = document.querySelectorAll<HTMLElement>(
      ".section-heading:not(.leadership-heading), .service, .project",
    );
    if (stopped) {
      targets.forEach((el) => el.classList.remove("reveal-pending"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("reveal-pending");
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );
    targets.forEach((el) => {
      el.classList.add("reveal-target");
      if (
        el.getBoundingClientRect().top > window.innerHeight &&
        !el.classList.contains("is-visible")
      )
        el.classList.add("reveal-pending");
      observer.observe(el);
    });
    return () => {
      observer.disconnect();
      targets.forEach((el) => el.classList.remove("reveal-pending"));
      delete root.dataset.motion;
    };
  }, [stopped]);
  useEffect(() => {
    const timelines = [
      [
        ".capability",
        [
          ".capability-photo",
          ".eyebrow",
          "h2",
          ".capability-grid > div > p",
          ".capability-items",
        ],
      ],
      [".partners", [".eyebrow", "h2", ".partner-marquee"]],
      [".faq-section", [".eyebrow", "h2", ".faq-grid > div > p", ".faq-list"]],
      [
        ".contact-section",
        [
          ".eyebrow",
          "h2",
          ".contact-grid > div > p",
          ".contact-details",
          ".contact-grid > div > a",
        ],
      ],
    ] as const;
    const sections = timelines.flatMap(([selector, groups]) => {
      const section = document.querySelector<HTMLElement>(selector);
      if (!section) return [];
      const steps = groups.map(
        (group) => section.querySelector<HTMLElement>(group)!,
      );
      steps.forEach((step, index) => {
        step.setAttribute("data-time-step", "");
        step.style.setProperty("--time-enter", `${index * 70}ms`);
        step.style.setProperty(
          "--time-exit",
          `${(steps.length - 1 - index) * 50}ms`,
        );
      });
      const linked = section.id && window.location.hash === `#${section.id}`;
      section.dataset.sectionTime =
        stopped ||
        linked ||
        section.getBoundingClientRect().top <= innerHeight * 0.65
          ? "ready"
          : "pending";
      return [
        {
          section,
          steps,
          timer: undefined as ReturnType<typeof setTimeout> | undefined,
        },
      ];
    });
    let frame = 0;
    let lastY = window.scrollY;
    const update = () => {
      frame = 0;
      const up = window.scrollY < lastY;
      lastY = window.scrollY;
      sections.forEach((timeline) => {
        const { section } = timeline;
        const top = section.getBoundingClientRect().top;
        if (
          stopped ||
          section.contains(document.activeElement) ||
          top <= innerHeight * 0.65
        ) {
          clearTimeout(timeline.timer);
          section.dataset.sectionTime = "ready";
        } else if (
          up &&
          top > innerHeight * 0.8 &&
          section.dataset.sectionTime === "ready"
        ) {
          section.dataset.sectionTime = "returning";
          timeline.timer = setTimeout(() => {
            section.dataset.sectionTime = "pending";
          }, 560);
        }
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    sections.forEach(({ section }) =>
      section.addEventListener("focusin", update),
    );
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      sections.forEach(({ section, steps, timer }) => {
        clearTimeout(timer);
        section.removeEventListener("focusin", update);
        delete section.dataset.sectionTime;
        steps.forEach((step) => {
          step.removeAttribute("data-time-step");
          step.style.removeProperty("--time-enter");
          step.style.removeProperty("--time-exit");
        });
      });
    };
  }, [stopped]);
  useEffect(() => {
    const section = document.querySelector<HTMLElement>(".leadership-section");
    if (!section) return;
    const desktop = window.matchMedia(
      "(min-width: 1000px) and (min-height: 700px) and (pointer: fine)",
    );
    let frame = 0;
    const update = () => {
      frame = 0;
      const top = section.getBoundingClientRect().top;
      const focused = section.contains(document.activeElement);
      if (
        stopped ||
        focused ||
        top <= (desktop.matches ? 2 : innerHeight * 0.75)
      ) {
        section.dataset.leadershipReveal = "ready";
      } else if (top > (desktop.matches ? innerHeight * 0.12 : innerHeight)) {
        section.dataset.leadershipReveal = "pending";
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    desktop.addEventListener("change", schedule);
    section.addEventListener("focusin", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      desktop.removeEventListener("change", schedule);
      section.removeEventListener("focusin", update);
      delete section.dataset.leadershipReveal;
    };
  }, [stopped]);
  useEffect(() => {
    const section = document.querySelector<HTMLElement>(".about-overlap");
    const foundation = document.querySelector<HTMLElement>(".foundation");
    if (!section || !foundation) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia(
      "(min-width: 1000px) and (min-height: 700px) and (hover: hover) and (pointer: fine)",
    );
    const root = document.documentElement;
    let lastScrollY = window.scrollY;
    let timer: ReturnType<typeof setTimeout>;
    let frame = 0;
    let flight = 0;
    let moving = false;
    let draining = false;
    let lastWheel = 0;
    let accumulated = 0;
    let drainTimer: ReturnType<typeof setTimeout>;

    const setState = (state: "pending" | "ready" | "returning") => {
      clearTimeout(timer);
      section.dataset.timeEffect = state;
      if (state === "returning") {
        timer = setTimeout(() => {
          if (section.dataset.timeEffect === "returning") {
            section.dataset.timeEffect = "pending";
          }
        }, 920);
      }
    };
    const update = () => {
      frame = 0;
      if (reduced.matches) {
        setState("ready");
        return;
      }
      const scrollY = window.scrollY;
      const bounds = section.getBoundingClientRect();
      const aboutDestination = window.scrollY + bounds.top;
      const foundationDestination = aboutDestination - foundation.offsetHeight;
      const progress = Math.min(
        1,
        Math.max(
          0,
          (scrollY - foundationDestination) /
            Math.max(1, aboutDestination - foundationDestination),
        ),
      );
      section.style.setProperty(
        "--about-overlap-offset",
        `${(1 - progress) * 84}px`,
      );
      const reachedReadingPosition = bounds.top <= 2 && bounds.bottom > 0;
      const returningToFoundation =
        scrollY < lastScrollY && bounds.top > window.innerHeight * 0.18;
      if (returningToFoundation && section.dataset.timeEffect === "ready") {
        setState("returning");
      } else if (!moving && scrollY >= lastScrollY && reachedReadingPosition) {
        if (section.dataset.timeEffect !== "ready") {
          clearTimeout(timer);
          timer = setTimeout(() => {
            if (!moving && section.getBoundingClientRect().top <= 2)
              setState("ready");
          }, 100);
        }
      }
      lastScrollY = scrollY;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const cancel = () => {
      cancelAnimationFrame(flight);
      moving = false;
      draining = false;
      accumulated = 0;
      clearTimeout(drainTimer);
      root.removeAttribute("data-about-transition");
    };
    const drain = () => {
      // Do not restart this timer for each wheel event: touchpads stream events.
      clearTimeout(drainTimer);
      drainTimer = setTimeout(() => {
        draining = false;
      }, 180);
    };
    const travel = (target: number) => {
      clearTimeout(timer);
      setState("pending");
      moving = true;
      draining = true;
      root.setAttribute("data-about-transition", "");
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
          root.removeAttribute("data-about-transition");
          drain();
          timer = setTimeout(() => setState("ready"), 100);
        }
      };
      flight = requestAnimationFrame(tick);
    };
    const wheel = (event: WheelEvent) => {
      if (event.deltaY <= 0) {
        cancel();
        return;
      }
      if (
        event.defaultPrevented ||
        root.hasAttribute("data-section-transition") ||
        root.hasAttribute("data-about-services-transition") ||
        root.hasAttribute("data-services-transition") ||
        root.hasAttribute("data-lower-section-transition") ||
        reduced.matches ||
        !desktop.matches ||
        root.dataset.intro ||
        document.querySelector('[role="dialog"]:not([hidden])') ||
        event.ctrlKey ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
      )
        return;
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
      const bounds = section.getBoundingClientRect();
      const aboutDestination = window.scrollY + bounds.top;
      const foundationDestination = aboutDestination - foundation.offsetHeight;
      const y = window.scrollY;
      const down =
        y >= foundationDestination - 2 &&
        y < aboutDestination - 2 &&
        foundation.getBoundingClientRect().top <= 2;
      if (!down) {
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
        travel(aboutDestination);
      }
    };
    const syncReducedMotion = () => {
      cancel();
      section.dataset.timeEffect = reduced.matches ? "ready" : "pending";
      schedule();
    };

    syncReducedMotion();
    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", syncReducedMotion);
    reduced.addEventListener("change", syncReducedMotion);
    desktop.addEventListener("change", syncReducedMotion);
    window.addEventListener("newgen:back-to-top", cancel);
    return () => {
      cancel();
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", syncReducedMotion);
      reduced.removeEventListener("change", syncReducedMotion);
      desktop.removeEventListener("change", syncReducedMotion);
      window.removeEventListener("newgen:back-to-top", cancel);
      delete section.dataset.timeEffect;
      section.style.removeProperty("--about-overlap-offset");
    };
  }, []);
  useEffect(() => {
    const services = document.querySelector<HTMLElement>(".services-story");
    const leadershipSection = document.querySelector<HTMLElement>(
      ".leadership-section",
    );
    const enabled = window.matchMedia(
      "(min-width: 1000px) and (min-height: 700px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    if (!services || !leadershipSection) return;

    const root = document.documentElement;
    let flight = 0;
    let drainingUntil = 0;
    let accumulated = 0;
    let lastWheel = 0;

    const cancel = () => {
      cancelAnimationFrame(flight);
      flight = 0;
      drainingUntil = 0;
      accumulated = 0;
      root.removeAttribute("data-lower-section-transition");
    };
    const travel = (target: number) => {
      const from = window.scrollY;
      const started = performance.now();
      root.setAttribute("data-lower-section-transition", "");
      const tick = (now: number) => {
        const t = Math.min(1, (now - started) / 760);
        const eased = t * t * (3 - 2 * t);
        window.scrollTo({
          top: from + (target - from) * eased,
          behavior: "instant",
        });
        if (t < 1) flight = requestAnimationFrame(tick);
        else {
          flight = 0;
          drainingUntil = now + 180;
          root.removeAttribute("data-lower-section-transition");
        }
      };
      flight = requestAnimationFrame(tick);
    };
    const wheel = (event: WheelEvent) => {
      if (event.deltaY <= 0) {
        cancel();
        return;
      }
      if (
        !enabled.matches ||
        event.defaultPrevented ||
        event.ctrlKey ||
        root.dataset.intro ||
        root.hasAttribute("data-section-transition") ||
        root.hasAttribute("data-about-transition") ||
        root.hasAttribute("data-about-services-transition") ||
        root.hasAttribute("data-services-transition") ||
        Math.abs(event.deltaX) >= Math.abs(event.deltaY) ||
        document.querySelector('[role="dialog"]:not([hidden])')
      )
        return;
      let element = event.target instanceof Element ? event.target : null;
      if (
        element?.closest(
          "input, textarea, select, [contenteditable=true], [role=dialog], .navigation.open",
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
      const now = performance.now();
      if (flight || now < drainingUntil) {
        event.preventDefault();
        return;
      }
      const y = window.scrollY;
      const lastService =
        y +
        services.getBoundingClientRect().top +
        services.offsetHeight -
        window.innerHeight;
      const leadership = y + leadershipSection.getBoundingClientRect().top;
      // Services owns its scenes; this controller advances to leadership.
      if (y < lastService - 2) {
        accumulated = 0;
        return;
      }
      const bridging = y < leadership - 2;
      if (!bridging) {
        accumulated = 0;
        return;
      }
      event.preventDefault();
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
      if (Math.abs(accumulated) >= 24) {
        accumulated = 0;
        travel(leadership);
      }
    };
    const sync = () => cancel();

    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("resize", sync);
    window.addEventListener("keydown", cancel);
    window.addEventListener("pointerdown", cancel);
    window.addEventListener("touchstart", cancel, { passive: true });
    window.addEventListener("hashchange", cancel);
    window.addEventListener("newgen:back-to-top", cancel);
    enabled.addEventListener("change", sync);
    return () => {
      cancel();
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("resize", sync);
      window.removeEventListener("keydown", cancel);
      window.removeEventListener("pointerdown", cancel);
      window.removeEventListener("touchstart", cancel);
      window.removeEventListener("hashchange", cancel);
      window.removeEventListener("newgen:back-to-top", cancel);
      enabled.removeEventListener("change", sync);
    };
  }, []);
  return (
    <MotionContext.Provider value={stopped}>{children}</MotionContext.Provider>
  );
}

export function PartnerCarousel() {
  const [paused, setPaused] = useState(false);
  const stopped = useContext(MotionContext);
  return (
    <section className="partners partner-carousel wrap">
      <div className="eyebrow">ĐỐI TÁC TIÊU BIỂU</div>
      <h2>Cùng hợp tác. Cùng phát triển.</h2>
      <div
        className="partner-marquee"
        data-paused={paused || stopped}
        role="region"
        aria-label="Đối tác NewGen"
        tabIndex={stopped ? 0 : undefined}
      >
        <div className="partner-track">
          {[0, 1].map((copy) => (
            <div
              className="partner-set"
              key={copy}
              aria-hidden={copy === 1 ? true : undefined}
            >
              {partners.map(([id, name]) => (
                <div className="partner-logo" key={id}>
                  <Image
                    src={`/images/${id}.webp`}
                    alt={copy === 0 ? name : ""}
                    width={150}
                    height={90}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
