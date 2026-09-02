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
