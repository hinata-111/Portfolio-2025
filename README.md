# Portfolio 2025

個人ポートフォリオサイト。「人を笑顔にし、心を動かすものを生み出す」。

## Tech Stack
- Next.js (App Router) + TypeScript
- 素の CSS(デザイントークン、ダーク/ライト対応)— 外部 UI ライブラリなし
- 全ページ共通の宇宙背景演出 `CosmicBackground`(視差スクロール、reduced-motion 対応)
- Vitest + React Testing Library

## Development
npm install / npm run dev / npm test / npm run build

## Architecture
- `app/content.ts` — 全コンテンツを型付きデータで集約。プロジェクト・経歴の追加はデータ1要素の追加のみ
- `app/components/` — セクション単位の独立コンポーネント。クライアント処理は Reveal / CursorLight / ConsoleEgg / PathRail / CosmicBackground に隔離
- 設計書: `docs/superpowers/specs/2026-07-07-portfolio-design.md`
- モックアップ: `docs/design/portfolio-mockup-v7.html`

## Deploy
Vercel にインポートしてデフォルト設定でデプロイ。独自ドメインを使う場合は、Vercelの環境変数に `NEXT_PUBLIC_SITE_URL` を設定する。

公開前の確認項目は [docs/progress.md](docs/progress.md) に記載。
