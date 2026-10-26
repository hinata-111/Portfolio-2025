// @vitest-environment node
import { describe, expect, it } from "vitest";
import OpenGraphImage, { alt, size } from "@/app/opengraph-image";
import { profile } from "@/app/content";

describe("Open Graph image", () => {
  // 描画時に同梱フォントを読むので、フォントが欠けていてもここで落ちる
  it("renders a 1200x630 PNG", async () => {
    const response = await OpenGraphImage();
    const bytes = new Uint8Array(await response.arrayBuffer());
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(Array.from(bytes.slice(0, 4))).toEqual([0x89, 0x50, 0x4e, 0x47]);
  });

  it("builds its alt text from the profile", () => {
    expect(alt).toContain(profile.name);
    expect(alt).toContain(profile.catchTop);
    expect(alt).toContain(profile.catchBottom);
  });
});
