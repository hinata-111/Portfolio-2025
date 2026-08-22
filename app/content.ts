export type InfoItem = { k: string; v: string };
export type StackRow = { chip: string; cat: string; note?: string; pills: string[] };
export type TimelineItem = { when: string; title: string; desc: string; todo?: string };
export type ProjectDetail = { title: string; value: string };
export type Project = {
  title: string;
  summary: string;
  details?: ProjectDetail[];
  href?: string;
  linkLabel?: string;
};
export type LifeDetail = { label: string; value: string };
export type Social = { label: string; href: string };
export type BeyondItem = {
  phLabel: string;
  title: string;
  desc: string;
  meta?: string;
  details?: LifeDetail[];
  featured?: boolean;
  tags?: string[];
  href?: string;
  linkLabel?: string;
};

export const profile = {
  name: "鈴木日向",
  eyebrow: "Portfolio",
  catchTop: "笑顔",
  catchBottom: "心を動かす",
  roleLine: "ENGINEER × ENTERTAINMENT",
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
  "2ヶ月間シルクロードの一人旅行を行き、旅の経験をもとに、悩みから旅先を見つけるAI旅行サービス「Tabime」を開発、運営を手掛ける",
];

export const motto = {
  quote: "之を知る者は之を好む者に如かず、之を好む者は之を楽しむ者に如かず",
  cite: "— 論語・雍也",
  vowBefore: "知るより、好む。好むより、楽しむ。だから私は誰よりも",
  vowStrong: "「楽しむ者」",
  vowAfter: "として、つくる。",
};

export const stack: StackRow[] = [
  { chip: "Py", cat: "Python / NLP", note: "インターン・研究で使用", pills: ["Python", "PyTorch", "MeCab", "GiNZA"] },
  { chip: "TS", cat: "Web開発", note: "インターン・個人開発で使用", pills: ["TypeScript", "React", "Node.js", "Vite", "Tailwind CSS", "Hono", ] },
  { chip: "DB", cat: "Database", pills: ["PostgreSQL", "Cloudflare D1"] },
  { chip: "Ops", cat: "Infra / Tools", pills: ["Docker", "Git / GitHub", "Cloudflare Workers / Pages"] },
];

export const timeline: TimelineItem[] = [
  { when: "2023.09", title: "慶應義塾大学 環境情報学部 入学", desc: "専攻: コンピューターサイエンス" },
  { when: "2024.04-", title: "レディオ湘南 学生ラジオ番組", desc: "—台本/ナビゲーター/ミキサー番組全体の業務に携わる" },
  { when: "2024.08", title: "42Tokyo Piscine 合格・入学", desc: "4週間の選抜課程を経てエンジニア教育機関へ" },
  { when: "2025.07 –", title: "長期インターン | エンジニア・ITコンサルタント", desc: "AIエージェントR&D、Webアプリ開発(現在も継続中)" },
  { when: "2025.08 –", title: "福島復興知事業", desc: "福島イノベーションコースト構想の「復興知」事業に採択。県内2校でAI技術に関する講義やワークショップを実施(現在も継続中)" },
  { when: "2026.04 – 2026.06", title: "シルクロード一人旅", desc: "中国北京からエジプト・カイロまで、シルクロード横断の一人旅を実施" },
];

export const projects: Project[] = [
  {
    title: "Tabime — 悩みから旅先を見つけるAI",
    summary: "2ヶ月の海外一人旅をきっかけに、悩みから旅先を見つけるAI旅行サービス。企画、プロダクト開発までを一人で担当。",
    href: "https://tabime.pages.dev",
    linkLabel: "Tabimeを体験する",
  },
  {
    title: "長期インターン — 株式会社スパイクスタジオ",
    summary: "AIエージェントのR&DとWebアプリケーション開発に従事。要件整理から実装、評価・改善、ユーザーが触れる機能の開発まで経験しています。",
    details: [
      {
        title: "履歴書解析AIエージェント",
        value: "社内ヒアリングをもとに抽出・評価項目を要件整理し、設計、実装、正解データ作成、精度評価・改善、個人情報のマスキングまで担当。",
      },
      {
        title: "Webアプリケーション",
        value: "ユーザーアカウントページとお気に入り機能を、Reactの画面からNode.jsのサーバー処理、PostgreSQLへのデータ保存まで担当。",
      },
    ],
  },
  {
    title: "福島復興知プロジェクト",
    summary: "福島県内2校・計8回のAI講義を担当。「AI×街づくり」をテーマに、生成AIを地域の課題や魅力と結びつけるワークショップを企画・実施しました。",
  },
];

export const beyond: BeyondItem[] = [
  {
    phLabel: "素材待ち:旅の写真",
    title: "海外一人旅 — 2ヶ月・8ヶ国",
    meta: "個人活動 / 2026.04 – 2026.06",
    desc: "中国からエジプトまで、2ヶ月で8ヶ国を一人旅。",
    featured: true,
    details: [
      {
        label: "旅の理由",
        value: "世界各地の街づくりを自分の肌で感じ、「人が笑顔になる場所とは何か」を確かめるため、シルクロードを一人で旅した。",
      },
      {
        label: "旅の記録",
        value: "地図と身振りを頼りに陸路で国境を越え、現地の人と関わりながら旅を記録。Instagram動画は1万いいねを超えた。",
      },
    ],
    tags: ["Solo Travel", "8ヶ国", "Content Creation"],
    href: "https://tabime.pages.dev",
    linkLabel: "この旅から生まれたTabimeを見る",
  },
  {
    phLabel: "素材待ち:ラジオ写真",
    title: "学生ラジオ番組 — レディオ湘南",
    meta: "福利厚生団体 音像工房 / 2023.09 – 現在",
    desc: "レディオ湘南の学生番組で、台本、ナビゲーター、ミキサーを経験。2年間マネージャーを務め、後輩育成と番組制作の仕組みづくりに携わった。",
    tags: ["ラジオ", "番組制作", "マネジメント", "育成", "仕組みづくり"],
  },
  {
    phLabel: "素材待ち:ステージ写真",
    title: "漫才ステージ",
    desc: "相方とネタをつくり、脚本から立ち姿まで考えて舞台へ。目の前の人を笑わせることに向き合う、最も直接的な表現活動。",
    tags: ["漫才", "脚本", "ステージ", "表現"],
  },
];

// href が空の項目は URL 未確定。埋めるだけでリンクとして描画される
export const socials: Social[] = [
  { label: "GitHub", href: "https://github.com/hinata-111" },
  { label: "X", href: "" },
];

export const contact = {
  github: "https://github.com/hinata-111",
  email: "yos570038@gmail.com",
};
