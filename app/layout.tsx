import type { Metadata } from "next";
import { profile } from "@/app/content";
import "./globals.css";

export const metadata: Metadata = {
  title: `${profile.name} | Portfolio`,
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
