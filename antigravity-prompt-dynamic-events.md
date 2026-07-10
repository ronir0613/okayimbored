# Prompt for Antigravity: Making okayimbored's Event System Feel Alive

## Context (paste flowchart.md and CLAUDE.md alongside this, or reference them)

`okayimbored` is an atmospheric interactive site driven by independent `Math.random()` checks scattered across `Experience.tsx` and the room components (`TheBasement.tsx`, `TheLobby.tsx`, `RadioRoom.tsx`, `TelephoneRoom.tsx`, `CatDepartment.tsx`, `Archive.tsx`, `NoticeBoard.tsx`, `MaintenanceRoom.tsx`, etc.). The full probability structure is documented in `flowchart.md` — read it before touching anything.

**The problem:** every roll is independent and stateless. The same visitor can see the same false ending, the same artifact, the same telephone call, repeatedly, with no memory across sessions and no relationship between the odds and what the visitor actually did. This makes a system built entirely on randomness *feel* static and repetitive.

## Hard constraint — READ THIS FIRST

**Do not modify visual styling, Tailwind classes, component layout/markup structure, fonts, colors, spacing, or anything covered by `DESIGN.md` unless a specific task below explicitly requires new UI (e.g. a new small copy variant slot, a subtle "seen before" indicator). If a task can be done as a pure logic/data change with zero visual footprint, do it that way. If new UI is unavoidable, keep it minimal and strictly matching the existing monochrome/Vercel-inspired design language — do not introduce new colors, shapes, or components without flagging it to me first for approval.**

Treat this as a backend/logic refactor, not a redesign. When in doubt, ask before touching any `.astro`/`.tsx` markup or Tailwind classes.

---

## Goal

Restructure the probability and content-selection logic (not the visual experience) so that:
1. Fixed-pool content (false endings, artifacts, telephone calls, notice board items, secret rooms) doesn't repeat for a visitor until the full pool has been exhausted.
2. Very rare events (sub-1% tier) become *more* likely the longer a visitor goes without triggering one, and reset once they do (soft pity system) — without changing the advertised/average long-run probability by more than is necessary for the pity mechanic to function.
3. The site can recognize a returning visitor and let that inform (not force) content selection and copy.
4. A handful of guaranteed/common moments (Step 2 stats line, outro suggestion list, standard telephone calls) get 3–4 low-effort copy variants instead of one hardcoded string, rotated per visit.
5. None of this requires a login system — it's all local-first (localStorage/sessionStorage) with optional Supabase sync if a `visitor_id` mechanism already exists or is trivial to add via `supabase.ts`.

---

## Task 1 — Visitor memory layer (foundation, do this first)

Create a new module, e.g. `src/lib/visitorMemory.ts`, responsible for:
- Generating and persisting a stable anonymous `visitorId` (localStorage, not cookies) — reuse existing session/return logic in `Experience.tsx` if a similar id already exists; don't duplicate it.
- Storing a lightweight visit record: `{ visitCount, lastVisitTimestamp, lastShift, seenPools: { falseEndings: [], artifacts: [], telephoneCalls: [], noticeBoardRareEvents: [], secretRooms: [] }, pityCounters: { [eventKey]: number } }`.
- Exposing simple get/set/reset helpers: `getVisitorMemory()`, `recordSeen(poolKey, itemId)`, `getPityCount(eventKey)`, `incrementPity(eventKey)`, `resetPity(eventKey)`, `isReturningVisitor()`.
- Keep this framework-agnostic (plain TS, no React) so it can be imported anywhere, same pattern as `shift.ts` and `archaeology.ts`.
- If Supabase (`supabase.ts`) already logs sessions server-side, check whether visitor memory should sync there too — flag this as an open question rather than assuming.

No UI changes required for this task.

---

## Task 2 — Shuffle-bag selection for finite content pools

Refactor the following from "pick uniformly random every time" to "shuffle bag, no repeats until exhausted, per visitor":
- False ending type selection (Step 8, currently `Math.floor(rand*10)+1` for types 1–10; keep Type 11's separate 0.01% rare-event gate untouched, but once it *does* fire, it shouldn't fire again for the same visitor — mark it permanently seen, don't refill it into the bag).
- `getRandomArtifact()`'s standard 26-item pool in `archaeology.ts` (keep the 0.1% rare-artifact roll as a separate, non-bagged layer — see Task 3).
- Telephone room's 8 standard calls in `TelephoneRoom.tsx`.
- Secret room selection (currently equal-weight random among 7 rooms) — bag these too, so a visitor cycles through all 7 before repeating.
- Notice board's 6 note pools, if pulling a subset each visit currently allows immediate repeats.

Implementation approach: a small reusable utility, e.g. `src/lib/shuffleBag.ts`, exporting something like:
```ts
function drawFromBag<T>(poolId: string, items: T[], visitorMemory): T
```
which internally checks `seenPools[poolId]`, filters out already-seen items, picks randomly from the remainder, records the pick, and reshuffles (clears seen list for that pool) once exhausted. Make sure reshuffle doesn't immediately re-serve the item that was just drawn (avoid back-to-back repeat on refill).

Preserve all existing *rare* gating logic (the 0.1%/0.01%/etc. checks that decide *whether* a pool is drawn from at all) — this task only changes *which item* is picked once a draw is triggered, not how often draws happen.

---

## Task 3 — Soft pity counters for sub-1% events

Pick the events already flagged as rarest in `flowchart.md` (Type 11 false ending, rare artifact 0.1%, Archive's 0.01% "still writing history," CatDepartment's 0.01% classified employee, Notice Board's 0.01% "Thank you." only, Maintenance's 0.01% "Better" status, Lobby's 0.01% tiny text, Basement's 0.01% hidden text, Telephone's 0.01% "you answered").

For each, using the pity counter helpers from Task 1:
- Track rolls-since-last-hit per visitor per event key.
- Nudge the effective probability upward gradually as the counter climbs (e.g. a mild multiplier or additive bump — pick a curve that keeps the event still feeling rare, not guaranteed; don't let the adjusted probability exceed roughly 2–3x baseline even at max drought). Reset the counter to 0 the moment the event fires.
- This should be an easily tunable constant per event (a multiplier curve or lookup table), not hardcoded inline, so probabilities can be tuned later without touching logic.

Do NOT apply pity to the highest-frequency events (0.5%+ tier) — leave those as pure independent RNG. Pity is only for the sub-1% "visitor might genuinely never see this" tier.

---

## Task 4 — Returning-visitor awareness (subtle, content-only)

Using `isReturningVisitor()` / `visitCount` / `lastShift` from Task 1:
- Step 2's stat line, false ending copy, and/or `/tonight` logbook may optionally branch on "first visit" vs "returning visit" — but only where a copy variant already naturally fits (see Task 5) or where a single small conditional string swap is trivial. Do not restructure layout to accommodate this.
- If `lastShift` differs from current shift (e.g. they were here at night, now it's day), that's a nice hook for `/tonight` logbook copy or a false-ending line — flag candidate spots in your response rather than guessing at new copy yourself; I'll review actual wording.
- Do not add any visible "welcome back" UI element unless I explicitly ask for one later — keep this invisible/contextual only.

---

## Task 5 — Copy variants for guaranteed/common moments

For these specific guaranteed (100%-per-visit) moments, add 3–4 phrasing variants stored as simple arrays, selected via the shuffle-bag utility from Task 2 (scoped per visitor so they don't repeat on the *same* visitor across sessions until exhausted):
- Step 2's `'{boredPercentage}% said they were bored.'` framing sentence (the stat itself stays live/real — only the surrounding sentence template varies).
- Step 3's fixed lines ("Cats ignore approximately 93%...").
- Outro Step 8's "Maybe try one of these" intro line.
- Standard telephone call opener lines (separate from the 8 distinct call contents — just the tiny connective phrasing if any exists).

Keep new copy minimal in scope — you are duplicating existing sentences into small arrays with light rewording, not inventing new content directions. Draft the variants and show them to me before finalizing wording, since tone consistency with `DESIGN.md`'s "premium, stark, calm" voice matters a lot here.

---

## Explicitly out of scope for this pass

- The cross-room "thread" / narrative-callback system (linking Archive → Basement → Notices rare events into a payoff chain) — bigger feature, separate prompt later.
- Behavioral-signal triggers (idle hesitation, rapid clicking, dwell time influencing odds) — separate prompt later.
- Anything in `DESIGN.md`, component markup, Tailwind classes, animations, or layout.
- Server-side/Supabase schema changes beyond what's trivially needed to persist `visitorId` — flag, don't implement, if this turns out to be non-trivial.

---

## Deliverable format

1. New/modified files list with a one-line description of each change.
2. Confirm no `.astro` markup, Tailwind classes, or component layout was touched except where explicitly flagged as unavoidable (and call those out clearly, separately, before I approve them).
3. A short note on where pity-curve constants and copy-variant arrays live, so I can tune them without re-reading the whole diff.
4. Anything you're unsure about (Supabase sync, pity curve shape, wording) — ask rather than assume.
