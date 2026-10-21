import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Experience from "@/app/components/Experience";
import Projects from "@/app/components/Projects";
import Beyond from "@/app/components/Beyond";
import { timeline } from "@/app/content";
import Contact from "@/app/components/Contact";
import { contact } from "@/app/content";

describe("Experience", () => {
  it("is chapter 03 on the About page", () => {
    const { container } = render(<Experience />);
    expect(container.querySelector(".sec-num")).toHaveTextContent("03");
  });

  it("omits the description line when an item has no desc", () => {
    render(<Experience />);
    const items = Array.from(document.querySelectorAll(".timeline li"));
    expect(items[0].querySelector(".what span")).toBeNull();
    expect(document.querySelectorAll(".timeline .what span")).toHaveLength(
      timeline.filter((t) => t.desc).length,
    );
  });

  it("renders 7 timeline items including high school graduation", () => {
    render(<Experience />);
    expect(document.querySelectorAll(".timeline li")).toHaveLength(7);
    expect(screen.getAllByText("慶應義塾ニューヨーク学院 卒業")).toHaveLength(1);
  });

  it("uses a readable vertical timeline instead of a constellation map", () => {
    render(<Experience />);
    expect(document.querySelector(".constellation-map")).not.toBeInTheDocument();
    expect(document.querySelector(".timeline")).toBeInTheDocument();
    expect(document.querySelectorAll(".timeline .dot")).toHaveLength(timeline.length);
  });
});

describe("Projects", () => {
  it("is chapter 01 on the Works page", () => {
    const { container } = render(<Projects />);
    expect(container.querySelector(".sec-num")).toHaveTextContent("01");
  });

  it("renders four equal entries in a Project Ledger", () => {
    render(<Projects />);
    expect(document.querySelector(".project-ledger")).toBeInTheDocument();
    expect(document.querySelectorAll(".project-ledger-entry")).toHaveLength(4);
    expect(document.querySelectorAll(".project")).toHaveLength(0);
    expect(document.querySelectorAll(".project-ledger-entry .todo")).toHaveLength(0);
    expect(screen.getAllByText("Tabime — 悩みから旅先を見つけるAI")).toHaveLength(2);
    expect(screen.getAllByText("長期インターン — 株式会社スパイクスタジオ")).toHaveLength(2);
    expect(screen.getAllByText("福島復興知プロジェクト")).toHaveLength(2);
    expect(screen.getByText(/県内2校で生成AIの講義とワークショップ/)).toBeInTheDocument();
    expect(document.querySelectorAll(".project-ledger-entry .meta")).toHaveLength(0);
    expect(document.querySelectorAll(".project-ledger-entry .tags")).toHaveLength(0);
    expect(screen.queryByText("判断")).not.toBeInTheDocument();
    expect(screen.queryByText("現在地")).not.toBeInTheDocument();
  });

  it("shows a thumbnail on every entry, falling back to a placeholder label", () => {
    render(<Projects />);

    const projectArticles = Array.from(document.querySelectorAll(".project-ledger-entry"));
    projectArticles.forEach((project) => {
      const head = project.querySelector(".project-ledger-head");
      expect(head?.querySelector(".project-thumb")).toBeInTheDocument();
      expect(head?.querySelector("h3")).toBeInTheDocument();
    });
    expect(screen.getByRole("img", { name: "Tabime — 悩みから旅先を見つけるAIの画面" })).toHaveAttribute(
      "src",
      "/images/project-tabime.png",
    );
    // 写真の無いインターンは文字サムネで埋め、「素材待ち」を公開しない
    expect(document.querySelectorAll(".project-thumb .thumb-text")).toHaveLength(1);
    expect(document.querySelector(".project-ledger")).not.toHaveTextContent("素材待ち");
  });

  it("draws the internship thumbnail from its own responsibility headings", () => {
    render(<Projects />);
    const thumb = document.querySelector("#internship .project-thumb .thumb-text");
    expect(thumb).toHaveAttribute("aria-hidden", "true");
    expect(thumb).toHaveTextContent("INTERN");
    expect(thumb).toHaveTextContent("AIエージェントのR&D");
    expect(thumb).toHaveTextContent("Webサービス開発");
  });

  it("shows the Fukushima Innovation Coast logo whole on a light plate", () => {
    render(<Projects />);
    const logo = screen.getByRole("img", { name: "福島復興知プロジェクトの画面" });
    expect(logo).toHaveAttribute("src", "/images/project-fukushima-logo.svg");
    expect(logo.closest(".project-thumb")).toHaveClass("thumb--contain");
  });

  it("keeps every project equal while retaining its link and numbered anchors", () => {
    render(<Projects />);

    const projectArticles = Array.from(document.querySelectorAll(".project-ledger-entry"));
    expect(document.querySelector(".project--featured")).not.toBeInTheDocument();
    expect(projectArticles.map((project) => project.getAttribute("data-project-index"))).toEqual([
      "01",
      "02",
      "03",
      "04",
    ]);
    expect(screen.getByRole("link", { name: "Tabimeを体験する" })).toHaveAttribute(
      "href",
      "https://tabime.pages.dev",
    );
    projectArticles.forEach((project) =>
      expect(project.querySelector(".project-ledger-id")).toHaveAttribute("aria-hidden", "true"),
    );
  });

  it("shows the two internship responsibilities inside one project", () => {
    render(<Projects />);

    const internship = screen.getByRole("article", {
      name: "長期インターン — 株式会社スパイクスタジオ",
    });
    expect(internship.querySelectorAll(".project-ledger-row")).toHaveLength(2);
    expect(internship.querySelectorAll(".project-ledger-row li")).toHaveLength(5);
    expect(internship).toHaveTextContent("2025年7月から現在まで");
    expect(internship).toHaveTextContent("AIエージェントのR&D");
    expect(internship).toHaveTextContent("Webサービス開発");
    expect(internship).toHaveTextContent("技術検証");
    expect(internship).toHaveTextContent("精度評価");
    expect(internship).toHaveTextContent("PostgreSQL");
  });

  it("links the Fukushima project to its official page", () => {
    render(<Projects />);

    expect(screen.getByRole("link", { name: "福島復興知事業の詳細を見る" })).toHaveAttribute(
      "href",
      "https://www.fipo.or.jp/education/43276",
    );
  });

  it("gives every project a slug anchor that its index links to", () => {
    render(<Projects />);

    const projectArticles = Array.from(document.querySelectorAll(".project-ledger-entry"));
    expect(projectArticles.map((project) => project.id)).toEqual(["tabime", "fukushima", "ogiri-dice", "internship"]);
    expect(
      Array.from(document.querySelectorAll(".project-ledger-index a")).map((a) => a.getAttribute("href")),
    ).toEqual(["#tabime", "#fukushima", "#ogiri-dice", "#internship"]);
  });
});

describe("Beyond", () => {
  it("is chapter 02 on the Works page and anchors each essay by slug", () => {
    const { container } = render(<Beyond />);
    expect(container.querySelector(".sec-num")).toHaveTextContent("02");
    expect(Array.from(document.querySelectorAll(".essay")).map((essay) => essay.id)).toEqual([
      "travel",
      "radio",
      "comedy",
    ]);
  });

  it("presents the Works sub-section as three concise entries", () => {
    render(<Beyond />);
    expect(screen.getByText("Works")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "コードの外側" })).toBeInTheDocument();
    expect(document.querySelectorAll(".essay")).toHaveLength(3);
    expect(document.querySelectorAll(".beyond")).toHaveLength(0);
    expect(screen.getByRole("img", { name: "海外一人旅 — 2ヶ月・8ヶ国の写真" })).toHaveAttribute(
      "src",
      "/images/beyond-travel.jpg",
    );
    expect(screen.getByRole("img", { name: "ラジオ番組運営 — レディオ湘南の写真" })).toHaveAttribute(
      "src",
      "/images/beyond-radio.jpg",
    );
    expect(screen.getByRole("img", { name: "漫才ステージの写真" })).toHaveAttribute(
      "src",
      "/images/beyond-comedy.jpg",
    );
  });

  it("states why the solo trip happened and links it to Tabime", () => {
    render(<Beyond />);

    const trip = screen.getByRole("article", {
      name: "海外一人旅 — 2ヶ月・8ヶ国",
    });
    expect(trip).toHaveClass("essay-feature");
    expect(trip.querySelectorAll(".life-detail")).toHaveLength(2);
    expect(trip).toHaveTextContent("旅の背景");
    expect(trip).toHaveTextContent("クリエイターとして視野と表現の幅を広げる");
    expect(trip).toHaveTextContent("旅で得られたこと");
    expect(trip).toHaveTextContent(
      "自分で目的を定め、そこへ向かう道を切り開いていく面白さを知った",
    );
    expect(screen.getByText("個人活動 / 2026.04 – 2026.06")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "この旅から生まれたTabimeを見る" })).toHaveAttribute(
      "href",
      "https://tabime.pages.dev",
    );
  });

  it("keeps the radio and comedy entries brief", () => {
    render(<Beyond />);

    const radio = screen.getByRole("article", {
      name: "ラジオ番組運営 — レディオ湘南",
    });
    const comedy = screen.getByRole("article", { name: "漫才ステージ" });
    expect(radio).toHaveClass("essay--radio");
    expect(comedy).toHaveClass("essay--comedy");
    expect(radio.querySelector(".life-details")).not.toBeInTheDocument();
    expect(comedy.querySelector(".life-details")).not.toBeInTheDocument();
  });
});

describe("Contact", () => {
  it("uses a plain Contact heading like the other top-page sections", () => {
    render(<Contact />);
    expect(screen.getByRole("heading", { level: 2, name: "Contact" })).toBeInTheDocument();
  });

  it("offers email as the only action", () => {
    render(<Contact />);

    const section = document.getElementById("contact");
    expect(section).not.toBeNull();

    const links = within(section!).getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(within(section!).getByRole("link", { name: /Email/ })).toHaveAttribute(
      "href",
      `mailto:${contact.email}`,
    );
  });
});
