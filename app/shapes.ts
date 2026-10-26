function createRng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

// トップ背景の星座(Constellation)。位置は画面比 0〜1、速度は 1 秒あたりの画面比
export type DriftingStar = { x: number; y: number; vx: number; vy: number; r: number };

function buildDriftingStars(seed: number, count: number): readonly DriftingStar[] {
  const random = createRng(seed);
  return Array.from({ length: count }, () => ({
    x: random(),
    y: random(),
    vx: (random() - 0.5) * 0.012,
    vy: (random() - 0.5) * 0.012,
    r: 0.6 + random() * 1.1,
  }));
}

export const driftingStars = buildDriftingStars(7, 100);
