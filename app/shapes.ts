export type StarDotConfig = {
  top: number;
  left: number;
  size: number;
  opacity: number;
  fadeAfterGate?: boolean;
};

export type StarLayer = {
  speed: number;
  stars: readonly StarDotConfig[];
};

function createRng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

function buildStars(seed: number, count: number, sizeMin: number, sizeMax: number, opacity: number): readonly StarDotConfig[] {
  const random = createRng(seed);
  return Array.from({ length: count }, (_, index) => ({
    top: random() * 100,
    left: random() * 100,
    size: sizeMin + random() * (sizeMax - sizeMin),
    opacity,
    fadeAfterGate: index % 5 === 0,
  }));
}

// speed はページのスクロール量に対する倍率。1 を超えるぶんだけ背景が本文を追い越して流れる。
export const starLayers = {
  far: { speed: 1.3, stars: buildStars(21, 44, 0.7, 1.25, 0.26) },
  mid: { speed: 1.7, stars: buildStars(42, 58, 1, 1.8, 0.38) },
  near: { speed: 2.3, stars: buildStars(84, 72, 1.4, 2.5, 0.52) },
} satisfies Record<"far" | "mid" | "near", StarLayer>;

export type ConstellationPoint = { x: number; y: number };
export const constellationLayout: ConstellationPoint[] = [
  { x: 3, y: 42 },
  { x: 8, y: 70 },
  { x: 26, y: 30 },
  { x: 46, y: 65 },
  { x: 68, y: 25 },
  { x: 90, y: 55 },
  { x: 82, y: 82 },
];
