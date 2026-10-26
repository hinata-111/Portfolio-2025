import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { aboutInfo, beyond, contact, connectProfile, favoriteRadio, projects, timeline } from "@/app/content";

// 文言そのものは固定しない。content.ts を書き換えても壊れてはいけない「データの約束」だけを見る。
describe("content", () => {
  it("gives every work a unique slug, since /works anchors are built from it", () => {
    const slugs = [...projects, ...beyond].map((work) => work.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    slugs.forEach((slug) => expect(slug).toMatch(/^[a-z0-9-]+$/));
  });

  it("writes every timeline period as 'YYYY.MM', 'YYYY.MM – YYYY.MM' or 'YYYY.MM – 現在'", () => {
    timeline.forEach((item) => expect(item.when).toMatch(/^\d{4}\.\d{2}( – (\d{4}\.\d{2}|現在))?$/));
  });

  it("points every image at a file that exists under public/", () => {
    const sources = [...projects, ...beyond, ...favoriteRadio]
      .map((item) => item.imageSrc)
      .filter((src): src is string => Boolean(src));
    sources.forEach((src) => expect(existsSync(resolve(process.cwd(), "public", `.${src}`)), src).toBe(true));
  });

  it("pairs every outbound link with a label, otherwise the link is silently dropped", () => {
    [...projects, ...beyond].forEach((work) => expect(Boolean(work.href), work.slug).toBe(Boolean(work.linkLabel)));
  });

  it("gives every project without a photo a text thumbnail, so no placeholder goes public", () => {
    projects.filter((project) => !project.imageSrc).forEach((project) => expect(project.textThumb, project.slug).toBeDefined());
  });

  it("uses one email address everywhere", () => {
    expect(connectProfile.email).toBe(contact.email);
    expect(aboutInfo.find((info) => info.k === "メール")).toMatchObject({
      v: contact.email,
      href: `mailto:${contact.email}`,
    });
  });
});
