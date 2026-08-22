import { ImageResponse } from "next/og";

export const alt = "鈴木日向 | Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 84px",
          color: "#f4efe5",
          background: "linear-gradient(135deg, #111827 0%, #241c3b 55%, #4a253f 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: "0.18em" }}>
          PORTFOLIO
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 700 }}>
            HINATA SUZUKI
          </div>
          <div style={{ display: "flex", fontSize: 34, color: "#f4b6a8" }}>
            PdM × ENGINEER × CREATOR
          </div>
          <div style={{ display: "flex", fontSize: 30 }}>
            Making things that move people.
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#d9d2c5" }}>
          hinata-111 / Portfolio
        </div>
      </div>
    ),
    size,
  );
}
