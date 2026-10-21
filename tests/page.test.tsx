import { render, screen, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Home from "@/app/page";
import { beyond, contact, profile, projects, timeline } from "@/app/content";

describe("Home page", () => {
  it("renders the summary sections in order with a footer and no bottom chapter bar", () => {
    const { container } = render(<Home />);
    expect(Array.from(container.querySelectorAll(".wrap > section")).map((section) => section.id)).toEqual([
      "profile",
      "experience",
      "projects",
      "beyond",
      "contact",
    ]);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("笑顔");
    expect(container.querySelector(".chapter-nav")).not.toBeInTheDocument();
    // 星座の背景はトップだけ
    expect(container.querySelector("canvas.constellation")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("introduces the profile briefly and links to the full About page", () => {
    render(<Home />);
    const section = document.getElementById("profile")!;
    expect(within(section).getByText(profile.name)).toBeInTheDocument();
    // 一言紹介と肩書きはヒーローに出るので、ここでは繰り返さない
    expect(within(section).queryByText(profile.intro)).not.toBeInTheDocument();
    expect(within(section).queryByText(profile.roleLine)).not.toBeInTheDocument();
    expect(within(section).getByRole("link", { name: /自己紹介を読む/ })).toHaveAttribute("href", "/about");
  });

  it("adds a short note on hobbies and favourites just above the About link", () => {
    render(<Home />);
    const section = document.getElementById("profile")!;
    const note = section.querySelector(".top-intro");
    expect(note).toHaveTextContent("ラジオとお笑いが趣味で");
    expect(note).toHaveTextContent("HxHと涼宮ハルヒシリーズ、三島由紀夫が好きです");
    expect(note?.nextElementSibling).toHaveClass("more-link");
  });

  it("puts the same top bar as the sub pages above the hero", () => {
    const { container } = render(<Home />);
    const nav = screen.getByRole("navigation", { name: "サイトナビゲーション" });
    expect(nav).toHaveClass("site-nav--bar");
    const children = Array.from(container.querySelector("main")!.children);
    expect(children.indexOf(nav)).toBeLessThan(children.indexOf(container.querySelector(".hero")!));

    const desktop = Array.from(nav.querySelectorAll(":scope > a, .site-nav-links a"));
    expect(desktop.map((link) => link.getAttribute("href"))).toEqual([
      "/",
      "/about",
      "/works",
      "#contact",
    ]);
    const mobile = Array.from(nav.querySelectorAll(".site-nav-menu a"));
    expect(mobile.map((link) => link.getAttribute("href"))).toEqual(
      desktop.slice(1).map((link) => link.getAttribute("href")),
    );
    expect(within(nav).getByLabelText("メニューを開く").tagName).toBe("SUMMARY");
  });

  it("offers GitHub and email buttons on the right rail, only for socials with a URL", () => {
    render(<Home />);
    const rail = screen.getByRole("list", { name: "SNSとメール" });
    expect(
      within(rail)
        .getAllByRole("link")
        .map((link) => link.getAttribute("href")),
    ).toEqual(["https://github.com/hinata-111", `mailto:${contact.email}`]);
    expect(within(rail).getByRole("link", { name: "GitHubを開く" })).toHaveAttribute("target", "_blank");
    expect(within(rail).getByRole("link", { name: "メールを送る" })).toBeInTheDocument();
  });

  it("lists the timeline as one-line date and title rows", () => {
    render(<Home />);
    const rows = Array.from(document.querySelectorAll("#experience .top-timeline li"));
    expect(rows).toHaveLength(timeline.length);
    expect(rows[0]).toHaveTextContent(`${timeline[0].when}${timeline[0].title}`);
    expect(document.querySelector("#experience .top-timeline")).not.toHaveTextContent(timeline[1].desc);
  });

  it("links every work card to its anchor on /works", () => {
    render(<Home />);
    const hrefs = Array.from(document.querySelectorAll(".work-grid a")).map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual([...projects, ...beyond].map((work) => `/works#${work.slug}`));
    expect(screen.getByRole("link", { name: /すべての活動を見る/ })).toHaveAttribute("href", "/works");
    expect(document.querySelector('.work-grid a[href="/works#internship"] .thumb-text')).toHaveTextContent(
      "INTERN",
    );
    expect(document.querySelector("#projects .work-grid")).not.toHaveTextContent("素材待ち");
    const fukushimaCard = document.querySelector('.work-grid a[href="/works#fukushima"] .work-thumb');
    expect(fukushimaCard).toHaveClass("thumb--contain");
    expect(fukushimaCard?.querySelector("img")).toHaveAttribute("src", "/images/project-fukushima-logo.svg");
  });

  it("logs the console easter egg on mount", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    render(<Home />);
    const logged = spy.mock.calls.map((c) => String(c[0])).join("\n");
    expect(logged).toContain("SPOTLIGHT ON");
    spy.mockRestore();
  });
});
