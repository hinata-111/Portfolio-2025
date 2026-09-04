import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const css = read("app/globals.css");
const rule = (selector: string) => {
  const found = css.match(new RegExp(`${selector}\\s*\\{([^}]*)\\}`, "s"));
  if (!found) throw new Error(`${selector} is not defined`);
  return found[1];
};

describe("日本語の折返し", () => {
  it("折返しの基本設定を body に集約している", () => {
    // 個別要素に散らすと新しいテキストブロックが漏れる。継承する
    // プロパティなので body 1箇所で全ページに効かせる。
    const body = rule("body");
    expect(body).toMatch(/word-break:\s*auto-phrase/);
    expect(body).toMatch(/line-break:\s*strict/);
    expect(body).toMatch(/overflow-wrap:\s*break-word/);
  });

  it("auto-phrase が効く前提の lang を持っている", () => {
    // Chromium の auto-phrase は lang="ja" が無いと文節解析を行わない
    expect(read("app/layout.tsx")).toMatch(/<html lang="ja">/);
  });

  it("大きな見出しは文節単位の折返しから除外する", () => {
    // 1行の文字数が少ないと文節の区切りが粗すぎて「心を」だけの行が出る
    expect(rule("\\.hero h1")).toMatch(/word-break:\s*normal/);
  });

  it("Hero見出しは<br>ではなくブロックで行を分ける", () => {
    // h1 に <br> があると Chromium は text-wrap: balance を諦め、狭い幅で
    // 「す。」だけの行が残る。行ごとにブロックにすれば balance が働く。
    const hero = read("app/components/Hero.tsx");
    expect(hero).not.toMatch(/<br/);
    expect(hero.match(/hero-line/g)?.length).toBe(2);
    expect(rule("\\.hero h1 \\.hero-line")).toMatch(/display:\s*block/);
    // .hl は行ブロックごとに分かれたので、ずらしの基準も行側にある必要がある
    expect(css).toMatch(/\.hero \.hero-line:nth-of-type\(1\) \.hl::after/);
    expect(css).toMatch(/\.hero \.hero-line:nth-of-type\(2\) \.hl::after/);
  });

  it("実際に使える幅でカラム数が決まるようにする", () => {
    // 2カラム固定だと featured カードの本文内でさらに half になり、
    // 1カラム約90px(1行7文字)まで潰れていた
    expect(rule("\\.life-details")).toMatch(/repeat\(auto-fit,\s*minmax\(/);
    expect(css).not.toMatch(/\.life-details\s*\{[^}]*grid-template-columns:\s*1fr\s*;/s);
  });

  it("最小幅帯では見出しを1段落として語中改行を避ける", () => {
    // 320px では 42px/19px のままだと1行の文字数が足りず、
    // 「にし、」や「株式会社スパイクスタジ / オ」のように割れる
    const narrow = css.match(/@media \(max-width: 360px\) \{\s*:root \{([^}]*)\}/s);
    expect(narrow).not.toBeNull();
    expect(narrow![1]).toMatch(/--fs-hero:/);
    expect(narrow![1]).toMatch(/--fs-title:/);
  });

  it("iOS でも効く指定で強調句と短文を保護する", () => {
    // text-wrap: pretty は iOS(〜18)で未対応。keep-all と balance は対応済み。
    expect(rule("\\.motto \\.vow b")).toMatch(/word-break:\s*keep-all/);
    expect(rule("\\.motto \\.vow")).toMatch(/text-wrap:\s*balance/);
  });

  it("<wbr> の位置でだけ折り返す指定を持つ", () => {
    // Phrased が埋めた <wbr> は、keep-all が無いと意味を持たない(日本語は
    // どの文字間でも折り返せるため)。anywhere は1文節が入りきらない時の保険。
    const phrased = rule("\\.phrased");
    expect(phrased).toMatch(/word-break:\s*keep-all/);
    expect(phrased).toMatch(/overflow-wrap:\s*anywhere/);
  });

  it("budoux をクライアントに送らない", () => {
    // Phrased はサーバーコンポーネントなので "use client" を持たない。
    // クライアントコンポーネントから import すると budoux がバンドルされる。
    const phrased = read("app/components/Phrased.tsx");
    expect(phrased).not.toMatch(/["']use client["']/);
    expect(read("app/connect/ProfileDetails.tsx")).not.toMatch(/^import .*(Phrased|budoux)/m);
  });

  it("引用と本文に行送りの調整を入れている", () => {
    expect(rule("\\.motto blockquote")).toMatch(/text-wrap:\s*balance/);
    expect(rule("p\\.lede")).toMatch(/text-wrap:\s*pretty/);
    expect(read("app/connect/connect.module.css")).toMatch(
      /\.introduction\s*\{[^}]*text-wrap:\s*pretty/s,
    );
  });

  it("文字列の内容から改行位置を決め打ちしない", () => {
    // 「最初の読点で <br> を挿入する」実装は、実際の表示幅を見ていないため
    // 端末やフォント次第で節の途中に二重の折返しが入りズレて見えていた。
    // 改行位置の判断は CSS(ブラウザ)に委ねる。
    const about = read("app/components/About.tsx");
    const profileDetails = read("app/connect/ProfileDetails.tsx");
    expect(about).not.toMatch(/split\(["'、。]/);
    expect(about).not.toMatch(/<br/);
    expect(profileDetails).not.toMatch(/indexOf\(["'、。]/);
    expect(profileDetails).not.toMatch(/<br/);
  });
});
