"use client";

import { type ReactNode, useState } from "react";
import styles from "./connect.module.css";

// 自己紹介文は文節解析済みの内容をサーバー側から children で受け取る。
// ここで <Phrased> を import すると budoux がクライアントバンドルに載ってしまう。
export default function ProfileDetails({ introduction }: { introduction: ReactNode }) {
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
