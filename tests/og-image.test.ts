// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import OpenGraphImage, { alt, size } from "@/app/opengraph-image";
import { profile } from "@/app/content";

const source = readFileSync(resolve(process.cwd(), "app/opengraph-image.tsx"), "utf8");

describe("Open Graph image", () => {
  it("renders a 1200x630 PNG", async () => {
    const response = await OpenGraphImage();
    const bytes = new Uint8Array(await response.arrayBuffer());
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(Array.from(bytes.slice(0, 4))).toEqual([0x89, 0x50, 0x4e, 0x47]);
  });

  it("carries the site's catch copy and current role line, not the old PdM wording", () => {
    expect(alt).toBe(`${profile.name} | 人を笑顔にし、心を動かすものを生み出す。`);
    expect(source).toContain("profile.catchTop");
    expect(source).toContain("profile.catchBottom");
    expect(source).toContain("profile.roleLine");
    expect(source).not.toContain("PdM");
  });

  it("draws Japanese with the bundled serif subset", () => {
    expect(source).toContain("assets/fonts/NotoSerifJP-Bold-og-subset.ttf");
  });
});
