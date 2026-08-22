"use client";

import { useEffect, useRef, useState } from "react";

const navSections = [
  { id: "hero", num: "00", label: "Top" },
  { id: "about", num: "01", label: "About" },
  { id: "skills", num: "02", label: "Skills" },
  { id: "experience", num: "03", label: "Experience" },
  { id: "projects", num: "04", label: "Projects" },
  { id: "beyond", num: "05", label: "Life & Creative Practice" },
  { id: "contact", num: "06", label: "Contact" },
];

const PANEL_ID = "side-nav-panel";

/**
 * ホバーできない端末では、狭い幅でラベルを出す手段がない(触れた時点で移動が確定するため)。
 * その条件でだけレールをドロワーに切り替える。CSS 側の同名クエリと対で維持すること。
 */
const DRAWER_QUERY = "(max-width: 1239px) and (hover: none)";

export default function SideNav() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDrawerMode, setIsDrawerMode] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const sections = navSections
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });

        const topmost = navSections.find(({ id }) => visible.has(id));
        // 何も交差していない一瞬は直前の現在地を保つ(高速スクロール時のちらつき防止)
        setActiveId((current) => topmost?.id ?? current);
      },
      { threshold: 0.25 },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof matchMedia === "undefined") return;

    const query = matchMedia(DRAWER_QUERY);
    const sync = () => setIsDrawerMode(query.matches);

    sync();
    query.addEventListener("change", sync);

    return () => query.removeEventListener("change", sync);
  }, []);

  // レールに戻ったら開きっぱなしを畳む(端末回転・ウィンドウ拡大で取り残されないように)
  useEffect(() => {
    if (!isDrawerMode) setOpen(false);
  }, [isDrawerMode]);

  // 開いている間だけ Esc とフォーカストラップを動かす
  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    if (!panel) return;

    const focusables = () => Array.from(panel.querySelectorAll<HTMLAnchorElement>("a[href]"));

    focusables()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") return;

      const items = focusables();
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const close = () => {
    setOpen(false);
    toggleRef.current?.focus();
  };

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className="side-nav-toggle"
        aria-expanded={open}
        aria-controls={PANEL_ID}
        aria-label={open ? "セクションメニューを閉じる" : "セクションメニューを開く"}
        onClick={() => {
          if (!isDrawerMode) return;
          if (open) close();
          else setOpen(true);
        }}
      >
        <span className="side-nav-toggle-bars" aria-hidden="true" />
      </button>

      {open && (
        <div className="side-nav-backdrop" onClick={close} aria-hidden="true" />
      )}

      <nav
        id={PANEL_ID}
        ref={panelRef}
        className="side-nav"
        data-open={open ? "true" : undefined}
        aria-label="セクションナビゲーション"
      >
        {navSections.map((section) => {
          const isCurrent = section.id === activeId;
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={isCurrent ? "current" : undefined}
              aria-current={isCurrent ? "true" : undefined}
              onClick={() => {
                if (isDrawerMode) setOpen(false);
              }}
            >
              <span className="side-nav-num mono" aria-hidden="true">
                {section.num}
              </span>
              <span className="side-nav-label">{section.label}</span>
            </a>
          );
        })}
      </nav>
    </>
  );
}
