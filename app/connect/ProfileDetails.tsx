"use client";

import { useState } from "react";
import styles from "./connect.module.css";

export default function ProfileDetails({ introduction }: { introduction: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className={styles.details} aria-label="自己紹介">
      <button
        className={styles.detailsButton}
        type="button"
        aria-expanded={isOpen}
        aria-controls="connect-introduction"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? "閉じる" : "詳しく…"}
      </button>
      <div className={styles.detailsReveal} data-open={isOpen} aria-hidden={!isOpen}>
        <div>
          <p id="connect-introduction" className={styles.introduction}>
            {introduction}
          </p>
        </div>
      </div>
    </section>
  );
}
