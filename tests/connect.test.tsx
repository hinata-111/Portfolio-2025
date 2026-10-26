import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ConnectPage from "@/app/connect/page";
import { connectProfile, profile } from "@/app/content";

describe("Connect page", () => {
  it("presents a compact identity card", () => {
    render(<ConnectPage />);

    expect(screen.getByRole("heading", { level: 1, name: profile.name })).toBeInTheDocument();
    expect(screen.getByText(connectProfile.nameLatin)).toBeInTheDocument();
    const tagline = screen.getByText(connectProfile.tagline);
    const affiliation = screen.getByText(profile.affiliations[0]);
    const roleLine = screen.getByText(profile.roleLine);
    expect(tagline).toBeInTheDocument();
    expect(affiliation).toBeInTheDocument();
    expect(roleLine).toBeInTheDocument();
    expect(affiliation.compareDocumentPosition(tagline) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(tagline.compareDocumentPosition(roleLine) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole("img", { name: `${profile.name}のポートレート` })).toBeInTheDocument();
  });

  it("keeps the requested introduction behind a disclosure", () => {
    render(<ConnectPage />);

    const disclosure = screen.getByRole("button", { name: "詳しく…" });
    expect(disclosure).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText(connectProfile.introduction)).toBeInTheDocument();
    expect(document.querySelectorAll("#connect-introduction br")).toHaveLength(1);

    fireEvent.click(disclosure);
    expect(screen.getByRole("button", { name: "閉じる" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("links every social service it lists", () => {
    render(<ConnectPage />);

    const socialNav = screen.getByRole("navigation", { name: "SNS" });
    expect(within(socialNav).getAllByRole("listitem")).toHaveLength(connectProfile.socials.length);
    connectProfile.socials.forEach((social) =>
      expect(within(socialNav).getByRole("link", { name: `${social.label}を開く` })).toHaveAttribute("href", social.href),
    );
  });

  it("offers a direct mail contact", () => {
    render(<ConnectPage />);

    const mail = screen.getByRole("link", { name: "メールを送る" });
    expect(mail).toHaveAttribute("href", "mailto:" + connectProfile.email);
    expect(mail).toHaveTextContent(connectProfile.email);
  });

  it("offers a clear way back to the full portfolio", () => {
    render(<ConnectPage />);

    expect(screen.getByRole("link", { name: "Portfolioを見る" })).toHaveAttribute("href", "/");
  });
});
