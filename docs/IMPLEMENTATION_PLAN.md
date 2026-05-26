# ASCII Canvas — Implementation Plan

> Single source of truth for the build. The **orchestrator** and **implementor** agents both read this file.
> When a phase merges, the orchestrator ticks its box in **Status** and commits that change to `main`.

---

## 1. Vision

A client-only web app that turns an uploaded image into a **staged, animated ASCII reconstruction** and lets the user scrub between states and download them. The animation tells a story:

```
blank → dots grow in from the center → dots morph into shape-matched ASCII glyphs (mono)
      → glyphs flood with color → colored ASCII cross-fades into the real image
```

Everything runs in the browser. The image never leaves the device.

---

## 2. Locked decisions

These were resolved up front. **Do not re-litigate them** without an explicit instruction in a handoff.

| # | Decision | Locked answer |
|---|---|---|
| 1 | Framing | Single-screen **tool** — no landing/marketing copy, no scroll on desktop; upload is visible immediately. |
| 2 | Quality engine | **Shape-based 6-D glyph matching** (6 sampling regions/cell → glyph shape vectors → k-d tree nearest-neighbour + quantized cache) **plus DoG + Sobel edge detection** contributing directional glyphs (`| / \ -`) on contours. Edges always on in v1. |
| 3 | Grid density | **Adaptive** default (~150–200 chars wide, derived from aspect ratio) **+ a user quality/density slider**. Monospace cell aspect corrected (~0.5 w:h) so the image isn't squished. |
| 4 | States | **4 canonical states** (scrub stops + export targets): **Dot grid → Mono ASCII → Color ASCII → Real image.** Blank is the animation's starting frame only, not a stop. |
| 5 | Choreography | Dots **grow center-out**. Dot→glyph morph and glyph→color flood reveal **random per-cell**, with a fade/scale on each cell. |
| 6 | Playback | On upload, **auto-play the full animation once**, then rest on the final state. Then: scrub between states, **Replay**, and a **speed** control. No mid-animation pause required. |
| 7 | First load | **Auto-demo** on a bundled image, with the upload control present. |
| 8 | Exports | **High-res PNG** (re-rendered offscreen at high DPI) of any selected state **+ `.txt`** of the raw characters for the ASCII states. PNG background is selectable: **white / black / transparent**. |
| 9 | Persistence | **Fully ephemeral, client-only.** No accounts, no backend, no storage. The image is never uploaded anywhere. |
| 10 | Mobile | **Desktop-first, mobile usable.** Canvas fits the viewport (letterboxed to image aspect); controls collapse to a compact bar; default density auto-lowers on small / low-power devices. |
| 11 | Upload | Accept **JPG / PNG / WebP / GIF (first frame)**, **~15 MB cap** with a friendly error. Internally **downscale** the source to ~2× the grid dimensions before sampling. Drag-drop + click + paste. |
| 12 | Aesthetic | **Clean, light, neutral, gallery-like.** Art framed center. Use the `impeccable` skill for UI craft in Phase 8. |
| 13 | State mgmt / render | **Zustand** for state; **Canvas 2D + `requestAnimationFrame`** for rendering (compute is one-time per image/density, so WebGL is deliberately avoided). |

**Demo image:** `public/demo/macaw.jpg` — [Colorful macaw portrait](https://unsplash.com/photos/a-colorful-macaw-looks-directly-at-the-camera-ZySAv7WS6vI) on Unsplash (Unsplash License). Image ID `photo-1743228732896`; photographer credit on the [photo page](https://unsplash.com/photos/a-colorful-macaw-looks-directly-at-the-camera-ZySAv7WS6vI).

---

## 3. Tech stack

- **Next.js (App Router) + TypeScript (strict)**, deployed on **Vercel**.
- **100% client-side.** No API routes touch the image. No server-side image processing.
- **Tailwind CSS** for styling.
- **Zustand** for app state (source image, cell model, current state, density, speed, playback status).
- **Canvas 2D + `requestAnimationFrame`** for display rendering.
- **Web Worker** for the one-time, per-image / per-density compute (pixel sampling, shape matching, edge pass, color averaging). Keeps the UI at 60fps during compute.
- **Offscreen high-DPI canvas** for PNG export; `Blob` for `.txt` export.
- **Vitest** for unit tests (the engine is pure logic and genuinely worth testing). **ESLint + Prettier**.

---

## 4. Acceptance criteria (whole project)

- Upload a JPG/PNG/WebP/GIF ≤15 MB → the full animation auto-plays once, then rests on the final state.
- ASCII output is **clearly recognizable** as the source image (shape-based fill + DoG/Sobel edge glyphs).
- User can scrub to any of the 4 states, change the density/quality slider (recomputes off-thread), and adjust playback speed / replay.
- Download the selected state as a **crisp high-DPI PNG** (white/black/transparent bg) and ASCII states as **`.txt`**.
- First load shows an **auto-demo**; no network request ever carries the user's image; single-screen, no desktop scroll; usable on mobile.
- **Deployed and working on Vercel.**

---

## 5. Repository & workflow conventions

- **Branch per phase:** `phase-<n>-<slug>` (e.g. `phase-2-ascii-engine`), branched from an up-to-date `main`.
- The **implementor** commits to its branch and **does not push or merge**.
- The **orchestrator** pushes the branch, opens a **GitHub PR** (review written as the PR body), and **squash-merges** via `gh` on a clean review — stopping and returning a fix-up prompt if it finds issues.
- Commits: clear, logical, present-tense subjects. AI commits include the trailer:
  `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`
- Never force-push `main`; never `--no-verify`; stage specific files (no blind `git add -A`).
- Each phase must leave `main` (after merge) in a **green state**: `lint`, `typecheck`, `test`, and `build` all pass.

See **`docs/ORCHESTRATOR.md`** and **`docs/IMPLEMENTOR.md`** for the agent operating manuals, and **`docs/SETUP.md`** for human bootstrap (origin/token, the relay loop).

---

## 6. Phases

Each phase is sized to complete in a single implementor session. For every phase the implementor must satisfy **Definition of Done** and respect **Out of scope / must not touch**.

---

### Phase 1 — Scaffold & app shell
**Objective:** A runnable, gallery-styled single-screen skeleton with a placeholder canvas and inert controls. No engine yet.

**Scope:**
1. Scaffold Next.js (App Router, TypeScript strict) + Tailwind into this existing repo (git already initialized; `docs/` already present). Add ESLint + Prettier + Vitest config.
2. Build the single-screen layout (clean light/neutral; art framed center; a control region). Reserve a `<canvas>` element and a control bar that collapses on mobile.
3. Create the Zustand store with typed shape: `{ sourceImage, cellModel, currentState, density, speed, playbackStatus }` and no-op actions.
4. Add placeholder controls (upload affordance, state toggle, density slider, speed control, replay, download) wired to no-op handlers.

**Key files/artifacts:** `app/`, `app/page.tsx`, `app/layout.tsx`, `components/` (Canvas placeholder, ControlBar), `store/`, config files (`next.config`, `tailwind.config`, `eslint`, `vitest.config`).

**Out of scope / must not touch:** no ASCII logic, no workers, no real upload handling, no animation.

**Definition of Done:** `npm run dev` shows the final layout with inert controls; no desktop scroll; `lint`, `typecheck`, `build` pass; Vitest runs (even if zero tests).

---

### Phase 2 — Core ASCII engine: shape-based mono fill
**Objective:** A pure, tested module: `ImageData + density → 2-D grid of shape-matched glyphs` (monochrome).

**Scope:**
1. **Glyph atlas:** render the printable ASCII set to an offscreen canvas; compute each glyph's **6-region shape vector** (3×2 staggered sampling circles per cell); normalize each component by its max across glyphs.
2. **Fast lookup:** build a **k-d tree** over glyph vectors + a **quantized cache** (≈5 bits/component) for near-instant nearest-neighbour selection.
3. **Cell sampling:** sample the same 6 regions per image cell; compute adaptive grid dimensions from aspect ratio + density level; apply **monospace aspect correction** (~0.5 w:h).
4. **Global contrast enhancement:** normalize the sampling vector by its max, raise to a tunable exponent, denormalize (per Alex Harri's method).
5. **Tests (Vitest):** deterministic glyph selection on synthetic tiles (solid/gradient/edge), grid-dimension math, aspect correction, k-d tree vs brute-force agreement.

**Key files/artifacts:** `lib/engine/glyphAtlas.ts`, `lib/engine/kdtree.ts`, `lib/engine/sampling.ts`, `lib/engine/fill.ts`, `lib/engine/__tests__/`.

**Out of scope / must not touch:** no edges, no color, no worker, no React wiring. (A throwaway debug dump to eyeball output is allowed but must not become app code.)

**Definition of Done:** tests green; a debug render of a sample image is recognizable in monospace.

---

### Phase 3 — Edge pass + color → complete cell model
**Objective:** Extend the engine to the full per-cell model `{ char, color, isEdge }`.

**Scope:**
1. **Difference-of-Gaussians** prefilter, then **thresholded Sobel** → per-cell edge magnitude + direction.
2. Map edge direction → directional glyph (`| / \ -`); **override** the fill glyph where edge strength exceeds a threshold.
3. Per-cell **average color** from the source pixels covering that cell.
4. Assemble the unified `CellModel` consumed by renderer + animation.
5. **Tests:** edge-direction→glyph mapping; color averaging; threshold behavior on synthetic edges.

**Key files/artifacts:** `lib/engine/edges.ts`, `lib/engine/color.ts`, `lib/engine/buildCellModel.ts`, types in `lib/engine/types.ts`, tests.

**Out of scope / must not touch:** no worker, no React wiring, no rendering to the visible canvas.

**Definition of Done:** debug render shows contours picking up directional glyphs and correct per-cell colors; tests green.

---

### Phase 4 — Upload pipeline + Web Worker
**Objective:** Real image in → worker computes the cell model off the main thread → final static state available; density slider recomputes.

**Scope:**
1. Upload via **drag-drop, click, and paste**; validate format + size (≤15 MB, friendly errors); decode; **downscale** to ~2× grid dimensions.
2. Move the engine into a **Web Worker**; define the message contract (`{ imageData, density } → CellModel`); handle transfer/serialization (transferables where possible).
3. Wire the store: on upload / density change, dispatch to the worker, show a lightweight processing indicator, store the returned `CellModel`.

**Key files/artifacts:** `lib/upload/`, `workers/engine.worker.ts`, worker client in `lib/engine/client.ts`, store actions.

**Out of scope / must not touch:** no animation yet; rendering may be a minimal static draw only if needed to verify (full renderer is Phase 5). Do not alter engine math from Phases 2–3 except to adapt it to the worker boundary.

**Definition of Done:** uploading several real photos produces cell models without freezing the UI; bad files error gracefully; density changes recompute.

---

### Phase 5 — Canvas renderer + 4 static states
**Objective:** Render any of the 4 canonical states statically from the cell model.

**Scope:**
1. **Canvas 2D renderer:** draw glyphs per cell at display resolution, fit-to-viewport letterboxed to image aspect, `devicePixelRatio`-aware (crisp on retina).
2. Derive the 4 states from the `CellModel`: **Dot grid** (all `.`), **Mono** (chars, no color), **Color** (chars + color), **Real image** (draw source).
3. Wire the state toggle to switch renders instantly.

**Key files/artifacts:** `lib/render/canvasRenderer.ts`, `lib/render/states.ts`, Canvas component, store wiring for `currentState`.

**Out of scope / must not touch:** no animation/timeline yet; no export.

**Definition of Done:** all 4 states render crisply and switch instantly; canvas re-fits correctly on window resize.

---

### Phase 6 — Animation engine
**Objective:** The full choreographed animation with playback controls.

**Scope:**
1. A `requestAnimationFrame` timeline driving per-cell progress.
2. Transitions: **center-out** dot reveal; **random per-cell** dot→glyph morph (fade/scale); **random per-cell** color flood; **cross-fade** Color→Real image.
3. **Auto-play once** on upload → rest on final; **Replay**, **speed** control, and **scrub** (jump to any state, rendered deterministically).

**Key files/artifacts:** `lib/animation/timeline.ts`, `lib/animation/reveal.ts` (ordering: center-out, seeded-random), playback store wiring.

**Out of scope / must not touch:** no export; don't regress static rendering from Phase 5.

**Definition of Done:** smooth end-to-end animation (≈60fps target on desktop); scrubbing lands exactly on each state; replay/speed work; a deterministic seed makes "random" reproducible for a given image.

---

### Phase 7 — Export
**Objective:** High-quality downloads of any state.

**Scope:**
1. **Offscreen high-DPI renderer** (large fixed cell size) decoupled from the display canvas.
2. **PNG export** of the selected state with selectable background (white/black/transparent) via `canvas.toBlob()`.
3. **`.txt` export** of raw characters for the ASCII states.

**Key files/artifacts:** `lib/export/png.ts`, `lib/export/txt.ts`, download wiring in controls.

**Out of scope / must not touch:** no animated/GIF/MP4 export (deferred); don't change the display renderer's behavior.

**Definition of Done:** exported PNG is visibly crisper than the on-screen preview; `.txt` matches rendered glyphs; all three backgrounds apply correctly.

---

### Phase 8 — Auto-demo, responsive, perf safeguards & UI polish
**Objective:** Production feel: first-load demo, mobile usability, performance guards, and design craft.

**Scope:**
1. Bundle the **demo image** in `public/demo/` (record source + photographer in §2 of this file); auto-run the animation on first load with the upload control present.
2. **Responsive pass:** control bar collapses on mobile; canvas always fits; auto-lower default density on small / low-power devices.
3. **Perf guards:** cap working resolution; debounce density recompute; guard very large grids.
4. **UI craft** using the `impeccable` skill (typography, spacing, control states, empty/error/processing states, micro-interactions; `emil-design-eng` for motion polish).

**Key files/artifacts:** `public/demo/`, responsive styles, perf guards in upload/worker, polished components.

**Out of scope / must not touch:** no new features beyond polish; don't alter engine output quality.

**Definition of Done:** first load shows the demo animating; usable on a phone; no jank on large images; UI feels finished.

---

### Phase 9 — Deploy & QA
**Objective:** Live on Vercel, verified across browsers.

**Scope:**
1. Production build; deploy to Vercel.
2. Cross-browser/device QA against the whole-project acceptance criteria; fix regressions.

**Key files/artifacts:** Vercel config if needed; QA fix commits.

**Definition of Done:** all acceptance criteria pass on the deployed site.

---

## 7. Deferred (NOT in v1)

Animated GIF/MP4/WebM export · shareable links · accounts/history · edge-overlay on/off toggle · configurable reveal patterns (spiral/scanline) · server-side processing.

---

## 8. Status

- [x] Phase 1 — Scaffold & app shell
- [x] Phase 2 — Core ASCII engine: shape-based mono fill
- [x] Phase 3 — Edge pass + color → complete cell model
- [x] Phase 4 — Upload pipeline + Web Worker
- [x] Phase 5 — Canvas renderer + 4 static states
- [x] Phase 6 — Animation engine
- [x] Phase 7 — Export
- [ ] Phase 8 — Auto-demo, responsive, perf safeguards & UI polish
- [ ] Phase 9 — Deploy & QA

---

## 9. Handoff log

> The orchestrator appends a one-line entry per merged phase (date, branch, PR link, one-line outcome). Newest last.

2026-05-26 — phase-1-scaffold — PR #1 — Next.js scaffold, gallery shell, Zustand store, inert controls
2026-05-26 — phase-2-ascii-engine — PR #2 — Shape-based mono fill engine (6D vectors, k-d tree, cache, 21 tests)
2026-05-26 — phase-3-cell-model — PR #3 — DoG+Sobel edges, per-cell color, buildCellModel, store CellModel wired
2026-05-26 — phase-4-upload-worker — PR #4 — Upload pipeline, worker compute, density recompute, static preview
2026-05-26 — phase-5-renderer — PR #5 — DPR canvas renderer, 4 static states, AsciiCanvas replaces preview
2026-05-26 — phase-6-animation — PR #6 — rAF timeline, seeded reveals, auto-play/replay/speed, scrub to static
2026-05-26 — phase-7-export — PR #7 — High-DPI PNG + .txt export, background toggle, downloadState wired
