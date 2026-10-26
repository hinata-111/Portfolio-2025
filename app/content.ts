export type InfoItem = { k: string; v: string; href?: string };
export type StackRow = { chip: string; cat: string; note?: string; pills: string[] };
export type TimelineItem = { when: string; title: string; desc: string; todo?: string };
export type ProjectDetail = { title: string; points: string[] };
export type Project = {
  slug: string;
  phLabel: string;
  imageSrc?: string;
  // ロゴなど切り抜きたくない画像は "contain"(明るい下地に全体を収める)
  imageFit?: "contain";
  // 写真を出せないときの文字サムネ(lines は本文の見出しから取る)
  textThumb?: { label: string; lines: string[] };
  title: string;
  summary: string;
  details?: ProjectDetail[];
  href?: string;
  linkLabel?: string;
};
export type LifeDetail = { label: string; value: string };
export type Social = { label: string; href: string };
export type ConnectSocial = { label: "Instagram" | "X" | "GitHub"; href: string };
export type BeyondItem = {
  slug: string;
  phLabel: string;
  imageSrc?: string;
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
  nameLatin: "Hinata Suzuki",
  eyebrow: "Portfolio",
  catchTop: "笑顔",
  catchBottom: "心を動かす",
  roleLine: "ENGINEER × ENTERTAINMENT",
  intro: "企画から実装まで一貫して、AI・Web技術でアイデアを形にする。",
  affiliations: ["慶應義塾大学 環境情報学部"],
  // トップのプロフィール欄に出す一言(1 要素 = 1 行)
  personalNote: ["ラジオとお笑いが趣味で", "HxHと涼宮ハルヒシリーズ、三島由紀夫が好きです"],
};

export const connectProfile = {
  nameLatin: profile.nameLatin,
  tagline: "モノづくりが好きです",
  introduction:
    "趣味について：ラジオをよく聞きます（10番組くらい）、HxHと涼宮ハルヒシリーズ、三島由紀夫が好きです",
  email: "yos570038@gmail.com",
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/suzuki_1732/" },
    { label: "X", href: "https://x.com/Strange_sfc23_5" },
    { label: "GitHub", href: "https://github.com/hinata-111" },
  ] satisfies ConnectSocial[],
};

export const aboutInfo: InfoItem[] = [
  { k: "名前", v: "鈴木日向/Hinata Suzuki" },
  { k: "所属", v: "慶應義塾大学 環境情報学部" },
  { k: "研究", v: "古谷知之研究室 — NLP・感情分析" },
  { k: "趣味", v: "旅行・将棋" },
  { k: "メール", v: "yos570038@gmail.com", href: "mailto:yos570038@gmail.com" },
];

export const aboutParagraphs = [
  "2023年9月、慶應義塾大学環境情報学部に入学。古谷知之研究室で、自然言語処理における感情分析を研究しています。2024年8月には42Tokyo Piscineに合格し、エンジニアの勉強をスタート。現在は長期インターンで、AIエージェントのR&DとWebアプリ開発に取り組んでいます。",
  "2か月間のシルクロード一人旅を経験。その体験をもとに、悩みから旅先を見つけるAI旅行サービス「Tabime」を開発・運営しています。",
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
  { when: "2023.08", title: "慶應義塾ニューヨーク学院 卒業", desc: "" },
  { when: "2023.09", title: "慶應義塾大学 環境情報学部 入学", desc: "専攻: コンピューターサイエンス" },
  { when: "2023.09 – 現在", title: "レディオ湘南 ラジオ番組運営", desc: "台本・ナビゲーター・ミキサーなど番組制作全体に携わる" },
  { when: "2024.08", title: "42Tokyo Piscine 合格・入学", desc: "4週間の選抜課程を経てエンジニア教育機関へ" },
  { when: "2025.07 – 現在", title: "長期インターン | エンジニア・ITコンサルタント", desc: "AIエージェントR&D、Webアプリ開発" },
  { when: "2025.08 – 現在", title: "福島復興知事業", desc: "福島イノベーション・コースト構想の「復興知」事業に採択。いわき市・田村市で高校生と社会人向けに生成AIの講義とワークショップを毎月開催" },
  { when: "2026.04 – 2026.06", title: "シルクロード一人旅", desc: "中国北京からエジプト・カイロまで、シルクロード横断の一人旅を実施" },
];

export const projects: Project[] = [
  {
    slug: "tabime",
    phLabel: "素材待ち:Tabime画面",
    imageSrc: "/images/project-tabime.png",
    title: "Tabime — 悩みから旅先を見つけるAI",
    summary: "2ヶ月の海外一人旅をきっかけに、悩みから旅先を見つけるAI旅行サービス。企画、プロダクト開発までを一人で担当。",
    href: "https://tabime.pages.dev",
    linkLabel: "Tabimeを体験する",
  },
  {
    slug: "fukushima",
    phLabel: "素材待ち:講義写真",
    imageSrc: "/images/project-fukushima-logo.svg",
    imageFit: "contain",
    title: "福島復興知プロジェクト",
    summary: "福島イノベーション・コースト構想の「復興知」事業に採択され、いわき市と田村市で毎月、生成AIの講義とワークショップを開いています。高校生向けには、仕組みの基礎から実際に手を動かす演習まで体系的に学べる講座を用意し、商工会議所を通じて社会人向けの講座も行っています。地方でAI人材が自ら育っていく好循環をつくることを目指しています。",
    href: "https://www.fipo.or.jp/education/43276",
    linkLabel: "福島復興知事業の詳細を見る",
  },
  {
    slug: "ogiri-dice",
    phLabel: "素材待ち:大喜利ダイス画面",
    imageSrc: "/images/project-ogiri-dice.png",
    title: "大喜利ダイス — 東京の劇場をめぐる大喜利すごろく",
    summary: "面白い回答ほど、先へ進める。大喜利の回答をAIが1〜6点で採点し、その点数がそのままサイコロの目になる、大喜利すごろくゲームです。東京を舞台に、プレイヤーは芸人になりきり目的地の劇場をめぐりながら、賞金100万円を目指す！1台で1〜4人（CPU対戦あり）で遊べて、友達とのオンライン対戦も可能。ブラウザですぐに遊べます。",
    href: "https://ogiri-dice.pages.dev/",
    linkLabel: "大喜利ダイスで遊ぶ",
  },
  {
    slug: "internship",
    phLabel: "素材待ち:インターン写真",
    textThumb: { label: "INTERN", lines: ["AIエージェントのR&D", "Webサービス開発"] },
    title: "長期インターン — 株式会社スパイクスタジオ",
    summary: "2025年7月から現在まで、AIエージェントのR&Dと、実際に運用されているWebサービスの開発に従事。",
    details: [
      {
        title: "AIエージェントのR&D",
        points: [
          "複数のAIエージェント開発で、業務課題の整理から仕様検討・提案、設計・実装、技術検証まで担当",
          "評価データ作成・精度評価・エラー分析・個人情報のマスキングで、実用化に向けて改善",
        ],
      },
      {
        title: "Webサービス開発",
        points: [
          "メンバーシップ・ライブ配信・電子チケットを扱う会員制ファンプラットフォームを開発",
          "新規ページや新規機能の追加のための実装、テスト、デプロイを担当",
        ],
      },
    ],
  },
];

export const beyond: BeyondItem[] = [
  {
    slug: "travel",
    phLabel: "素材待ち:旅の写真",
    imageSrc: "/images/beyond-travel.jpg",
    title: "海外一人旅 — 2ヶ月・8ヶ国",
    meta: "個人活動 / 2026.04 – 2026.06",
    desc: "中国からエジプトまで、2ヶ月で8ヶ国を一人旅。",
    featured: true,
    details: [
      {
        label: "旅の背景",
        value: "クリエイターとして視野と表現の幅を広げるには、異なる文化や価値観を知識として学ぶだけでなく、自ら現地に身を置いて体験することが必要だと考えた。各地で育まれてきた文化や暮らし、その土地ならではの魅力に直接触れるため、シルクロードを一人で旅した。",
      },
      {
        label: "旅で得られたこと",
        value: "言葉や習慣が異なる環境で、移動手段や宿、次の目的地を決め続けた経験から、自分で目的を定め、そこへ向かう道を切り開いていく面白さを知った。また、旅先での出会いや発見を発信した動画はInstagramで1万いいねを超えた。この経験は、悩みから旅先を提案するAI旅行サービス「Tabime」の開発にもつながっている。",
      },
    ],
    tags: ["Solo Travel", "Content Creation"],
    href: "https://tabime.pages.dev",
    linkLabel: "この旅から生まれたTabimeを見る",
  },
  {
    slug: "radio",
    phLabel: "素材待ち:ラジオ写真",
    imageSrc: "/images/beyond-radio.jpg",
    title: "ラジオ番組運営 — レディオ湘南",
    meta: "福利厚生団体 音像工房 / 2023.09 – 現在",
    desc: "レディオ湘南の学生番組で、台本、ナビゲーター、ミキサーを経験。マネージャーを務め、後輩育成と番組制作の仕組みづくりに携わった。",
    tags: ["ラジオ", "番組制作", "マネジメント", "育成", "仕組みづくり"],
  },
  {
    slug: "comedy",
    phLabel: "素材待ち:ステージ写真",
    imageSrc: "/images/beyond-comedy.jpg",
    title: "漫才ステージ",
    desc: "高校時代にお笑いを始め、初めて漫才の舞台に立ったのはアメリカ。大学では慶應義塾お笑い道場o-keisに所属している。",
    tags: ["漫才", "脚本", "ステージ", "表現"],
  },
];

// href が空の項目は URL 未確定。埋めるだけでリンクとして描画される
// 好きなラジオ番組(/about の末尾)。番組名は画像に書かれた正式表記のまま
export type RadioShow = { title: string; imageSrc: string };
export const favoriteRadio: RadioShow[] = [
  { title: "霜降り明星のオールナイトニッポン", imageSrc: "/images/radio/shimofuri-ann.jpg" },
  { title: "空気階段の踊り場", imageSrc: "/images/radio/kuki-kaidan-odoriba.webp" },
  { title: "真空ジェシカのラジオ父ちゃん", imageSrc: "/images/radio/shinku-jessica-radio-tochan.webp" },
  { title: "ママタルトのラジオ母ちゃん", imageSrc: "/images/radio/mamatalt-radio-kachan.webp" },
  { title: "カナメストーンのカナメちゃん村", imageSrc: "/images/radio/kaname-chan-mura.jpg" },
  { title: "金属バットの社会の窓", imageSrc: "/images/radio/kinzoku-bat-shakai-no-mado.jpg" },
  { title: "金魚番長のデメキング", imageSrc: "/images/radio/kingyo-bancho-demeking.jpg" },
  { title: "有吉弘行のSUNDAY NIGHT DREAMER", imageSrc: "/images/radio/ariyoshi-sunday-night-dreamer.jpg" },
];

export const socials: Social[] = [
  { label: "GitHub", href: "https://github.com/hinata-111" },
];

export const contact = {
  github: "https://github.com/hinata-111",
  email: "yos570038@gmail.com",
};
