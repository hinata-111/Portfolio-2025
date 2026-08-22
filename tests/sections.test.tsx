import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Experience from "@/app/components/Experience";
import Projects from "@/app/components/Projects";
import Beyond from "@/app/components/Beyond";
import { timeline } from "@/app/content";
import Contact from "@/app/components/Contact";
import { contact } from "@/app/content";

describe("Experience", () => {
  it("renders 6 timeline items", () => {
    render(<Experience />);
    expect(document.querySelectorAll(".timeline li")).toHaveLength(6);
  });

  it("renders a decorative constellation map matching the timeline length", () => {
    render(<Experience />);
    const map = document.querySelector(".constellation-map");
    expect(map).toHaveAttribute("aria-hidden", "true");
    const stars = document.querySelectorAll(".const-star");
    expect(stars).toHaveLength(6);
    expect(document.querySelectorAll(".constellation-map svg line")).toHaveLength(5);
  });

  it("gives each constellation star a hover tooltip with the matching timeline entry", () => {
    render(<Experience />);
    const stars = document.querySelectorAll(".const-star");
    stars.forEach((star, i) => {
      const tip = star.querySelector(".tip");
      expect(tip).not.toBeNull();
      expect(tip?.textContent).toContain(timeline[i].title);
      expect(tip?.textContent).toContain(timeline[i].when);
    });
  });
});

describe("Projects", () => {
  it("renders three concise project doorways", () => {
    render(<Projects />);
    expect(document.querySelectorAll(".project")).toHaveLength(3);
    expect(document.querySelector(".project .todo")).not.toBeInTheDocument();
    expect(screen.getByText("Tabime — 悩みから旅先を見つけるAI")).toBeInTheDocument();
    expect(screen.getByText("長期インターン — AI R&D / Web開発")).toBeInTheDocument();
    expect(screen.getByText("福島復興知プロジェクト")).toBeInTheDocument();
    expect(screen.getByText(/県内2校・計8回/)).toBeInTheDocument();
    expect(document.querySelectorAll(".project .meta")).toHaveLength(0);
    expect(document.querySelectorAll(".project .tags")).toHaveLength(0);
    expect(screen.queryByText("判断")).not.toBeInTheDocument();
    expect(screen.queryByText("現在地")).not.toBeInTheDocument();
  });

  it("keeps Tabime prominent and links to the product", () => {
    render(<Projects />);

    const projectArticles = Array.from(document.querySelectorAll(".project"));
    expect(projectArticles[0]).toHaveClass("project--featured");
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
      expect(project.querySelector(".project-kicker")).toHaveAttribute("aria-hidden", "true"),
    );
  });

  it("shows the two internship responsibilities inside one project", () => {
    render(<Projects />);

    const internship = screen.getByRole("article", {
      name: "長期インターン — AI R&D / Web開発",
    });
    expect(internship.querySelectorAll(".project-detail")).toHaveLength(2);
    expect(internship).toHaveTextContent("履歴書解析AIエージェント");
    expect(internship).toHaveTextContent("Webアプリケーション");
    expect(internship).toHaveTextContent("精度評価・改善");
    expect(internship).toHaveTextContent("PostgreSQL");
  });

  it("gives every project an anchor the About index can link to", () => {
    render(<Projects />);

    const projectArticles = Array.from(document.querySelectorAll(".project"));
    expect(projectArticles.map((project) => project.id)).toEqual([
      "project-0",
      "project-1",
      "project-2",
    ]);
  });
});

describe("Beyond", () => {
  it("presents Life & Creative Practice as three concise entries", () => {
    render(<Beyond />);
    expect(screen.getByText("Life & Creative Practice")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "プロジェクトの外で、続けてきたこと。" })).toBeInTheDocument();
    expect(document.querySelectorAll(".beyond")).toHaveLength(3);
    expect(screen.getByText("素材待ち:旅の写真")).toBeInTheDocument();
    expect(screen.getByText("学生ラジオ番組 — レディオ湘南")).toBeInTheDocument();
  });

  it("states why the solo trip happened and links it to Tabime", () => {
    render(<Beyond />);

    const trip = screen.getByRole("article", {
      name: "海外一人旅 — 2ヶ月・8ヶ国",
    });
    expect(trip).toHaveClass("beyond--featured");
    expect(trip.querySelectorAll(".life-detail")).toHaveLength(2);
    expect(trip).toHaveTextContent("旅の理由");
    expect(trip).toHaveTextContent("世界各地の街づくり");
    expect(trip).toHaveTextContent("陸路で国境を越え");
    expect(screen.getByText("個人活動 / 2026.04 – 2026.06")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "この旅から生まれたTabimeを見る" })).toHaveAttribute(
      "href",
      "https://tabime.pages.dev",
    );
  });

  it("keeps the radio and comedy entries brief", () => {
    render(<Beyond />);

    const radio = screen.getByRole("article", {
      name: "学生ラジオ番組 — レディオ湘南",
    });
    const comedy = screen.getByRole("article", { name: "漫才ステージ" });
    expect(radio.querySelector(".life-details")).not.toBeInTheDocument();
    expect(comedy.querySelector(".life-details")).not.toBeInTheDocument();
  });
});

describe("Contact", () => {
  it("makes the email a working mailto link", () => {
    render(<Contact />);

    expect(screen.getByRole("link", { name: /Email/ })).toHaveAttribute(
      "href",
      `mailto:${contact.email}`,
    );
    expect(screen.getByRole("link", { name: /GitHub/ })).toHaveAttribute("href", contact.github);
  });
});
