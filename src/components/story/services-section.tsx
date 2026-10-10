"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { services } from "@/lib/company";

export function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const targets = Array.from(section.querySelectorAll<HTMLElement>("[data-services-enter]"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;
    const sync = () => {
      observer?.disconnect();
      targets.forEach(target => { delete target.dataset.servicesReveal; });
      if (reduced.matches) return;
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const target = entry.target as HTMLElement;
          if (entry.isIntersecting) target.dataset.servicesReveal = "ready";
          else if (entry.boundingClientRect.top >= innerHeight || entry.boundingClientRect.bottom <= 0) {
            target.dataset.servicesReveal = "pending";
          }
        });
      }, { rootMargin: "0px 0px -10% 0px", threshold: 0 });
      targets.forEach(target => {
        const bounds = target.getBoundingClientRect();
        target.dataset.servicesReveal = bounds.top < innerHeight * .9 && bounds.bottom > 0 ? "ready" : "pending";
        observer!.observe(target);
      });
    };
    sync();
    reduced.addEventListener("change", sync);
    return () => {
      observer?.disconnect();
      reduced.removeEventListener("change", sync);
      targets.forEach(target => { delete target.dataset.servicesReveal; });
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const screen = section.querySelector<HTMLElement>(".services-screen")!;
    const cards = Array.from(
      section.querySelectorAll<HTMLElement>(".service-scene"),
    );
    const panels = cards.map((card) => ({
      image: card.querySelector<HTMLElement>(".service-scene-image")!,
      copy: card.querySelector<HTMLElement>(".service-scene-copy")!,
    }));
    const enabled = window.matchMedia(
      "(min-width: 1000px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)",
    );
    let frame = 0;
    let flight = 0;
    let drainingUntil = 0;
    let lastWheel = 0;
    let accumulated = 0;
    let bridgeFlight = 0;
    let bridgeDrainingUntil = 0;
    let bridgeLastWheel = 0;
    let bridgeAccumulated = 0;
    const root = document.documentElement;
    const about = document.querySelector<HTMLElement>(".about-overlap");

    const cancelBridge = () => {
      cancelAnimationFrame(bridgeFlight);
      bridgeFlight = 0;
      bridgeDrainingUntil = 0;
      bridgeAccumulated = 0;
      root.removeAttribute("data-about-services-transition");
    };

    const cancel = () => {
      cancelAnimationFrame(flight);
      flight = 0;
      drainingUntil = 0;
      accumulated = 0;
      root.removeAttribute("data-services-transition");
    };
    const travel = (target: number) => {
      const from = window.scrollY;
      const started = performance.now();
      root.setAttribute("data-services-transition", "");
      const tick = (now: number) => {
        const t = Math.min(1, (now - started) / 760);
        const eased = t * t * (3 - 2 * t);
        window.scrollTo({ top: from + (target - from) * eased, behavior: "instant" });
        if (t < 1) flight = requestAnimationFrame(tick);
        else {
          flight = 0;
          // Fixed cooldown, never extended by the incoming touchpad stream.
          drainingUntil = now + 180;
          root.removeAttribute("data-services-transition");
        }
      };
      flight = requestAnimationFrame(tick);
    };
    const travelBetweenSections = (target: number) => {
      const from = window.scrollY;
      const started = performance.now();
      root.setAttribute("data-about-services-transition", "");
      const tick = (now: number) => {
        const t = Math.min(1, (now - started) / 900);
        const eased = t < 0.5
          ? 4 * t * t * t
          : 1 - Math.pow(-2 * t + 2, 3) / 2;
        window.scrollTo({ top: from + (target - from) * eased, behavior: "instant" });
        if (t < 1) bridgeFlight = requestAnimationFrame(tick);
        else {
          bridgeFlight = 0;
          bridgeDrainingUntil = now + 180;
          root.removeAttribute("data-about-services-transition");
        }
      };
      bridgeFlight = requestAnimationFrame(tick);
    };
    const bridgeWheel = (event: WheelEvent) => {
      if (
        !about || !enabled.matches || event.defaultPrevented || event.ctrlKey ||
        root.hasAttribute("data-section-transition") || root.hasAttribute("data-about-transition") ||
        root.hasAttribute("data-lower-section-transition") ||
        Math.abs(event.deltaX) >= Math.abs(event.deltaY) || root.dataset.intro ||
        document.querySelector('[role="dialog"]:not([hidden])')
      ) return;
      let element = event.target instanceof Element ? event.target : null;
      if (element?.closest("input, textarea, select, [contenteditable=true], .navigation.open")) return;
      while (element && element !== document.body) {
        if (element.scrollHeight > element.clientHeight && /auto|scroll/.test(getComputedStyle(element).overflowY)) return;
        element = element.parentElement;
      }
      const now = performance.now();
      if (bridgeFlight || now < bridgeDrainingUntil) {
        event.preventDefault();
        return;
      }
      const aboutTop = window.scrollY + about.getBoundingClientRect().top;
      const servicesTop = window.scrollY + section.getBoundingClientRect().top;
      const down = event.deltaY > 0;
      const atAbout = Math.abs(window.scrollY - aboutTop) <= 2;
      const atServices = Math.abs(window.scrollY - servicesTop) <= 2;
      if ((!down || !atAbout) && (down || !atServices)) {
        bridgeAccumulated = 0;
        return;
      }
      event.preventDefault();
      if (now - bridgeLastWheel > 180 || Math.sign(bridgeAccumulated) !== Math.sign(event.deltaY)) bridgeAccumulated = 0;
      bridgeLastWheel = now;
      bridgeAccumulated += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
      if (Math.abs(bridgeAccumulated) < 24) return;
      bridgeAccumulated = 0;
      travelBetweenSections(down ? servicesTop : aboutTop);
    };
    const wheel = (event: WheelEvent) => {
      if (
        !enabled.matches || event.defaultPrevented || event.ctrlKey ||
        root.hasAttribute("data-section-transition") || root.hasAttribute("data-about-transition") ||
        root.hasAttribute("data-lower-section-transition") ||
        Math.abs(event.deltaX) >= Math.abs(event.deltaY) ||
        root.dataset.intro || document.querySelector('[role="dialog"]:not([hidden])')
      ) return;
      let element = event.target instanceof Element ? event.target : null;
      if (element?.closest("input, textarea, select, [contenteditable=true], .navigation.open")) return;
      while (element && element !== document.body) {
        if (element.scrollHeight > element.clientHeight && /auto|scroll/.test(getComputedStyle(element).overflowY)) return;
        element = element.parentElement;
      }
      const now = performance.now();
      if (flight || now < drainingUntil) {
        event.preventDefault();
        return;
      }
      const bounds = section.getBoundingClientRect();
      const step = (section.offsetHeight - screen.offsetHeight) / (cards.length - 1);
      const progress = -bounds.top / step;
      const down = event.deltaY > 0;
      // Let the page scroll normally beyond the first and last scene.
      if (progress < -0.01 || progress > cards.length - 1 + 0.01 ||
        (!down && progress <= 0.01) || (down && progress >= cards.length - 1 - 0.01)) {
        accumulated = 0;
        return;
      }
      event.preventDefault();
      if (now - lastWheel > 180 || Math.sign(accumulated) !== Math.sign(event.deltaY)) accumulated = 0;
      lastWheel = now;
      accumulated += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
      if (Math.abs(accumulated) < 24) return;
      accumulated = 0;
      const next = down ? Math.floor(progress + 0.01) + 1 : Math.ceil(progress - 0.01) - 1;
      travel(window.scrollY + bounds.top + Math.max(0, Math.min(cards.length - 1, next)) * step);
    };

    const update = () => {
      frame = 0;
      if (!enabled.matches) return;
      const bounds = section.getBoundingClientRect();
      const progress = Math.max(
        0,
        Math.min(
          3,
          (-bounds.top /
            Math.max(1, section.offsetHeight - screen.offsetHeight)) *
            3,
        ),
      );
      const current = Math.min(2, Math.floor(progress));
      const blend = Math.max(
        0,
        Math.min(1, progress - current),
      );
      const eased = blend * blend * (3 - 2 * blend);
      const active = current + (eased >= 0.5 ? 1 : 0);
      cards.forEach((card, index) => {
        const { image, copy } = panels[index];
        const distance = Math.max(-1, Math.min(1, index - current - eased));
        // Images crossfade vertically; copy leaves first, then enters horizontally.
        image.style.opacity = String(1 - Math.abs(distance));
        image.style.transform = `translate3d(0, ${64 * distance}px, 0)`;
        copy.style.opacity = String(Math.max(0, 1 - Math.abs(distance) * 2.2));
        copy.style.transform = `translate3d(${40 * distance}px, 0, 0)`;
        card.inert = index !== active;
        card.setAttribute("aria-hidden", String(index !== active));
      });
      section.style.setProperty(
        "--services-progress",
        String((progress + 1) / 4),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const clear = () => {
      delete section.dataset.pinned;
      section.style.removeProperty("--services-progress");
      cards.forEach((card, index) => {
        [panels[index].image, panels[index].copy].forEach((panel) => {
          panel.style.removeProperty("opacity");
          panel.style.removeProperty("transform");
        });
        card.inert = false;
        card.removeAttribute("aria-hidden");
      });
    };
    const sync = () => {
      cancel();
      cancelBridge();
      cancelAnimationFrame(frame);
      frame = 0;
      if (enabled.matches) {
        section.dataset.pinned = "true";
        update();
      } else clear();
    };
    sync();
    enabled.addEventListener("change", sync);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", sync);
    const handleWheel = (event: WheelEvent) => {
      // Finish the current service transition before handing back to the bridge.
      if (flight || performance.now() < drainingUntil) {
        wheel(event);
        return;
      }
      bridgeWheel(event);
      if (!event.defaultPrevented) wheel(event);
    };
    const interrupt = () => {
      cancel();
      cancelBridge();
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", interrupt);
    window.addEventListener("pointerdown", interrupt);
    window.addEventListener("touchstart", interrupt, { passive: true });
    window.addEventListener("hashchange", interrupt);
    return () => {
      cancel();
      cancelBridge();
      cancelAnimationFrame(frame);
      enabled.removeEventListener("change", sync);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", sync);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", interrupt);
      window.removeEventListener("pointerdown", interrupt);
      window.removeEventListener("touchstart", interrupt);
      window.removeEventListener("hashchange", interrupt);
      clear();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="services-story"
      id="linh-vuc"
      aria-labelledby="services-title"
    >
      <div className="services-screen">
        <div className="wrap services-content">
          <div className="services-heading">
            <div data-services-enter="heading">
              <h2 className="eyebrow" id="services-title">LĨNH VỰC HOẠT ĐỘNG</h2>
            </div>
            <p data-services-enter="description">
              Từ nền móng đến hoàn thiện, NewGen đáp ứng nhu cầu xây dựng với
              chuyên môn và sự tận tâm.
            </p>
          </div>
          <div className="services-scenes">
            {services.map((service) => (
              <article className="service-scene" key={service.name}>
                <div className="service-scene-image">
                  <Image
                    src={`/images/${service.image}.webp`}
                    alt={service.name}
                    fill
                    data-services-enter="image"
                    sizes="(min-width: 1280px) 560px, (min-width: 1000px) 46vw, (min-width: 600px) 560px, 100vw"
                    />
                </div>
                <div className="service-scene-copy">
                  <div className="service-scene-body" data-services-enter="copy">
                  <h3>{service.name}</h3>
                  <p>{service.text}</p>
                  <div className="service-scene-tags">{service.tags}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
