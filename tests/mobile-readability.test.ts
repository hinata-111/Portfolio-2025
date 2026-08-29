import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const globalCss = read("app/globals.css");
const connectCss = read("app/connect/connect.module.css");

describe("mobile readability", () => {
  it("removes the duplicate fixed Contact control from narrow screens", () => {
    expect(globalCss).toMatch(
      /@media\s*\(max-width:\s*480px\)[\s\S]*?\.contact-fab\s*\{[^}]*display:\s*none/,
    );
  });

  it("gives mobile timeline entries balanced inner spacing", () => {
    expect(globalCss).toMatch(
      /@media\s*\(max-width:\s*620px\)[\s\S]*?\.timeline li\s*\{[^}]*padding:\s*18px;/,
    );
  });

  it("removes the card-within-card squeeze from project details", () => {
    expect(globalCss).toMatch(
      /@media\s*\(max-width:\s*560px\)[\s\S]*?\.project-detail\s*\{[^}]*padding:\s*16px 0[^}]*border-radius:\s*0/,
    );
  });

  it("keeps the subtle details label inside a 44px touch target", () => {
    expect(connectCss).toMatch(/\.detailsButton\s*\{[^}]*min-width:\s*2\.75rem/);
    expect(connectCss).toMatch(/\.detailsButton\s*\{[^}]*min-height:\s*2\.75rem/);
  });
});
