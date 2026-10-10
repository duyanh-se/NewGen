"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import styles from "./back-to-top.module.css";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 400);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const scrollToTop = () => {
    window.dispatchEvent(new Event("newgen:back-to-top"));
    document.getElementById("site-top")?.focus({ preventScroll: true });
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };

  return (
    <button
      type="button"
      className={styles.button}
      data-back-to-top=""
      hidden={!visible}
      aria-label="Lên đầu trang"
      title="Lên đầu trang"
      onClick={scrollToTop}
    >
      <ArrowUp size={22} aria-hidden="true" />
    </button>
  );
}
