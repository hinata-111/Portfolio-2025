# Cosmic Unknown Challenge Implementation Plan
> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

## Goal

Implement the approved “宇宙を比喩にした未知への挑戦” direction as a quiet, deterministic floating-shape layer. The portfolio keeps its existing section names, order, copy, content behavior, PathRail labels, primary Experience timeline, and public interactions. Decorative shapes become five translucent glass forms that drift through safe whitespace: the content remains the subject and the cosmos remains a metaphor for unexplored possibility.

The authority for this work is `docs/superpowers/specs/2026-08-20-cosmic-unknown-challenge-design.md`. It supersedes conflicting visual/background details in `docs/superpowers/specs/2026-07-26-cosmic-background-design.md`. This plan does not authorize a commit, push, deployment, content rewrite, migration, or secret/configuration change; the worktree is dirty and all unrelated user changes must be preserved.

## Architecture

- Replace the current random 74-shape page layout with static, SSR-safe scene definitions for `hero`, `about`, `skills`, `experience`, `projects`, `beyond`, and `contact`.
- Keep exactly five shape kinds: `glass-ring`, `chipped-orb`, `tri-prism`, `crystal-shard`, and `double-bubble`. A shape has no semantic mapping to a technology, project, or emotion.
- Render three independent pointer-transparent layers: stars (subtle static starfield only), scene shapes, and page content. Decorative layers are `aria-hidden="true"` and cannot enter the focus order.
- Give each scene a deterministic desktop anchor list and a mobile subset. Render exactly one DOM anchor per desktop shape; each mobile definition reuses a desktop `id` and supplies only mobile CSS variables. CSS hides anchors without a mobile definition, so hydration never depends on `window.innerWidth`. The active viewport may show at most five desktop shapes and three mobile shapes. Hero’s desktop scene is exactly one L, two M, and two S anchors.
- Give each shape three transform layers: an outer anchor for fixed position and scroll parallax, a middle drift element for autonomous motion, and an inner geometry element for material and the allowed scroll-linked rotation. No two effects write the same transform.
- Keep scroll control in `CosmicBackground`: one passive scroll listener, one rAF queue, deterministic depth coefficients, and scene visibility controlled by an `IntersectionObserver` observing the real document sections (`#hero`, `#about`, etc.). The fixed overlay scene group matching the active section is shown; hidden groups pause via CSS. Do not write styles directly in the raw scroll event.
- Check `prefers-reduced-motion` before installing motion listeners. Reduced motion renders the same deterministic static anchors with no drift, scroll parallax, rotation, or glow changes.
- Keep only light glass surfaces on `.timeline li`/Experience and `.project`/Projects. Hero, About, Skills, Beyond Code, and Contact stay open. Remove Hero orbit, shooting stars, the vertical wrap line, and section divider lines. Preserve the current primary Experience timeline and its existing `aria-hidden` constellation decoration; it is not a grid/orbit/divider and is protected behavior.

## Tech Stack

- Next.js `16.2.10`, React `19.2.4`, TypeScript `^5`.
- Vitest `4.1.10`, Testing Library React `^16.3.2`, jsdom `^29.1.1`.
- Existing npm scripts: `npm test` (`vitest run`) and `npm run build` (`next build`). Use the repository’s installed dependencies; do not update packages.
- CSS remains in `app/globals.css`; component/data changes stay within the existing `app/` and `tests/` boundaries unless a focused helper file is justified.

---

## Execution rules and baseline

- [ ] Read the Next local guidance before editing: `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`, `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md`, and the actual installed Vitest guide at `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md` (the requested `node_modules/next/dist/docs/testing/vitest.md` path does not exist in this install). Record any relevant client-boundary, CSS, and test-environment constraints in the implementation notes.
- [ ] Inspect `app/shapes.ts`, `app/components/CosmicBackground.tsx`, `app/components/Hero.tsx`, `app/globals.css`, `app/page.tsx`, and the existing tests before changing them. Confirm current dirty changes with `git status --short`; do not reset, checkout, stash, commit, or push.
- [ ] Run the baseline with `npm test`. Expected result: the current suite passes before the new RED assertions are added. If it fails, capture the pre-existing failure and do not silently attribute it to this feature.
- [ ] Run `npm run build`. Expected result: the current Next production build completes before implementation. A pre-existing build failure must be reported separately from feature failures.

## Task 1 — Establish the RED data contract

Files: `tests/shapes.test.ts`, then `app/shapes.ts` only after the tests fail.

- [ ] Replace assertions that require 74 random shapes and old color/kind names with contract tests for the approved five kinds. The first run must fail against the current implementation because it still exposes ten kinds, old colors, and a 74-item layout.
- [ ] Add deterministic scene-shape type assertions. The intended contract is equivalent to:

```ts
import {
  DESKTOP_SHAPE_LIMIT,
  MOBILE_SHAPE_LIMIT,
  SCENE_DEFINITIONS,
  SHAPE_KINDS,
} from "@/app/shapes";

it("exposes exactly the five approved glass shape kinds", () => {
  expect(SHAPE_KINDS).toEqual([
    "glass-ring",
    "chipped-orb",
    "tri-prism",
    "crystal-shard",
    "double-bubble",
  ]);
  const allShapes = Object.values(SCENE_DEFINITIONS).flatMap((scene) => scene.desktop);
  expect(new Set(allShapes.map((shape) => shape.kind))).toEqual(new Set(SHAPE_KINDS));
  expect(allShapes.some((shape) => shape.kind === "stretched-droplet")).toBe(false);
});

it("keeps scene definitions deterministic and bounded", () => {
  expect(Object.keys(SCENE_DEFINITIONS)).toEqual([
    "hero", "about", "skills", "experience", "projects", "beyond", "contact",
  ]);
  for (const scene of Object.values(SCENE_DEFINITIONS)) {
    expect(scene.desktop.length).toBeLessThanOrEqual(DESKTOP_SHAPE_LIMIT);
    expect(scene.mobile.length).toBeLessThanOrEqual(MOBILE_SHAPE_LIMIT);
    expect(scene.mobile.every((id) => scene.desktop.some((desktop) => desktop.id === id))).toBe(true);
    for (const shape of scene.desktop) {
      expect(SHAPE_KINDS).toContain(shape.kind);
      expect(["S", "M", "L"]).toContain(shape.size);
      expect(shape.depth).toMatch(/^(far|mid|near)$/);
      expect(shape.clearancePx).toBeGreaterThanOrEqual(40);
    }
  }
});

it("keeps Hero at L1, M2, S2 on desktop", () => {
  expect(SCENE_DEFINITIONS.hero.desktop.map((shape) => shape.size)).toEqual([
    "L", "M", "M", "S", "S",
  ]);
});

it("allows rotation only for ring, prism, and shard", () => {
  const rotating = new Set(["glass-ring", "tri-prism", "crystal-shard"]);
  for (const shape of SCENE_DEFINITIONS.hero.desktop) {
    expect(shape.turnDirection !== 0).toBe(rotating.has(shape.kind));
    expect([-1, 0, 1]).toContain(shape.turnDirection);
  }
});
```

- [ ] Run `npm test -- tests/shapes.test.ts`. Expected RED: the old random-layout length/kind/color assertions fail and `SCENE_DEFINITIONS` is missing.
- [ ] Implement the minimal static data model in `app/shapes.ts`. Remove `createRng`, `KINDS`, `BANDS`, `buildShapeLayout`, old `ShapeColor`, and random shape generation. Keep `starLayout` deterministic if retained, keep `constellationLayout` only as data needed by the existing Experience content, and remove `shootingStarLayout` from the public background contract.
- [ ] Use a complete typed definition, not runtime random generation. The core shape contract should be equivalent to:

```ts
export const SHAPE_KINDS = [
  "glass-ring",
  "chipped-orb",
  "tri-prism",
  "crystal-shard",
  "double-bubble",
] as const;

export type ShapeKind = (typeof SHAPE_KINDS)[number];
export type ShapeSize = "S" | "M" | "L";
export type ShapeDepth = "far" | "mid" | "near";

export type SceneShape = {
  id: string;
  kind: ShapeKind;
  top: number;
  left: number;
  size: ShapeSize;
  depth: ShapeDepth;
  opacity: number;
  driftSeconds: number;
  driftDelaySeconds: number;
  turnDirection: -1 | 0 | 1;
  clearancePx: number;
  mobile?: { top: number; left: number; size: ShapeSize };
};

export type SceneDefinition = {
  desktop: readonly SceneShape[];
  mobile: readonly string[];
};

export const DESKTOP_SHAPE_LIMIT = 5;
export const MOBILE_SHAPE_LIMIT = 3;

export const SCENE_DEFINITIONS = {
  hero: {
    desktop: [
      { id: "hero-ring", kind: "glass-ring", top: 22, left: 9, size: "L", depth: "far", opacity: .28, driftSeconds: 18, driftDelaySeconds: -4, turnDirection: 1, clearancePx: 64, mobile: { top: 20, left: 4, size: "M" } },
      { id: "hero-orb", kind: "chipped-orb", top: 66, left: 76, size: "M", depth: "mid", opacity: .24, driftSeconds: 17, driftDelaySeconds: -8, turnDirection: 0, clearancePx: 52, mobile: { top: 70, left: 80, size: "S" } },
      { id: "hero-prism", kind: "tri-prism", top: 34, left: 85, size: "M", depth: "near", opacity: .22, driftSeconds: 19, driftDelaySeconds: -12, turnDirection: -1, clearancePx: 48 },
      { id: "hero-shard", kind: "crystal-shard", top: 74, left: 17, size: "S", depth: "mid", opacity: .20, driftSeconds: 16, driftDelaySeconds: -2, turnDirection: 1, clearancePx: 48, mobile: { top: 84, left: 8, size: "S" } },
      { id: "hero-bubble", kind: "double-bubble", top: 13, left: 67, size: "S", depth: "far", opacity: .18, driftSeconds: 20, driftDelaySeconds: -10, turnDirection: 0, clearancePx: 48 },
    ],
    mobile: ["hero-ring", "hero-orb", "hero-shard"],
  },
  // about, skills, experience, projects, beyond, and contact use the same
  // explicit shape schema with safe left/right whitespace anchors.
} satisfies Record<string, SceneDefinition>;
```

- [ ] Fill all seven scenes with explicit definitions rather than the abbreviated comment above; every scene’s desktop and mobile arrays must be reviewable in the diff and use only safe margin anchors. Keep each scene’s maximum visible set within the approved limits.
- [ ] Run `npm test -- tests/shapes.test.ts` again. Expected GREEN: only the new five-kind, deterministic scene contract passes; no test depends on random output, old colors, or a 74-item count.

## Task 2 — Add RED component semantics and render the pure shape

Files: `tests/cosmicbackground.test.tsx`, `app/components/CosmicBackground.tsx`, and `app/globals.css`.

- [ ] Add component RED assertions for separate layers, semantic attributes, scene IDs, one desktop anchor per definition, mobile-ID subset variables, and absence of shooting stars. The current component must fail because it renders the old 74-shape list and `.shooting-stars` layer.
- [ ] Use stable selectors and assert the shape catalog directly:

```tsx
it("renders deterministic scene layers without shooting stars", () => {
  const { container } = render(<CosmicBackground />);
  expect(container.querySelector(".starfield")).toHaveAttribute("aria-hidden", "true");
  expect(container.querySelector(".cosmic-scenes")).toHaveAttribute("aria-hidden", "true");
  expect(container.querySelector(".shooting-stars")).toBeNull();
  expect(container.querySelectorAll(".cosmic-scene")).toHaveLength(7);
  expect(container.querySelectorAll(".cosmic-shape")).toHaveLength(
    Object.values(SCENE_DEFINITIONS).reduce((count, scene) => count + scene.desktop.length, 0),
  );
  expect(container.querySelectorAll("[tabindex]")).toHaveLength(0);
  for (const anchor of container.querySelectorAll<HTMLElement>(".cosmic-shape")) {
    expect(anchor.querySelector(".cosmic-shape__drift")).not.toBeNull();
    expect(anchor.querySelector(".cosmic-shape__geometry")).not.toBeNull();
    expect(anchor.dataset.shapeId).toBeTruthy();
  }
});

it("marks shape anchors as pointer-transparent and aria-hidden", () => {
  const { container } = render(<CosmicBackground />);
  const scenes = container.querySelector(".cosmic-scenes");
  expect(scenes).toHaveAttribute("aria-hidden", "true");
  expect(scenes?.querySelector("a, button, input, select, textarea, [tabindex]")).toBeNull();
  for (const shape of container.querySelectorAll(".cosmic-shape")) {
    expect(shape).toHaveAttribute("aria-hidden", "true");
    expect(shape.querySelector(".cosmic-shape__drift .cosmic-shape__geometry")).not.toBeNull();
  }
});
```

- [ ] Run `npm test -- tests/cosmicbackground.test.tsx`. Expected RED: old selectors/counts and shooting stars fail.
- [ ] Implement a pure `CosmicShape` renderer in `app/components/CosmicBackground.tsx` (or a focused sibling file if it keeps the client boundary clearer). It must map a `SceneShape` to an outer anchor and inner geometry, pass CSS variables as strings, and never use `Math.random`, time-based initialization, or layout measurement during render:

```tsx
function CosmicShape({ shape }: { shape: SceneShape }) {
  const mobile = shape.mobile;
  const sizePx = { S: "28px", M: "56px", L: "104px" } as const;
  return (
    <div
      className={`cosmic-shape cosmic-shape--${shape.kind} cosmic-shape--${shape.size}`}
      data-shape-id={shape.id}
      data-depth={shape.depth}
      data-turn-direction={String(shape.turnDirection)}
      data-mobile={mobile ? "true" : "false"}
      aria-hidden="true"
      style={{
        "--shape-top": `${shape.top}%`,
        "--shape-left": `${shape.left}%`,
        "--mobile-top": mobile ? `${mobile.top}%` : "initial",
        "--mobile-left": mobile ? `${mobile.left}%` : "initial",
        "--mobile-size": mobile ? sizePx[mobile.size] : "initial",
        "--shape-opacity": shape.opacity,
        "--drift-duration": `${shape.driftSeconds}s`,
        "--drift-delay": `${shape.driftDelaySeconds}s`,
        "--shape-clearance": `${shape.clearancePx}px`,
      } as CSSProperties}
    >
      <span className="cosmic-shape__drift" aria-hidden="true">
        <span className="cosmic-shape__geometry" aria-hidden="true" />
      </span>
    </div>
  );
}
```

- [ ] Render a `.cosmic-scenes` fixed overlay with one `.cosmic-scene` per section and `data-scene-id` values matching the seven section IDs. Render exactly one anchor for every desktop definition. For each anchor, provide mobile `top`, `left`, and `size` CSS variables when its ID exists in the scene’s mobile subset, and mark it `data-mobile="true"`; anchors without a mobile match are `data-mobile="false"` and hidden by mobile CSS. Do not render duplicate mobile anchors or inspect `window.innerWidth` during SSR.
- [ ] Keep the starfield subtle and deterministic if retained, but remove `shootingStarLayout`, `.shooting-stars`, and `.shooting-star` rendering so the background does not become generic cosmic spectacle.
- [ ] Add RED CSS assertions or DOM style checks for no grid/orbit/divider classes once the CSS cleanup is made in Task 5.
- [ ] Run `npm test -- tests/cosmicbackground.test.tsx`. Expected GREEN: all seven scenes, only approved kinds, no shooting stars, and no focus/pointer target are rendered.

## Task 3 — Isolate the rAF scroll and visibility controller

Files: `tests/cosmicbackground.test.tsx`, `app/components/CosmicBackground.tsx` (and an optional focused controller module under `app/` if pure helpers make tests clearer).

- [ ] Add RED lifecycle tests using spies for `window.addEventListener`, `window.removeEventListener`, `requestAnimationFrame`, and `IntersectionObserver`. Verify scroll registration uses `{ passive: true }`, raw scroll does not immediately mutate shape transforms, and one queued rAF performs the update.
- [ ] Add RED tests that unmount cleanly, disconnect the observer from real section elements (`#hero` through `#contact`), and install no scroll listener when `matchMedia("(prefers-reduced-motion: reduce)").matches` is true.
- [ ] Add a RED test that invokes the observer callback with a real section entry, activates the matching fixed scene group, and asserts the other scene groups receive a paused/inactive state. Test the CSS pause class/data state; do not add an injected clock, sleep, or offscreen elapsed-time simulation.
- [ ] Implement the minimal controller. The controller observes actual document sections by ID, then activates the fixed overlay scene group with the same `data-scene-id`. The initial active scene is `hero`; if `IntersectionObserver` is unavailable, leave only Hero static and never throw. The core behavior should be equivalent to:

```ts
const SHIFT = { far: 6, mid: 12, near: 20 } as const;

function useCosmicMotion(sceneRoot: HTMLDivElement | null) {
  useEffect(() => {
    if (!sceneRoot) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sectionIds = ["hero", "about", "skills", "experience", "projects", "beyond", "contact"];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    const sceneGroups = [...sceneRoot.querySelectorAll<HTMLElement>("[data-scene-id]")];
    let activeId = "hero";
    sceneGroups.forEach((group) => {
      group.dataset.active = String(group.dataset.sceneId === activeId);
    });
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) activeId = (entry.target as HTMLElement).id;
        sceneGroups.forEach((group) => {
          group.dataset.active = String(group.dataset.sceneId === activeId);
        });
      }),
      { rootMargin: "-35% 0px -55% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    if (reduced) return () => observer.disconnect();

    let frame = 0;
    let queued = false;
    const update = () => {
      queued = false;
      const section = document.getElementById(activeId);
      const localProgress = section
        ? Math.max(-1, Math.min(1, (window.innerHeight / 2 - section.getBoundingClientRect().top) / Math.max(section.clientHeight, 1)))
        : 0;
      const activeGroup = sceneRoot.querySelector<HTMLElement>(`[data-scene-id="${activeId}"]`);
      activeGroup?.querySelectorAll<HTMLElement>(".cosmic-shape").forEach((anchor) => {
        const depth = anchor.dataset.depth as keyof typeof SHIFT;
        const shift = SHIFT[depth] ?? SHIFT.mid;
        const direction = Number(anchor.dataset.turnDirection ?? 0);
        const turn = Math.max(-6, Math.min(6, localProgress * 6 * direction));
        anchor.style.setProperty("--scene-shift-y", `${localProgress * shift}px`);
        anchor.style.setProperty("--scene-turn", `${turn}deg`);
      });
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [sceneRoot]);
}
```

  Adapt the exact placement to React refs and jsdom limitations, but keep the observable guarantees: one passive listener, one queued rAF, observer disconnect, reduced-motion static state, and maximum six-degree turn only for ring/prism/shard. The orb and double bubble must never receive a rotation transform.
- [ ] Ensure the controller uses a ref to the fixed scene root and does not couple content layout, focus, or section rendering to decoration. If `IntersectionObserver` is unavailable, keep Hero static, skip observation, and do not throw.
- [ ] Run `npm test -- tests/cosmicbackground.test.tsx`. Expected GREEN: lifecycle, reduced-motion, rAF, passive listener, observer, and cleanup tests pass.

## Task 4 — Implement glass geometry and responsive/reduced-motion CSS

Files: `app/globals.css`, with CSS tests added to `tests/cosmicbackground.test.tsx` only where jsdom can make a reliable assertion.

- [ ] Add RED assertions for the five geometry classes and remove reliance on old `.shape-*` class names. Confirm no geometry class maps to old circle/square/star/diamond/pentagon/plus/moon/sparkle kinds.
- [ ] Implement one monochrome glass material using CSS variables, low-opacity border/background, and restrained shadow. The five inner geometries should be complete and distinct:

```css
.cosmic-shape {
  position: absolute;
  top: var(--shape-top); left: var(--shape-left);
  width: var(--shape-size-base); height: var(--shape-size-base);
  opacity: var(--shape-opacity); pointer-events: none;
  transform: translate3d(0, var(--scene-shift-y, 0px), 0);
  visibility: hidden;
}
.cosmic-scene[data-active="true"] .cosmic-shape { visibility: visible; }
.cosmic-scene[data-active="false"] .cosmic-shape__drift { animation-play-state: paused; }
.cosmic-shape__drift {
  display: block; width: 100%; height: 100%;
  animation: cosmic-drift var(--drift-duration) ease-in-out var(--drift-delay) infinite alternate;
  animation-play-state: running;
}
.cosmic-shape__geometry {
  display: block; width: 100%; height: 100%;
  border: 1px solid color-mix(in srgb, var(--ink-strong) 24%, transparent);
  background: color-mix(in srgb, var(--surface) 18%, transparent);
  box-shadow: 0 0 32px color-mix(in srgb, var(--ink-strong) 8%, transparent);
  transform: rotate(var(--scene-turn, 0deg)); transform-origin: center;
}
.cosmic-shape--glass-ring .cosmic-shape__geometry { border-radius: 50%; background: transparent; }
.cosmic-shape--chipped-orb .cosmic-shape__geometry { border-radius: 48% 52% 42% 58%; clip-path: polygon(0 0, 78% 0, 100% 23%, 100% 100%, 0 100%); position: relative; }
.cosmic-shape--chipped-orb .cosmic-shape__geometry::after { content: ""; position: absolute; width: 42%; height: 42%; right: -4%; top: -4%; border-radius: 50%; background: var(--ground); }
.cosmic-shape--tri-prism .cosmic-shape__geometry { clip-path: polygon(50% 0, 100% 100%, 0 100%); }
.cosmic-shape--crystal-shard .cosmic-shape__geometry { clip-path: polygon(50% 0, 100% 35%, 72% 100%, 18% 82%, 0 28%); }
.cosmic-shape--double-bubble .cosmic-shape__geometry { border-radius: 50%; position: relative; }
.cosmic-shape--double-bubble .cosmic-shape__geometry::after { content: ""; position: absolute; width: 68%; height: 68%; right: -36%; bottom: -10%; border: 1px solid color-mix(in srgb, var(--ink-strong) 20%, transparent); border-radius: 50%; background: color-mix(in srgb, var(--surface) 16%, transparent); }
.cosmic-shape--S { --shape-size-base: 28px; }
.cosmic-shape--M { --shape-size-base: 56px; }
.cosmic-shape--L { --shape-size-base: 104px; }
@media (max-width: 700px) {
  .cosmic-shape[data-mobile="true"] { top: var(--mobile-top); left: var(--mobile-left); width: var(--mobile-size); height: var(--mobile-size); }
  .cosmic-shape[data-mobile="false"] { display: none; }
}
@keyframes cosmic-drift { from { transform: translate3d(-8px, -5px, 0); } to { transform: translate3d(8px, 5px, 0); } }
@media (prefers-reduced-motion: reduce) {
  .cosmic-shape__drift, .star-dot { animation: none; }
  .cosmic-shape__geometry { transform: none; }
  .cosmic-scene[data-active="false"] .cosmic-shape__drift { animation-play-state: paused; }
}
```

- [ ] Use the existing `--ink-strong`, `--surface`, and `--ground` tokens exactly as shown; do not introduce undefined `--text`/`--deep` variables, multicolor shape variables, or strong neon borders. The ring must remain hollow, the chipped orb must have a visible cutout, and the double bubble must use a pseudo-element or valid nested geometry.
- [ ] Add scene-layer CSS that keeps shapes behind content, with no visual grid/guide/trajectory lines, orbit, or decorative divider background. CSS Grid remains allowed for content layout; “no grid” bans only visual grid decoration. Set `.cosmic-scenes, .starfield { pointer-events: none; }` and preserve content stacking/focus order.
- [ ] Add mobile media rules that hide desktop anchors without a mobile config and apply the mobile variables to reused anchors; ensure no viewport-dependent JavaScript is needed for hydration.
- [ ] Add reduced-motion rules that set `animation: none`, remove glow transitions, and keep static transforms. Ensure `@media (prefers-reduced-motion: reduce)` affects `.cosmic-shape`, `.cosmic-shape__drift`, `.cosmic-shape__geometry`, and existing star animation without hiding content.
- [ ] Run `npm test -- tests/cosmicbackground.test.tsx` and `npm run build`. Expected GREEN: component tests pass and Next compiles CSS without invalid selectors or client/server errors.

## Task 5 — Remove conflicting visual layers while preserving content

Files: `app/components/Hero.tsx`, `app/globals.css`, and focused content-component edits only for the explicitly named decorative lines.

- [ ] Add RED regression assertions in `tests/hero.test.tsx` that Hero keeps its existing IDs/copy but no longer renders `.orbit-ring`. Keep `.nebula` only if its visual treatment is a quiet non-orbit glow and it does not create a card, grid, or competing spectacle.
- [ ] Remove the `.orbit-ring` element from `app/components/Hero.tsx`; preserve `hero`, `hero-inner`, eyebrow, heading, role line, affiliations, fade, and scroll cue markup/content.
- [ ] Remove or override old `.shape-*`, multicolor variables, old `.floating-shapes` shape rules, `.orbit-ring`, shooting-star, the vertical wrap line, and section divider rules in `app/globals.css`. “No grid” means no visual grid/guide/trajectory lines; CSS Grid used for layout remains valid. Do not leave later cascade rules that resurrect random colors, old geometries, orbit rotation, or divider lines.
- [ ] Preserve the existing primary Experience timeline, its `constellationLayout`, and its existing `aria-hidden` constellation decoration exactly as behavior; it is not a grid/orbit/divider. Do not make removal optional and do not remove its points or timeline content.
- [ ] Keep subtle glass only on `.timeline li`/Experience and `.project`/Projects. Explicitly remove or neutralize glass/card framing on `.about-grid`, `.stack-row`, `.beyond`, `#contact`, `.hero-eyebrow`, and `.hero-sub`; Hero, About, Skills, Beyond Code, and Contact must remain open layouts.
- [ ] Keep `PathRail` labels and section IDs exactly as currently implemented. Do not change `app/content.ts` copy or section order.
- [ ] Run `npm test -- tests/hero.test.tsx tests/sections.test.tsx tests/pathrail.test.tsx`. Expected GREEN: old orbit assertion is replaced by no-orbit assertion and all content/labels remain unchanged.

## Task 6 — Lock section invariants and clearance behavior

Files: `tests/page.test.tsx`, `tests/sections.test.tsx`, `tests/pathrail.test.tsx`, `tests/cosmicbackground.test.tsx`.

- [ ] Add a page-level invariant test for exact order and IDs: `hero`, `about`, `skills`, `experience`, `projects`, `beyond`, `contact`. Assert the existing Japanese/English copy through the current content fixtures rather than duplicating or rewriting it.
- [ ] Add assertions that decorative roots are `aria-hidden`, `pointer-events: none`, and have no buttons, links, inputs, or tabindex descendants.
- [ ] Add a pure geometry helper test (or deterministic fixture test) proving every anchor’s declared `clearancePx >= 40` and all left/right safe-margin positions remain outside content-column bounds. Do not claim jsdom can measure actual rendered pixels; reserve pixel clearance for browser validation.
- [ ] Add assertions for desktop/mobile counts from `SCENE_DEFINITIONS`, including Hero L1/M2/S2 and mobile maximum three. Assert that every mobile ID is a subset of desktop IDs, the DOM count equals the desktop definition count exactly, and reused anchors carry mobile CSS variables; the DOM must never contain duplicate mobile anchors.
- [ ] Run `npm test -- tests/page.test.tsx tests/sections.test.tsx tests/pathrail.test.tsx tests/cosmicbackground.test.tsx`. Expected GREEN after Tasks 1–5. These are characterization/regression assertions; if one fails, make only the minimum invariant-preserving correction and do not alter section copy, order, PathRail labels, Experience timeline, or constellation decoration.
- [ ] Run `npm test`. Expected GREEN: all new contract/lifecycle/visual-regression tests and all existing content tests pass.

## Task 7 — Full verification and browser acceptance

- [ ] Run `npm test`. Expected result: Vitest exits 0 with every test passing.
- [ ] Run `npm run build`. Expected result: Next production build exits 0 with no hydration/client-boundary errors.
- [ ] Start the existing local app using `npm run dev` only for manual validation; do not deploy. In the browser, inspect desktop widths and a 390px mobile viewport.
- [ ] Verify the seven sections appear in the unchanged order, all existing copy and controls remain available, and PathRail labels still navigate to the same IDs.
- [ ] Verify at most five shapes are visible in a desktop viewport and at most three in a 390px viewport; verify Hero’s desktop composition is L1/M2/S2.
- [ ] Scroll continuously through the page and verify shapes drift slowly (15–20 second cycles), scroll depth feels subtle, rotation never exceeds six degrees, orb/double-bubble do not rotate, and offscreen scenes pause/resume without a jump.
- [ ] Inspect the tightest shape/content relationships visually and confirm at least 40px of clearance from text, headings, links, buttons, forms, and cards. If an anchor approaches content, adjust only its deterministic scene data and rerun the contract tests.
- [ ] Verify no visual grid, Hero orbit, shooting star, multicolor legacy shape, vertical wrap guide, or section divider is visible. Confirm the Experience timeline and its existing aria-hidden constellation decoration remain present.
- [ ] Enable reduced motion at the OS/browser level, reload, and verify shapes are static: no drift, scroll parallax, rotation, or glow pulsing. Content and contrast must remain intact.
- [ ] Check the browser console for zero unexpected errors and verify decoration never intercepts pointer events or keyboard focus.
- [ ] Review `git diff` and `git status --short`; preserve unrelated user changes. Do not commit, push, deploy, modify secrets, or alter production settings unless separately authorized.

## Risks and mitigations

- **Existing dirty worktree overlaps `app/globals.css` or shape files.** Preserve unrelated hunks, inspect the diff before each edit, and keep changes limited to the approved cosmic layer.
- **Next 16 client/server behavior differs from older examples.** Read the installed local App Router and CSS guides first; keep static scene data import-safe and isolate browser APIs inside effects.
- **Responsive definitions could inflate DOM counts or drift during hydration.** Render one desktop anchor per ID, reuse matching mobile IDs through CSS variables, and hide anchors without a mobile config with CSS; never branch on viewport width during render.
- **Transforms conflict between parallax, autonomous drift, and rotation.** Keep the required three layers: outer anchor for parallax, middle element for drift, inner geometry for rotation/material.
- **jsdom does not calculate real pixel clearance or CSS media visibility.** Test declared bounds/limits in Vitest and verify actual 40px clearance, counts, and reduced-motion behavior in the browser.
- **Decorative cleanup accidentally removes meaningful content.** Keep section components, copy, PathRail, primary Experience timeline, and its existing aria-hidden constellation assertions in the same GREEN loop; remove only the explicitly named orbit/shooting-star/wrap/divider decoration.
- **Animation or observer work causes hydration or performance regressions.** Use deterministic render values, one rAF queue, passive scroll, observer cleanup, no per-render randomness, and static fallback when browser APIs are unavailable.

## Execution handoff

After this plan is approved, choose one execution path:

1. **Subagent-driven implementation in the current session (recommended):** an implementation agent executes one task at a time with the lower-cost model, reports each RED/GREEN result, and the main agent independently reviews the diff, tests, build, and browser acceptance.
2. **Separate execution session:** open a new session using `superpowers:executing-plans`, execute the tasks in order, and return here for review.

In either path, the implementation agent must stop at genuine scope/authority blockers, preserve the dirty worktree, and report the exact changed files and validation results. No commit, push, or deployment is part of this plan.
