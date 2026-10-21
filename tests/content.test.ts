import { describe, it, expect } from "vitest";
import {
  profile, aboutInfo, aboutParagraphs, motto, stack, timeline, projects, beyond, socials, favoriteRadio,
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
    expect(projects).toHaveLength(4);
    expect(beyond).toHaveLength(3);
  });
  it("keeps the About profile compact and complete", () => {
    expect(aboutParagraphs).toEqual([
      "2023年9月、慶應義塾大学環境情報学部に入学。古谷知之研究室で、自然言語処理における感情分析を研究しています。2024年8月には42Tokyo Piscineに合格し、エンジニアの勉強をスタート。現在は長期インターンで、AIエージェントのR&DとWebアプリ開発に取り組んでいます。",
      "2か月間のシルクロード一人旅を経験。その体験をもとに、悩みから旅先を見つけるAI旅行サービス「Tabime」を開発・運営しています。",
    ]);
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
    expect(trip.details?.map((detail) => detail.value).join(" ")).toContain(
      "自分で目的を定め、そこへ向かう道を切り開いていく面白さを知った",
    );
    expect(trip.details?.map((detail) => detail.value).join(" ")).toContain("1万いいね");
    expect(trip.tags).toEqual(["Solo Travel", "Content Creation"]);
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
    const copy = internship?.details?.flatMap((detail) => detail.points).join(" ") ?? "";

    expect(projects.filter((project) => project.title.includes("長期インターン"))).toHaveLength(1);
    expect(internship?.details).toHaveLength(2);
    expect(internship?.summary).toBe(
      "2025年7月から現在まで、AIエージェントのR&Dと、実際に運用されているWebサービスの開発に従事。",
    );
    expect(copy).not.toMatch(/記載予定|会社確認後/);
    expect(internship?.details).toEqual([
      {
        title: "AIエージェントのR&D",
        points: [
          "複数のAIエージェント開発で、業務課題の整理から仕様検討・提案、設計・実装、技術検証まで担当",
          "評価データ作成・精度評価・エラー分析・個人情報のマスキングで、実用化に向けて改善",
        ],
      },
      {
        title: "Webサービス開発",
        points: [
          "メンバーシップ・ライブ配信・電子チケットを扱う会員制ファンプラットフォームを開発",
          "担当機能の要件整理から設計・実装・テストまで担当",
          "React・Node.js・PostgreSQLで画面・サーバー・DBを横断",
        ],
      },
    ]);
  });
  it("writes ongoing timeline periods as 'YYYY.MM – 現在' and orders radio by its 2023.09 start", () => {
    const when = (title: string) => timeline.find((item) => item.title === title)?.when;

    expect(when("レディオ湘南 ラジオ番組運営")).toBe("2023.09 – 現在");
    expect(when("長期インターン | エンジニア・ITコンサルタント")).toBe("2025.07 – 現在");
    expect(when("福島復興知事業")).toBe("2025.08 – 現在");
    expect(timeline.map((item) => item.desc).join(" ")).not.toContain("現在も継続中");
    expect(timeline.find((item) => item.title === "レディオ湘南 ラジオ番組運営")?.desc).not.toMatch(/^—/);
    expect(timeline.map((item) => item.title).slice(0, 3)).toEqual([
      "慶應義塾ニューヨーク学院 卒業",
      "慶應義塾大学 環境情報学部 入学",
      "レディオ湘南 ラジオ番組運営",
    ]);
  });
  it("lists the Ogiri Dice game with its public URL and screenshot", () => {
    const game = projects.find((project) => project.slug === "ogiri-dice");

    expect(game?.title).toBe("大喜利ダイス — 東京の劇場をめぐる大喜利すごろく");
    expect(game?.summary).toContain("大喜利の回答をAIが1〜6点で採点");
    expect(game?.summary).not.toContain("Gemini");
    expect(game?.details).toBeUndefined();
    expect(game?.href).toBe("https://ogiri-dice.pages.dev/");
    expect(game?.imageSrc).toBe("/images/project-ogiri-dice.png");
  });
  it("lists the favourite radio shows by their on-air titles", () => {
    expect(favoriteRadio.map((show) => show.title)).toEqual([
      "霜降り明星のオールナイトニッポン",
      "空気階段の踊り場",
      "真空ジェシカのラジオ父ちゃん",
      "ママタルトのラジオ母ちゃん",
      "カナメストーンのカナメちゃん村",
      "金属バットの社会の窓",
      "金魚番長のデメキング",
      "有吉弘行のSUNDAY NIGHT DREAMER",
    ]);
    favoriteRadio.forEach((show) => expect(show.imageSrc).toMatch(/^\/images\/radio\/[a-z0-9-]+\.(jpg|webp)$/));
  });
  it("gives every work a unique slug for /works anchors", () => {
    expect(projects.map((project) => project.slug)).toEqual(["tabime", "fukushima", "ogiri-dice", "internship"]);
    expect(beyond.map((item) => item.slug)).toEqual(["travel", "radio", "comedy"]);
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
  it("links the Fukushima project to its official project page", () => {
    const fukushima = projects.find((project) => project.title === "福島復興知プロジェクト");

    expect(fukushima?.href).toBe("https://www.fipo.or.jp/education/43276");
    expect(fukushima?.linkLabel).toBe("福島復興知事業の詳細を見る");
    expect(fukushima?.imageSrc).toBe("/images/project-fukushima-logo.svg");
    expect(fukushima?.imageFit).toBe("contain");
  });
  it("keeps the student radio activity to a short factual introduction", () => {
    const radio = beyond.find((item) => item.title === "ラジオ番組運営 — レディオ湘南");

    expect(radio?.meta).toBe("福利厚生団体 音像工房 / 2023.09 – 現在");
    expect(radio?.desc).toContain("台本、ナビゲーター、ミキサー");
    expect(radio?.desc).toContain("後輩育成と番組制作の仕組みづくり");
    expect(radio?.desc).not.toContain("2年間");
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
