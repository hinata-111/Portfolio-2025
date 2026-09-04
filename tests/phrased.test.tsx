import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Phrased from "@/app/components/Phrased";

// 日本語には語の区切りが無いため、ブラウザは既定でどの文字間でも折り返す。
// 「涼宮ハルヒシ / リーズ」のような語中改行を防ぐ word-break: auto-phrase は
// Chromium 専用なので、文節境界を <wbr>(改行してよい位置)として自分で埋め込む。
describe("Phrased", () => {
  const read = (el: HTMLElement) => el.textContent;

  it("元の文字列をそのまま表示する", () => {
    render(
      <p data-testid="t">
        <Phrased text="趣味について：ラジオをよく聞きます（10番組くらい）、HxHと涼宮ハルヒシリーズ、三島由紀夫が好きです" />
      </p>,
    );
    expect(read(screen.getByTestId("t"))).toBe(
      "趣味について：ラジオをよく聞きます（10番組くらい）、HxHと涼宮ハルヒシリーズ、三島由紀夫が好きです",
    );
  });

  it("文節の境界に <wbr> を入れる", () => {
    render(
      <p data-testid="t">
        <Phrased text="之を知る者は之を好む者に如かず" />
      </p>,
    );
    expect(screen.getByTestId("t").querySelectorAll("wbr").length).toBeGreaterThan(0);
  });

  it("語の途中では改行を許可しない", () => {
    render(
      <p data-testid="t">
        <Phrased text="HxHと涼宮ハルヒシリーズ、三島由紀夫が好きです" />
      </p>,
    );
    // <wbr> で区切られた各塊。「涼宮ハルヒシリーズ」が割れていないことを確かめる
    const phrased = screen.getByTestId("t").querySelector(".phrased")!;
    const chunks = [...phrased.childNodes]
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent ?? "");
    expect(chunks.some((c) => c.includes("涼宮ハルヒシリーズ"))).toBe(true);
    expect(chunks).not.toContain("リーズ、");
  });

  it("空文字でも落ちない", () => {
    render(
      <p data-testid="t">
        <Phrased text="" />
      </p>,
    );
    expect(read(screen.getByTestId("t"))).toBe("");
  });
});
