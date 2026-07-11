import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "【氏名】 | Portfolio",
  description:
    "人を笑顔にし、心を動かすものを生み出す。PdM × Engineer × Creator のポートフォリオ。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
