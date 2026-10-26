import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Experience from "@/app/components/Experience";
import Projects from "@/app/components/Projects";
import Beyond from "@/app/components/Beyond";
import Contact from "@/app/components/Contact";
import { beyond, contact, projects, timeline } from "@/app/content";

describe("Experience", () => {
  it("renders one dotted row per timeline item", () => {
    render(<Experience />);
    expect(document.querySelectorAll(".timeline li")).toHaveLength(timeline.length);
    expect(document.querySelectorAll(".timeline .dot")).toHaveLength(timeline.length);
  });

  it("omits the description line when an item has no desc", () => {
    render(<Experience />);
    expect(document.querySelectorAll(".timeline .what span")).toHaveLength(
      timeline.filter((t) => t.desc).length,
    );
  });
});

describe("Projects", () => {
  it("renders one ledger entry per project, anchored by slug and linked from the index", () => {
    render(<Projects />);
    const entries = Array.from(document.querySelectorAll(".project-ledger-entry"));
    const slugs = projects.map((project) => `${project.slug}`);
    expect(entries.map((entry) => entry.id)).toEqual(slugs);
    expect(
      Array.from(document.querySelectorAll(".project-ledger-index a")).map((a) => a.getAttribute("href")),
    ).toEqual(slugs.map((slug) => `#${slug}`));
    projects.forEach((project) =>
      expect(screen.getByRole("article", { name: project.title })).toHaveTextContent(project.summary),
    );
    entries.forEach((entry) =>
      expect(entry.querySelector(".project-ledger-id")).toHaveAttribute("aria-hidden", "true"),
    );
  });

  it("fills every thumbnail with an image or a decorative text thumb, never the placeholder label", () => {
    render(<Projects />);
    projects.forEach((project) => {
      const thumb = document.querySelector(`#${project.slug} .project-thumb`);
      if (project.imageSrc) {
        expect(thumb?.querySelector("img")).toHaveAttribute("src", project.imageSrc);
      } else {
        expect(thumb?.querySelector(".thumb-text")).toHaveAttribute("aria-hidden", "true");
      }
      expect(thumb?.classList.contains("thumb--contain")).toBe(project.imageFit === "contain");
    });
    expect(document.querySelector(".project-ledger")).not.toHaveTextContent("素材待ち");
  });

  it("lists every responsibility of a project that has details", () => {
    render(<Projects />);
    projects
      .filter((project) => project.details)
      .forEach((project) => {
        const article = screen.getByRole("article", { name: project.title });
        const points = project.details!.flatMap((detail) => detail.points);
        expect(article.querySelectorAll(".project-ledger-row")).toHaveLength(project.details!.length);
        expect(Array.from(article.querySelectorAll(".project-ledger-row li")).map((li) => li.textContent)).toEqual(
          points,
        );
      });
  });

  it("opens outbound links in a new tab", () => {
    render(<Projects />);
    projects
      .filter((project) => project.href)
      .forEach((project) => {
        const link = screen.getByRole("link", { name: project.linkLabel });
        expect(link).toHaveAttribute("href", project.href);
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noreferrer");
      });
  });
});

describe("Beyond", () => {
  it("anchors each essay by slug and shows its photo", () => {
    render(<Beyond />);
    expect(Array.from(document.querySelectorAll(".essay")).map((essay) => essay.id)).toEqual(
      beyond.map((item) => item.slug),
    );
    beyond
      .filter((item) => item.imageSrc)
      .forEach((item) =>
        expect(screen.getByRole("img", { name: `${item.title}の写真` })).toHaveAttribute("src", item.imageSrc),
      );
  });

  it("renders the detail block only for entries that have details", () => {
    render(<Beyond />);
    beyond.forEach((item) => {
      const article = screen.getByRole("article", { name: item.title });
      expect(article.querySelectorAll(".life-detail")).toHaveLength(item.details?.length ?? 0);
      expect(article.classList.contains("essay-feature")).toBe(Boolean(item.featured));
    });
  });
});

describe("Contact", () => {
  it("offers email as the only action", () => {
    render(<Contact />);
    const section = document.getElementById("contact")!;
    expect(within(section).getByRole("heading", { level: 2, name: "Contact" })).toBeInTheDocument();
    const links = within(section).getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", `mailto:${contact.email}`);
  });
});
