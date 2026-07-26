export type ShapeKind =
  | "circle" | "triangle" | "square" | "star" | "diamond"
  | "pentagon" | "ring" | "plus" | "moon" | "sparkle";
export type ShapeColor = "pink" | "teal" | "yellow" | "navy" | "amber";

export type ShapeConfig = {
  kind: ShapeKind;
  color: ShapeColor;
  top: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  rotate: number;
};

export type StarDotConfig = {
  top: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
};

export type ShootingStarConfig = {
  sy: number;
  sx: number;
  angle: number;
  duration: number;
  delay: number;
};

export type ConstellationPoint = { x: number; y: number };

/** 線形合同法による決定論的擬似乱数。同じseedなら常に同じ数列を返す。 */
function createRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const KINDS: ShapeKind[] = [
  "circle", "triangle", "square", "star", "diamond",
  "pentagon", "ring", "plus", "moon", "sparkle",
];

type Band = { top: [number, number]; colors: ShapeColor[]; count: number };

const BANDS: Band[] = [
  { top: [4, 34], colors: ["teal", "navy"], count: 16 },
  { top: [34, 66], colors: ["teal", "navy", "pink"], count: 24 },
  { top: [66, 96], colors: ["pink", "yellow", "amber"], count: 34 },
];

function buildShapeLayout(): ShapeConfig[] {
  const rand = createRng(7);
  const shapes: ShapeConfig[] = [];
  for (const band of BANDS) {
    for (let i = 0; i < band.count; i++) {
      const [lo, hi] = band.top;
      shapes.push({
        kind: KINDS[Math.floor(rand() * KINDS.length)],
        color: band.colors[Math.floor(rand() * band.colors.length)],
        top: lo + rand() * (hi - lo),
        left: 4 + rand() * 88,
        size: 14 + rand() * 34,
        duration: 18 + rand() * 14,
        delay: rand() * -20,
        drift: 20 + rand() * 40,
        rotate: rand() * 24 - 12,
      });
    }
  }
  return shapes;
}

function buildStarLayout(): StarDotConfig[] {
  const rand = createRng(21);
  const stars: StarDotConfig[] = [];
  for (let i = 0; i < 140; i++) {
    stars.push({
      top: rand() * 100,
      left: rand() * 100,
      size: 1 + rand() * 2,
      duration: 2 + rand() * 4,
      delay: rand() * -6,
    });
  }
  return stars;
}

function buildShootingStarLayout(): ShootingStarConfig[] {
  const rand = createRng(55);
  const shooters: ShootingStarConfig[] = [];
  for (let i = 0; i < 5; i++) {
    shooters.push({
      sy: rand() * 70,
      sx: 30 + rand() * 65,
      angle: 150 + rand() * 20,
      duration: 7 + rand() * 6,
      delay: rand() * -12,
    });
  }
  return shooters;
}

export const shapeLayout: ShapeConfig[] = buildShapeLayout();
export const starLayout: StarDotConfig[] = buildStarLayout();
export const shootingStarLayout: ShootingStarConfig[] = buildShootingStarLayout();

/** Experienceの星座マップ用座標。app/content.ts の timeline と同じ並び順・同じ件数を前提とする。 */
export const constellationLayout: ConstellationPoint[] = [
  { x: 8, y: 70 },
  { x: 26, y: 30 },
  { x: 46, y: 65 },
  { x: 68, y: 25 },
  { x: 90, y: 55 },
];
