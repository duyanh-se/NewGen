"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { company } from "@/lib/company";
import { Dialog } from "@base-ui/react/dialog";
import { ArrowUpRight, Menu, Phone, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { BackToTop } from "@/components/site/back-to-top";

const links = [
  ["Về NewGen", "/gioi-thieu"],
  ["Năng lực xây dựng", "/nang-luc-xay-dung"],
  ["Dự án tiêu biểu", "/du-an"],
  ["Blog", "/blog"],
  ["Liên hệ hợp tác", "/lien-he"],
];

function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const isCurrent = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const floatingRef = useRef<HTMLButtonElement>(null);
  const mobileRef = useRef<HTMLButtonElement>(null);
  const pendingLink = useRef<string | null>(null);

  useEffect(() => {
    // Next.js may scroll to the page content, above which the shared topbar sits.
    if (!window.location.hash) scrollToTop();
  }, [pathname]);

  useEffect(() => {
    const foundation = document.querySelector<HTMLElement>(".foundation");
    if (!foundation) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      setCollapsed(
        foundation.getBoundingClientRect().top < window.innerHeight - 80,
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={setOpen}
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen && pendingLink.current) {
          const href = pendingLink.current;
          pendingLink.current = null;
          if (pathname === href) {
            scrollToTop();
          } else {
            router.push(href, { scroll: false });
          }
        }
      }}
    >
      <div className="topbar" id="site-top" tabIndex={-1}>
        <div className="wrap">
          <span>{company.name}</span>
          <a href={company.phoneHref}>
            <Phone size={13} aria-hidden="true" />
            {company.phone}
          </a>
        </div>
      </div>
      <header className="header" data-collapsed={collapsed} inert={collapsed}>
        <div className="wrap nav-wrap">
          <Link
            href="/"
            scroll={false}
            onNavigate={() => {
              if (pathname === "/") scrollToTop();
            }}
            aria-label="NewGen - Trang chủ"
            className="brand"
          >
            <Image
              src="/images/logo-transparent.webp"
              alt="NewGen Construction"
              width={108}
              height={86}
              preload
            />
          </Link>
          <nav aria-label="Điều hướng chính" className="navigation">
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                scroll={false}
                onNavigate={() => {
                  if (pathname === href) scrollToTop();
                }}
                aria-current={isCurrent(href) ? "page" : undefined}
                data-slot={href === "/lien-he" ? "button" : undefined}
                className={
                  href === "/lien-he"
                    ? buttonVariants() + " nav-cta "
                    : undefined
                }
              >
                {label}
                {href === "/lien-he" && (
                  <ArrowUpRight size={17} aria-hidden="true" />
                )}
              </Link>
            ))}
          </nav>
          <Dialog.Trigger
            ref={mobileRef}
            data-drawer-trigger=""
            className="menu-toggle"
            aria-label="Mở menu"
          >
            <Menu aria-hidden="true" />
          </Dialog.Trigger>
        </div>
      </header>
      <Dialog.Trigger
        ref={floatingRef}
        data-drawer-trigger=""
        className="floating-menu"
        data-visible={collapsed}
        tabIndex={collapsed ? 0 : -1}
        aria-hidden={!collapsed}
        aria-label="Mở menu"
      >
        <Menu size={22} aria-hidden="true" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="menu-backdrop" />
        <Dialog.Popup
          className="menu-drawer"
          finalFocus={() =>
            pendingLink.current
              ? false
              : collapsed
                ? floatingRef.current
                : mobileRef.current
          }
        >
          <div className="drawer-top">
            <Image
              src="/images/logo-transparent.webp"
              alt="NewGen Construction"
              width={86}
              height={68}
            />
            <Dialog.Close className="drawer-close" aria-label="Đóng menu">
              <X size={24} aria-hidden="true" />
            </Dialog.Close>
          </div>
          <Dialog.Title className="drawer-title">Khám phá NewGen</Dialog.Title>
          <nav aria-label="Menu NewGen" className="drawer-links">
            {links.map(([label, href], index) => (
              <Link
                key={href}
                href={href}
                scroll={false}
                aria-current={isCurrent(href) ? "page" : undefined}
                onNavigate={(event) => {
                  event.preventDefault();
                  pendingLink.current = href;
                  setOpen(false);
                }}
              >
                <span className="drawer-index" aria-hidden="true">
                  0{index + 1}
                </span>
                <span>{label}</span>
                <ArrowUpRight size={20} aria-hidden="true" />
              </Link>
            ))}
          </nav>
          <a className="drawer-phone" href={company.phoneHref}>
            <Phone size={18} aria-hidden="true" />
            {company.phone}
          </a>
        </Dialog.Popup>
      </Dialog.Portal>
      <BackToTop />
    </Dialog.Root>
  );
}
