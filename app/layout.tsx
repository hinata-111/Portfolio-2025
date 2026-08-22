import type { Metadata } from "next";
import { profile } from "@/app/content";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  title: `${profile.name} | Portfolio`,
  description:
    "人を笑顔にし、心を動かすものを生み出す。PdM × Engineer × Creator のポートフォリオ。",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: `${profile.name} | Portfolio`,
    description:
      "人を笑顔にし、心を動かすものを生み出す。PdM × Engineer × Creator のポートフォリオ。",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} | Portfolio`,
    description:
      "人を笑顔にし、心を動かすものを生み出す。PdM × Engineer × Creator のポートフォリオ。",
  },
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
