import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const globalCss = read("app/globals.css");
const connectCss = read("app/connect/connect.module.css");

describe("mobile readability", () => {
  it("keeps section headings and profile copy left aligned on small screens", () => {
    const mobile = globalCss.slice(globalCss.indexOf("@media (max-width: 720px)"));

    expect(mobile).toMatch(/\.sec-head,\s*h2\s*\{[^}]*text-align:\s*left[^}]*justify-content:\s*flex-start/);
    expect(mobile).toMatch(/\.about-identity,\s*\.about-socials\s*\{[^}]*text-align:\s*left[^}]*justify-content:\s*flex-start/);
  });

  it("keeps the mobile timeline in three readable columns without horizontal overflow", () => {
    expect(globalCss).toMatch(
      /@media\s*\(max-width:\s*620px\)[\s\S]*?\.timeline li\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*72px\)\s+20px\s+minmax\(0,\s*1fr\)/,
    );
  });

  it("stacks the Project Ledger index above its entries on small screens", () => {
    expect(globalCss).toMatch(
      /@media\s*\(max-width:\s*720px\)[\s\S]*?\.project-ledger\s*\{[^}]*grid-template-columns:\s*1fr/,
    );
    expect(globalCss).toMatch(
      /@media\s*\(max-width:\s*720px\)[\s\S]*?\.project-ledger-index\s*\{[^}]*grid-template-columns:\s*1fr/,
    );
  });

  it("keeps the subtle details label inside a 44px touch target", () => {
    expect(connectCss).toMatch(/\.detailsButton\s*\{[^}]*min-width:\s*2\.75rem/);
    expect(connectCss).toMatch(/\.detailsButton\s*\{[^}]*min-height:\s*2\.75rem/);
  });
});
