import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ConnectPage from "@/app/connect/page";
import { connectProfile, profile } from "@/app/content";

describe("Connect page", () => {
  it("presents a compact identity card", () => {
    render(<ConnectPage />);

    expect(screen.getByRole("heading", { level: 1, name: profile.name })).toBeInTheDocument();
    expect(screen.getByText(connectProfile.nameLatin)).toBeInTheDocument();
    expect(screen.getByText(profile.affiliations[0])).toBeInTheDocument();
    expect(screen.getByRole("img", { name: `${profile.name}のポートレート` })).toBeInTheDocument();
  });

  it("keeps the requested introduction behind a disclosure", () => {
    render(<ConnectPage />);

    const disclosure = screen.getByRole("button", { name: "詳しく…" });
    expect(disclosure).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText(connectProfile.introduction)).toBeInTheDocument();

    fireEvent.click(disclosure);
    expect(screen.getByRole("button", { name: "閉じる" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("shows the requested social services without creating broken links", () => {
    render(<ConnectPage />);

    const socialNav = screen.getByRole("navigation", { name: "SNS" });
    expect(within(socialNav).getAllByRole("listitem")).toHaveLength(3);
    expect(within(socialNav).getByRole("link", { name: "GitHubを開く" })).toHaveAttribute(
      "href",
      "https://github.com/hinata-111",
    );
    expect(within(socialNav).getByRole("link", { name: "Instagramを開く" })).toHaveAttribute(
      "href",
      "https://www.instagram.com/suzuki_1732/",
    );
    expect(within(socialNav).getByText("X").closest("li")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("offers a clear way back to the full portfolio", () => {
    render(<ConnectPage />);

    expect(screen.getByRole("link", { name: "Portfolioを見る" })).toHaveAttribute("href", "/");
  });
});
