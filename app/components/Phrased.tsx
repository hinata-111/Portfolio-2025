import { Fragment } from "react";
import { loadDefaultJapaneseParser } from "budoux";

// 日本語は語の区切りが無いため、ブラウザは既定でどの文字間でも折り返す。
// 「涼宮ハルヒシ / リーズ」のような語中改行を防ぐ CSS の word-break: auto-phrase は
// Chromium 専用なので、同じ文節解析をビルド時に行い、境界を <wbr>(そこで改行して
// よい位置)として埋め込む。<wbr> は <br> と違い改行を強制しないため、幅にも
// 環境にも依存しない。折返しを <wbr> の位置だけに限るのは CSS 側(.phrased)。
//
// このコンポーネントはサーバーコンポーネントなので、budoux はビルド時にのみ動き、
// ブラウザへは1バイトも送られない。
const parser = loadDefaultJapaneseParser();

export default function Phrased({ text }: { text: string }) {
  if (!text) return null;

  return (
    <span className="phrased">
      {parser.parse(text).map((chunk, i) => (
        <Fragment key={`${i}-${chunk}`}>
          {i > 0 && <wbr />}
          {chunk}
        </Fragment>
      ))}
    </span>
  );
}
