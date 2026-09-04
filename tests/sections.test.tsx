import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Experience from "@/app/components/Experience";
import Projects from "@/app/components/Projects";
import Beyond from "@/app/components/Beyond";
import { timeline } from "@/app/content";
import Contact from "@/app/components/Contact";
import { contact } from "@/app/content";

describe("Experience", () => {
  it("is chapter 02 after moving ahead of Projects", () => {
    const { container } = render(<Experience />);
    expect(container.querySelector(".sec-num")).toHaveTextContent("02");
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
  it("is chapter 04 after moving behind Skills", () => {
    const { container } = render(<Projects />);
    expect(container.querySelector(".sec-num")).toHaveTextContent("04");
  });

  it("renders three equal entries in a Project Ledger", () => {
    render(<Projects />);
    expect(document.querySelector(".project-ledger")).toBeInTheDocument();
    expect(document.querySelectorAll(".project-ledger-entry")).toHaveLength(3);
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

  it("keeps every project equal while retaining its link and numbered anchors", () => {
    render(<Projects />);

    const projectArticles = Array.from(document.querySelectorAll(".project-ledger-entry"));
    expect(document.querySelector(".project--featured")).not.toBeInTheDocument();
    expect(projectArticles.map((project) => project.getAttribute("data-project-index"))).toEqual([
      "01",
      "02",
      "03",
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

  it("gives every project an anchor the About index can link to", () => {
    render(<Projects />);

    const projectArticles = Array.from(document.querySelectorAll(".project-ledger-entry"));
    expect(projectArticles.map((project) => project.id)).toEqual([
      "project-0",
      "project-1",
      "project-2",
    ]);
  });
});

describe("Beyond", () => {
  it("presents Projects Beyond My Work as three concise entries", () => {
    render(<Beyond />);
    expect(screen.getByText("Projects Beyond My Work")).toBeInTheDocument();
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
