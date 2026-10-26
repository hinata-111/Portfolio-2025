@AGENTS.md

# Portfolio-2025

## プロジェクト概要

個人ポートフォリオサイト(トップ `/` + `/about` + `/works` の 3 ページ構成。トップは要約、詳細は下層ページ)。軸は「人を笑顔にし、心を動かすものを生み出す」。
新卒就活に限らず、フリーランス・業務委託等での提示にもそのまま使える汎用的な内容・表記を維持する(特定の時期・立場に紐づく表記は避ける)。
サイト自体が技術力・UI/UX 力の証明。現在フェーズ: 実装計画 9 タスク完了。残作業はデプロイ(ユーザー作業)と素材差し替え。
レイアウトの正は `docs/superpowers/specs/2026-10-22-riochin-layout-design.md`(riochin.dev 型の骨組み・サイズ)と現行実装。配色・宇宙背景は現行実装が正。`docs/design/portfolio-mockup-v7.html` は旧デザインの参考資料。文言は創作・補完しない。

## 技術スタックと制約

- Next.js 16.2.10(App Router, TypeScript)+ **素の CSS**(Tailwind 不使用 — 確定済み決定、変更禁止)
- テスト: Vitest + React Testing Library(`npm test`)。デプロイ先: Vercel
- 全コンテンツは `app/content.ts` に集約。セクション追加=データ 1 要素の追加で完結させる
- クライアント処理は `Reveal` / `CursorLight` / `ConsoleEgg` / `Constellation` に隔離。他はサーバーコンポーネント(`CosmicBackground` は静的な CSS 背景、`SiteNav` は `<details>` で JS なし)
- 背景は全ページ共通の `CosmicBackground`(静的な宇宙グラデーション+星の CSS テクスチャ)。動く星座はトップだけ。配置データは `app/shapes.ts` に決定論的擬似乱数で固定生成し実行時乱数は使わない
- トップ背景の星座(`Constellation`、canvas)は rAF ループ内で `scrollY` を読んで視差を付ける(scroll イベントは登録しない)。星は文字より遅く、大きい星ほど速く流れる。`prefers-reduced-motion` では静止 1 枚、タブ非表示中は停止。初期配置は `app/shapes.ts` の `driftingStars`(シード固定)。マウス操作時は通った跡の星と線が光って消える(`pointer: fine` かつ動き許可時のみ。mousemove は位置記録だけで描画は rAF 内)
- 品質要件: `:focus-visible` 必須 / scroll・mousemove は rAF スロットリング / resize は debounce / `prefers-reduced-motion: reduce` で全アニメ無効化
- 外部ライブラリ追加は実装計画記載分のみ(YAGNI)
- 未確定情報はプレースホルダーのまま(`【氏名】`、`要確認` バッジ等)。勝手に埋めない

## 実装の進め方(計画・仕様)

- 実装計画: `docs/superpowers/plans/2026-07-07-portfolio-site.md`(タスク単位・チェックボックス管理)
- 設計書: `docs/superpowers/specs/2026-07-07-portfolio-design.md`(初版)/ `docs/superpowers/specs/2026-10-22-riochin-layout-design.md`(現行レイアウト)
- サイトナビ(`SiteNav`)はサーバーコンポーネント。スマホのメニュー開閉は `<details>` で行い JS を足さない

## このプロジェクトで使う Skills

カスタムエージェントは未導入。以下の Skills を場面に応じて起動する。

| Skill | 起動場面 |
|---|---|
| `superpowers:subagent-driven-development` | 実装計画のタスク実行(計画書が使用必須と明記。代替: `executing-plans`) |
| `superpowers:test-driven-development` | 各タスクの実装(全タスクがテスト先行構成) |
| `/code-review` | タスク完了毎(計画の品質要件が「コードレビュー対策」を明示) |
| `/verify` + Playwright MCP | 設計書との見た目照合(実ブラウザでスクショ比較) |

典型ワークフロー:
1. **タスク実装**: subagent-driven-development → TDD でタスク実装 → `/code-review` → チェックボックス更新
2. **見た目検証**: 実装後 `/verify` → `npm run dev` → Playwright で 1265px / 390px のスクショを撮り、レイアウト設計書の実測サイズと照合
3. **デザイン変更疑義**: 設計書と差異を見つけたら実装を直す(確定済みの設計書は書き換えず、新しい設計書を追加する)

## Skills との役割分担

- 実行手順は Skills が正。上記以外の創作系スキル(`frontend-design` 等)はデザイン確定済みのため使わない
- Next.js の API 確認は一般知識やスキルでなく `node_modules/next/dist/docs/` を正とする(AGENTS.md 参照)

## 触ってはいけないファイル

- `docs/design/portfolio-mockup-v7.html` — 確定モックアップ。読み取り専用
- `docs/superpowers/specs/` — 確定設計書。実装都合で書き換えない
