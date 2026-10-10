"use client";

import { Children, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import styles from "./organization.module.css";

const chapters = [
  ["Tổng quan", "organization-overview-title"],
  ["Sơ đồ tổ chức", "organization-chart-title"],
  ["Hình ảnh", "organization-photos-title"],
] as const;

export function OrganizationStory({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(0);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const switchTab = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % chapters.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + chapters.length) % chapters.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = chapters.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    tabsRef.current[next]?.focus();
  };

  return (
    <section className={styles.section} aria-labelledby="organization-title" data-organization-story="">
      <div className={styles.stage} data-organization-stage="">
        <div className={`wrap ${styles.inner}`}>
          <div className={styles.heading}>
            <span className={styles.eyebrow}>ĐỘI NGŨ NEWGEN</span>
            <h2 id="organization-title">Cơ cấu tổ chức</h2>
            <div className={styles.chapters} role="tablist" aria-label="Nội dung cơ cấu tổ chức">
              {chapters.map(([label, id], index) => (
                <button
                  key={id}
                  ref={element => { tabsRef.current[index] = element; }}
                  type="button"
                  role="tab"
                  id={`${id}-tab`}
                  aria-controls={`${id}-panel`}
                  aria-selected={active === index}
                  tabIndex={active === index ? 0 : -1}
                  onClick={() => setActive(index)}
                  onKeyDown={event => switchTab(event, index)}
                >{label}</button>
              ))}
            </div>
          </div>
          <div className={styles.viewport} data-organization-viewport="">
            {Children.toArray(children).map((child, index) => (
              <div
                key={chapters[index][1]}
                role="tabpanel"
                id={`${chapters[index][1]}-panel`}
                aria-labelledby={`${chapters[index][1]}-tab`}
                hidden={active !== index}
                tabIndex={0}
              >{child}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
