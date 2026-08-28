import { describe, it, expect } from "vitest";
import {
  profile, aboutInfo, aboutParagraphs, motto, stack, timeline, projects, beyond, socials,
} from "@/app/content";

describe("content", () => {
  it("has the catch phrase parts", () => {
    expect(profile.catchTop).toBe("笑顔");
    expect(profile.catchBottom).toBe("心を動かす");
  });
  it("has expected collection sizes", () => {
    expect(aboutInfo).toHaveLength(5);
    expect(aboutParagraphs).toHaveLength(2);
    expect(stack).toHaveLength(4);
    expect(timeline).toHaveLength(7);
    expect(projects).toHaveLength(3);
    expect(beyond).toHaveLength(3);
  });
  it("adds the Tabime stack to the existing skill categories", () => {
    expect(stack.map((row) => row.cat)).toEqual([
      "Python / NLP",
      "Web開発",
      "Database",
      "Infra / Tools",
    ]);

    const pillsByCategory = Object.fromEntries(stack.map((row) => [row.cat, row.pills]));

    expect(pillsByCategory["Web開発"]).toEqual(
      expect.arrayContaining(["Vite", "Tailwind CSS", "Hono"]),
    );
    expect(pillsByCategory.Database).toContain("Cloudflare D1");
    expect(pillsByCategory["Infra / Tools"]).toEqual(
      expect.arrayContaining(["Cloudflare Workers / Pages"]),
    );
    expect(pillsByCategory["Infra / Tools"]).not.toContain("pnpm Monorepo");
    expect(stack.find((row) => row.cat === "Web開発")?.note).toBe("インターン・個人開発で使用");
  });
  it("includes the Silk Road solo trip", () => {
    expect(timeline).toContainEqual({
      when: "2026.04 – 2026.06",
      title: "シルクロード一人旅",
      desc: "中国北京からエジプト・カイロまで、シルクロード横断の一人旅を実施",
    });
  });
  it("keeps the overseas solo trip concise while stating its reason and route", () => {
    const trip = beyond[0];

    expect(trip.title).toBe("海外一人旅 — 2ヶ月・8ヶ国");
    expect(trip.meta).toBe("個人活動 / 2026.04 – 2026.06");
    expect(trip.details).toEqual([
      expect.objectContaining({ label: "旅の背景" }),
      expect.objectContaining({ label: "旅で得られたこと" }),
    ]);
    expect(trip.details?.map((detail) => detail.value).join(" ")).toContain("クリエイターとして視野と表現の幅を広げる");
    expect(trip.details?.map((detail) => detail.value).join(" ")).toContain("不確実な状況でも自ら考えて行動する力");
    expect(trip.details?.map((detail) => detail.value).join(" ")).toContain("1万いいね");
    expect(trip.href).toBe("https://tabime.pages.dev");
  });
  it("moves the Fukushima workshop into projects and removes Discord Bot", () => {
    expect(projects.some((project) => project.title === "Discord Bot(個人開発)")).toBe(false);
    expect(projects.some((project) => project.title === "福島復興知プロジェクト")).toBe(true);
    expect(beyond.some((item) => item.title === "福島復興知プロジェクト")).toBe(false);
  });
  it("presents Tabime as a concise doorway to the product", () => {
    const tabime = projects.find((project) => project.title === "Tabime — 悩みから旅先を見つけるAI");

    expect(tabime?.summary).toContain("海外一人旅");
    expect(tabime?.summary).toContain("企画、プロダクト開発");
    expect(tabime?.summary).not.toMatch(/3軸|8タイプ|3問|9問/);
    expect(tabime?.href).toBe("https://tabime.pages.dev");
  });
  it("combines the internship work and states the factual responsibility boundary", () => {
    const internship = projects.find((project) => project.title === "長期インターン — 株式会社スパイクスタジオ");
    const copy = internship?.details?.map((detail) => detail.value).join(" ") ?? "";

    expect(projects.filter((project) => project.title.includes("長期インターン"))).toHaveLength(1);
    expect(internship?.details).toHaveLength(2);
    expect(internship?.summary).toContain("2025年7月から現在まで");
    expect(copy).not.toMatch(/記載予定|会社確認後/);
    expect(internship?.details?.[0].title).toBe("AIエージェントのR&D");
    expect(copy).toContain("要件を整理");
    expect(copy).toContain("精度評価・改善");
    expect(copy).toContain("個人情報のマスキング");
    expect(copy).toContain("要件を整理");
    expect(copy).toContain("一貫して実装");
    expect(copy).toContain("PostgreSQL");
  });
  it("includes graduation from Keio Academy of New York", () => {
    expect(timeline[0]).toEqual({
      when: "2023.08",
      title: "慶應義塾ニューヨーク学院 卒業",
      desc: "",
    });
  });
  it("describes the Fukushima project with its verified scale and workshop design", () => {
    const fukushima = projects.find((project) => project.title === "福島復興知プロジェクト");
    const copy = fukushima?.summary ?? "";

    expect(copy).toContain("県内2校");
    expect(copy).toContain("生成AI");
    expect(copy).toContain("設計・実施");
    expect(copy).not.toContain("AI×街づくり");
    expect(timeline.some((item) => item.title === "福島復興知事業")).toBe(true);
  });
  it("keeps the student radio activity to a short factual introduction", () => {
    const radio = beyond.find((item) => item.title === "学生ラジオ番組 — レディオ湘南");

    expect(radio?.meta).toBe("福利厚生団体 音像工房 / 2023.09 – 現在");
    expect(radio?.desc).toContain("台本、ナビゲーター、ミキサー");
    expect(radio?.desc).toContain("後輩育成と番組制作の仕組みづくり");
    expect(radio?.details).toBeUndefined();
  });
  it("has the Confucius motto", () => {
    expect(motto.quote).toContain("之を楽しむ者に如かず");
    expect(motto.cite).toBe("— 論語・雍也");
  });
});

describe("socials", () => {
  it("lists GitHub with a URL and keeps X unresolved", () => {
    expect(socials.map((social) => social.label)).toEqual(["GitHub", "X"]);
    expect(socials[0].href).toBe("https://github.com/hinata-111");
    expect(socials[1].href).toBe("");
  });
});

describe("about info", () => {
  it("includes a working email address", () => {
    expect(aboutInfo).toContainEqual({
      k: "メール",
      v: "yos570038@gmail.com",
      href: "mailto:yos570038@gmail.com",
    });
  });
});
