export type InfoItem = { k: string; v: string };
export type StackRow = { chip: string; cat: string; note?: string; pills: string[] };
export type TimelineItem = { when: string; title: string; desc: string; todo?: string };
export type ProjectRow = { label: string; value: string };
export type Project = { title: string; todoBadge?: string; meta: string; rows: ProjectRow[]; tags: string[] };
export type BeyondItem = { phLabel: string; title: string; desc: string };
export type TickerWord = { text: string; fill?: boolean };

export const profile = {
  name: "鈴木日向",
  grad: "Portfolio — 2028卒",
  catchTop: "笑顔",
  catchBottom: "心を動かす",
  roleLine: "PdM × ENGINEER × CREATOR",
  affiliations: ["慶應義塾大学 環境情報学部"],
};

export const aboutInfo: InfoItem[] = [
  { k: "名前", v: "鈴木日向/Hinata Suzuki" },
  { k: "所属", v: "慶應義塾大学 環境情報学部" },
  { k: "研究", v: "古谷知之研究室 — NLP・感情分析" },
  { k: "趣味", v: "旅行・将棋" },
];

export const aboutParagraphs = [
  "慶應義塾大学 環境情報学部(2023年9月入学)。古谷知之研究室にて自然言語処理における感情分析を研究。2024年8月、42Tokyo Piscineに合格し入学。現在は長期インターンでAIエージェントのR&DとWebアプリ開発に携わる。",
  "ラジオ、漫才、旅、そしてソフトウェア。手段は違っても、つくる理由はいつも同じ——目の前の人を笑顔にすること。お金のためではなく、クリエイターとして価値を生むことを大切にしている。",
];

export const motto = {
  quote: "之を知る者は之を好む者に如かず、之を好む者は之を楽しむ者に如かず",
  cite: "— 論語・雍也",
  vowBefore: "知る者より、好む者。好む者より、楽しむ者。だから私は、誰よりも",
  vowStrong: "「楽しむ者」",
  vowAfter: "としてつくる。",
};

export const stack: StackRow[] = [
  { chip: "Py", cat: "Python / NLP", note: "インターン・研究で使用", pills: ["Python", "PyTorch", "MeCab", "GiNZA"] },
  { chip: "AI", cat: "LLM応用", note: "個人開発・R&D", pills: ["RAG", "ベクトルDB", "AIエージェント"] },
  { chip: "TS", cat: "Web開発", note: "インターンで使用", pills: ["TypeScript", "React", "Node.js"] },
  { chip: "DB", cat: "Database", pills: ["PostgreSQL"] },
  { chip: "Ops", cat: "Infra / Tools", pills: ["Docker", "Git / GitHub"] },
];

export const timeline: TimelineItem[] = [
  { when: "2023.09", title: "慶應義塾大学 環境情報学部 入学", desc: "専攻: コンピューターサイエンス/データサイエンス" },
  { when: "要確認", todo: "期間", title: "FM83.1HZレディオ湘南の University Studio運営", desc: "台本/ナビゲーター/ミキサー番組全体の業務に携わる" },
  { when: "2024.08", title: "42Tokyo Piscine 合格・入学", desc: "4週間の選抜課程を経てエンジニア教育機関へ" },
  { when: "2025.07 –", title: "長期インターン | エンジニア・ITコンサルタント", desc: "AIエージェントR&D、Webアプリ開発(現在も継続中)" },
  { when: "2025.08 –", title: "福島県復興地プロジェクト", desc: "県内高校にてAIワークショップを実施(古谷研究室)" },
];

export const projects: Project[] = [
  {
    title: "履歴書解析AIエージェント R&D",
    todoBadge: "公開可否 要確認",
    meta: "長期インターン / 2025.07 – 2025.10",
    rows: [
      { label: "課題", value: "(会社確認後に記載 — 抽象化の可能性あり)" },
      { label: "役割", value: "R&D担当エンジニア" },
      { label: "技術選定", value: "なぜLLM/このアプローチか(記載予定)" },
      { label: "工夫", value: "LLMによるスキル抽出・構造化のアプローチ設計" },
      { label: "成果と学び", value: "(数値・導入状況・得た学びを確認後に記載)" },
    ],
    tags: ["Python", "LLM", "NLP"],
  },
  {
    title: "Webアプリ開発",
    todoBadge: "公開可否 要確認",
    meta: "長期インターン / 2025.11 – 現在",
    rows: [
      { label: "課題", value: "(会社確認後に記載)" },
      { label: "役割", value: "開発エンジニア" },
      { label: "技術選定", value: "React / Node.js / PostgreSQL の選定理由(記載予定)" },
      { label: "工夫", value: "(記載予定)" },
      { label: "成果と学び", value: "(記載予定)" },
    ],
    tags: ["TypeScript", "React", "Node.js", "PostgreSQL"],
  },
  {
    title: "Discord Bot(個人開発)",
    meta: "個人開発 / GitHub公開",
    rows: [
      { label: "課題", value: "コミュニティ内の知識散逸 — 過去ログから答えられる仕組みがない" },
      { label: "役割", value: "企画・設計・実装すべて" },
      { label: "技術選定", value: "RAG+ベクトルDBを選んだ理由(記載予定)" },
      { label: "工夫", value: "文脈を保った検索・応答パイプラインの設計" },
      { label: "成果と学び", value: "(利用数など数値を追記予定)" },
    ],
    tags: ["RAG", "ベクトルDB", "Python"],
  },
];

export const beyond: BeyondItem[] = [
  { phLabel: "素材待ち:旅の写真", title: "海外一人旅 2ヶ月", desc: "陸路での国境越え。現地住民へのインタビュー。Instagram動画は1万いいねを超えた。" },
  { phLabel: "素材待ち:ステージ写真", title: "漫才ステージ", desc: "脚本から立ち姿まで、自分でつくって舞台に立つ。笑いは最速で人を笑顔にする手段。" },
  { phLabel: "素材待ち:ワークショップ写真", title: "福島 AIワークショップ", desc: "復興地の高校生へAIの面白さを届ける。テクノロジーを「体験」として手渡す試み。" },
];

export const tickerWords: TickerWord[] = [
  { text: "MAKE" },
  { text: "作る", fill: true },
  { text: "MOVE" },
  { text: "動かす", fill: true },
  { text: "BUILD" },
  { text: "届ける", fill: true },
];

export const contact = {
  github: "https://github.com/hinata-111", // TODO: GitHubプロフィールURL
  email: "yos570038@gmail.com", // TODO: mailto:
};
