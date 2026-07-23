@AGENTS.md

# Portfolio-2025

## プロジェクト概要

個人ポートフォリオサイト(1ページ構成)。軸は「人を笑顔にし、心を動かすものを生み出す」。
新卒就活に限らず、フリーランス・業務委託等での提示にもそのまま使える汎用的な内容・表記を維持する(特定の時期・立場に紐づく表記は避ける)。
サイト自体が技術力・UI/UX 力の証明。現在フェーズ: 実装計画 9 タスク完了。残作業はデプロイ(ユーザー作業)と素材差し替え。
デザインの正は `docs/design/portfolio-mockup-v7.html` — 文言・色・数値はそこから忠実転記し、創作・補完しない。

## 技術スタックと制約

- Next.js 16.2.10(App Router, TypeScript)+ **素の CSS**(Tailwind 不使用 — 確定済み決定、変更禁止)
- テスト: Vitest + React Testing Library(`npm test`)。デプロイ先: Vercel
- 全コンテンツは `app/content.ts` に集約。セクション追加=データ 1 要素の追加で完結させる
- クライアント処理は `Reveal` / `HeroEffects` / `CursorLight` / `ConsoleEgg` / `PathRail` / `AmbientLight` の 6 コンポーネントに隔離。他はサーバーコンポーネント
- 品質要件: `:focus-visible` 必須 / Canvas は画面外で rAF 停止 / mousemove は rAF スロットリング / resize は debounce / `prefers-reduced-motion: reduce` で全アニメ無効化
- 外部ライブラリ追加は実装計画記載分のみ(YAGNI)
- 未確定情報はプレースホルダーのまま(`【氏名】`、`要確認` バッジ等)。勝手に埋めない

## 実装の進め方(計画・仕様)

- 実装計画: `docs/superpowers/plans/2026-07-07-portfolio-site.md`(タスク単位・チェックボックス管理)
- 設計書: `docs/superpowers/specs/2026-07-07-portfolio-design.md`

## このプロジェクトで使う Skills

カスタムエージェントは未導入。以下の Skills を場面に応じて起動する。

| Skill | 起動場面 |
|---|---|
| `superpowers:subagent-driven-development` | 実装計画のタスク実行(計画書が使用必須と明記。代替: `executing-plans`) |
| `superpowers:test-driven-development` | 各タスクの実装(全タスクがテスト先行構成) |
| `/code-review` | タスク完了毎(計画の品質要件が「コードレビュー対策」を明示) |
| `/verify` + Playwright MCP | モックアップとの見た目照合(実ブラウザでスクショ比較) |

典型ワークフロー:
1. **タスク実装**: subagent-driven-development → TDD でタスク実装 → `/code-review` → チェックボックス更新
2. **見た目検証**: 実装後 `/verify` → `npm run dev` → Playwright で v7 モックアップと目視比較
3. **デザイン変更疑義**: モックアップと差異を見つけたら実装を直す(モックアップ側は触らない)

## Skills との役割分担

- 実行手順は Skills が正。上記以外の創作系スキル(`frontend-design` 等)はデザイン確定済みのため使わない
- Next.js の API 確認は一般知識やスキルでなく `node_modules/next/dist/docs/` を正とする(AGENTS.md 参照)

## 触ってはいけないファイル

- `docs/design/portfolio-mockup-v7.html` — 確定モックアップ。読み取り専用
- `docs/superpowers/specs/` — 確定設計書。実装都合で書き換えない
