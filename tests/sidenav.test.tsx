import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SideNav from "@/app/components/SideNav";
import { MockIntersectionObserver } from "@/vitest.setup";

/**
 * ドロワーは「狭い幅 かつ ホバーできない端末」でだけ動く。
 * jsdom は matchMedia を持たないので、そのクエリだけ true を返すよう差し替える。
 */
function useDrawerViewport(isDrawer: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: isDrawer && query.includes("hover: none"),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

const expectedHrefs = [
  "#hero",
  "#about",
  "#skills",
  "#experience",
  "#projects",
  "#beyond",
  "#contact",
];

const expectedLabels = [
  "Top",
  "About",
  "Skills",
  "Experience",
  "Projects",
  "Life & Creative Practice",
  "Contact",
];

const expectedNums = ["00", "01", "02", "03", "04", "05", "06"];

function renderSideNavWithSections() {
  render(
    <>
      {expectedHrefs.map((href) => (
        <section key={href} id={href.slice(1)} />
      ))}
      <SideNav />
    </>,
  );
}

async function activeObserver() {
  await waitFor(() => expect(MockIntersectionObserver.instances).toHaveLength(1));
  return MockIntersectionObserver.instances[0];
}

function sectionEl(id: string) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`section #${id} not rendered`);
  return el;
}

describe("SideNav", () => {
  it("renders 7 section links with the correct hrefs", () => {
    render(<SideNav />);

    const links = screen.getAllByRole("link");

    expect(links).toHaveLength(7);
    expect(links.map((link) => link.getAttribute("href"))).toEqual(expectedHrefs);
  });

  it("renders a labelled navigation landmark", () => {
    render(<SideNav />);

    expect(
      screen.getByRole("navigation", { name: "セクションナビゲーション" }),
    ).toBeInTheDocument();
  });

  it("shows a section number and a readable label on every row", () => {
    render(<SideNav />);

    const nums = Array.from(document.querySelectorAll(".side-nav-num"));
    expect(nums.map((num) => num.textContent)).toEqual(expectedNums);
    nums.forEach((num) => expect(num).toHaveAttribute("aria-hidden", "true"));

    const labels = Array.from(document.querySelectorAll(".side-nav-label"));
    expect(labels.map((label) => label.textContent)).toEqual(expectedLabels);
  });

  it("has no current section before any intersection is reported", () => {
    render(<SideNav />);

    expect(document.querySelectorAll("[aria-current]")).toHaveLength(0);
  });

  it("marks the intersecting section as current", async () => {
    renderSideNavWithSections();
    const observer = await activeObserver();

    act(() => observer.triggerFor([sectionEl("projects")], true));

    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(document.querySelectorAll("[aria-current]")).toHaveLength(1);
  });

  it("prefers the topmost section when several are visible at once", async () => {
    renderSideNavWithSections();
    const observer = await activeObserver();

    act(() => observer.triggerFor([sectionEl("about"), sectionEl("skills")], true));

    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(screen.getByRole("link", { name: "Skills" })).not.toHaveAttribute("aria-current");
  });

  it("moves the current marker back when an earlier section returns to view", async () => {
    renderSideNavWithSections();
    const observer = await activeObserver();

    act(() => observer.triggerFor([sectionEl("projects")], true));
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "aria-current",
      "true",
    );

    act(() => observer.triggerFor([sectionEl("projects")], false));
    act(() => observer.triggerFor([sectionEl("skills")], true));

    expect(screen.getByRole("link", { name: "Skills" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(screen.getByRole("link", { name: "Projects" })).not.toHaveAttribute("aria-current");
  });

  it("keeps the last current section while nothing is intersecting", async () => {
    renderSideNavWithSections();
    const observer = await activeObserver();

    act(() => observer.triggerFor([sectionEl("beyond")], true));
    act(() => observer.triggerFor([sectionEl("beyond")], false));

    expect(screen.getByRole("link", { name: "Life & Creative Practice" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });
});

describe("SideNav drawer (narrow + touch)", () => {
  function openDrawer() {
    const toggle = screen.getByRole("button", { name: "セクションメニューを開く" });
    fireEvent.click(toggle);
    return toggle;
  }

  it("renders a collapsed toggle wired to the nav panel", () => {
    useDrawerViewport(true);
    render(<SideNav />);

    const toggle = screen.getByRole("button", { name: "セクションメニューを開く" });
    const panel = screen.getByRole("navigation", { name: "セクションナビゲーション" });

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", panel.id);
    expect(panel).not.toHaveAttribute("data-open");
  });

  it("opens the panel and moves focus into it", () => {
    useDrawerViewport(true);
    render(<SideNav />);

    openDrawer();

    const panel = screen.getByRole("navigation", { name: "セクションナビゲーション" });
    expect(panel).toHaveAttribute("data-open", "true");
    expect(screen.getByRole("button", { name: "セクションメニューを閉じる" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(document.activeElement).toBe(screen.getByRole("link", { name: "Top" }));
  });

  it("closes on Escape and returns focus to the toggle", () => {
    useDrawerViewport(true);
    render(<SideNav />);

    const toggle = openDrawer();
    fireEvent.keyDown(document, { key: "Escape" });

    expect(
      screen.getByRole("navigation", { name: "セクションナビゲーション" }),
    ).not.toHaveAttribute("data-open");
    expect(document.activeElement).toBe(toggle);
  });

  it("keeps Tab inside the open panel", () => {
    useDrawerViewport(true);
    render(<SideNav />);

    openDrawer();

    const links = screen.getAllByRole("link");
    const first = links[0];
    const last = links[links.length - 1];

    last.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it("closes after choosing a section", () => {
    useDrawerViewport(true);
    render(<SideNav />);

    openDrawer();
    fireEvent.click(screen.getByRole("link", { name: "Projects" }));

    expect(
      screen.getByRole("navigation", { name: "セクションナビゲーション" }),
    ).not.toHaveAttribute("data-open");
  });

  it("closes when the backdrop is tapped", () => {
    useDrawerViewport(true);
    const { container } = render(<SideNav />);

    openDrawer();
    const backdrop = container.querySelector(".side-nav-backdrop");
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop!);

    expect(
      screen.getByRole("navigation", { name: "セクションナビゲーション" }),
    ).not.toHaveAttribute("data-open");
  });

  it("does not hijack focus or close on click when the rail is showing", () => {
    useDrawerViewport(false);
    render(<SideNav />);

    // レール表示中はトグルがCSSで隠れるが、押されても開閉ロジックは走らせない
    fireEvent.click(screen.getByRole("button", { name: "セクションメニューを開く" }));

    expect(
      screen.getByRole("navigation", { name: "セクションナビゲーション" }),
    ).not.toHaveAttribute("data-open");
    expect(document.activeElement).toBe(document.body);
  });
});
