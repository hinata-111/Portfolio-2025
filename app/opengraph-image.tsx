import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { profile } from "@/app/content";

export const alt = `${profile.name} | 人を笑顔にし、心を動かすものを生み出す。`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// サイトのヒーローと同じ配色(globals.css の --night / --night-2 / --sun)
const NIGHT = "#070a17";
const NIGHT_2 = "#101733";
const SUN = "#ffc53d";

// 星は実行時乱数を使わず固定配置(サイトの背景と同じ方針)
const STARS: [number, number, number][] = [
  [72, 88, 2], [188, 512, 1.5], [312, 132, 1.5], [420, 560, 2], [538, 74, 1.5],
  [646, 586, 1.5], [702, 168, 2], [836, 540, 1.5], [1104, 470, 2], [1142, 92, 1.5],
  [96, 330, 1.5], [1010, 600, 1.5], [260, 260, 1], [980, 300, 1], [610, 330, 1],
];

// 黄色いマーカー。ヒーローの .hl と同じく文字の下 4 割に敷く
const marker = {
  display: "flex",
  padding: "0 6px",
  color: "#fff6de",
  backgroundImage: `linear-gradient(transparent 60%, ${SUN} 60%, ${SUN} 94%, transparent 94%)`,
} as const;

export default async function OpenGraphImage() {
  // 日本語の明朝はサブセット TTF を同梱(作り方は assets/fonts/README.md)
  const serif = await readFile(join(process.cwd(), "assets/fonts/NotoSerifJP-Bold-og-subset.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          overflow: "hidden",
          color: "#ffffff",
          fontFamily: "Noto Serif JP",
          backgroundImage: [
            "radial-gradient(circle at 82% 8%, rgba(94,112,255,.35), transparent 32%)",
            "radial-gradient(circle at 10% 70%, rgba(67,91,180,.22), transparent 30%)",
            `linear-gradient(180deg, ${NIGHT_2}, ${NIGHT} 70%)`,
          ].join(", "),
        }}
      >
        {STARS.map(([x, y, r]) => (
          <div
            key={`${x}-${y}`}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: r * 2,
              height: r * 2,
              borderRadius: r,
              background: "rgba(255,255,255,.55)",
            }}
          />
        ))}

        {/* 軌道と、その上を回る小さな太陽 */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -110,
            width: 460,
            height: 460,
            display: "flex",
            border: "1.5px solid rgba(184,214,255,.22)",
            borderRadius: 230,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 96,
            right: 300,
            width: 16,
            height: 16,
            borderRadius: 8,
            background: SUN,
            boxShadow: `0 0 24px ${SUN}`,
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 64,
            left: 96,
            display: "flex",
            color: "rgba(184,214,255,.75)",
            fontSize: 22,
            letterSpacing: "0.32em",
          }}
        >
          PORTFOLIO
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 76, lineHeight: 1.3 }}>
          <div style={{ display: "flex" }}>
            人を<span style={marker}>{profile.catchTop}</span>にし、
          </div>
          <div style={{ display: "flex" }}>
            <span style={marker}>{profile.catchBottom}</span>ものを生み出す。
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 96,
            right: 96,
            bottom: 64,
            display: "flex",
            alignItems: "center",
            gap: 24,
            paddingTop: 22,
            borderTop: "1px solid rgba(184,214,255,.2)",
            fontSize: 26,
          }}
        >
          <span style={{ display: "flex", color: "#ffffff" }}>{profile.nameLatin}</span>
          <span style={{ display: "flex", color: "rgba(184,214,255,.5)" }}>—</span>
          <span style={{ display: "flex", color: SUN, letterSpacing: "0.16em" }}>{profile.roleLine}</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Noto Serif JP", data: serif, style: "normal", weight: 700 }],
    },
  );
}
