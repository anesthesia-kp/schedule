# UX-PLAN — making the schedule admin readable, and what "fully functional" needs

**Overnight deliverable, 18 Aug 2026**, from the owner's directive: diagnose the five
hard-to-read admin sections, learn from the best scheduling products, list the missing
features for 92 shifts / 40 MDs + 40 CRNAs / 24-7 / two sites, and review the code's
organization. Three independent read-throughs fed this: a section-by-section visual audit
of the real code, industry research (QGenda, Amion, Lightning Bolt, Deputy, ShiftAdmin,
When I Work, Humanity, SaniShift, ASRA guidance), and an architecture review.
**The morning question list is at the end and in the chat.** Nothing here is built;
everything is a proposal.

---

## 1 · WHY SHIFT FAMILIES WORKS — the principles everything else should copy

The owner is right that Families is the standout, and the reasons are concrete:

1. **~10 cards, not thousands of cells.** The eye parses ten colored objects.
2. **Full-size labels** — nothing rotated, truncated, or 9px.
3. **Color IS the information** — the family color identifies; it never decorates.
4. **Reading and editing are the same act** — drag a chip, click a swatch; no forms.
5. **Bounded detail per view** — ~9 chips per card; the display doubles as the legend.

The transferable rule, adopted throughout this plan: **first paint fits one screen —
summary first, the full matrix one click away, family color as the one system-wide
encoding.** (The industry research says the same thing from the other direction: every
mature product renders multiple small projections of one dataset instead of one giant
grid.)

## 2 · SECTION-BY-SECTION DIAGNOSIS AND FIXES (admin page, build 64)

### Schedule Grid — 2,480 identical cells at target scale
Hard because: no frozen day header (scroll down and dates vanish); no today/holiday
markers; empty, covered, and SHORT-STAFFED days look identical (coverage is computed on
another page and never reaches the grid); 80 people in one flat alphabetical list with no
MD/CRNA/site grouping or filter.
**Fixes, ranked:** (1) frozen header + today tint + holiday dots — trivial, the
eligibility grid already owns the pattern; (2) person/role/site filter bar + colored group
divider rows; (3) a per-day coverage strip above the grid (green/amber/red counts from the
existing `coverageRows()`) so "where are the holes" is a scan for red; (4) a
compact/detail density toggle — compact shows a family-colored block + count per cell,
which survives 80 rows the chip list cannot.

### Shift Eligibility — 7,360 cells, already the best of the five, still too many
Hard because: the DEFAULT is everything (the "All" filter preselected); the edit unit is
one cell when the real-world unit is "this person can do all ICU"; rotated 10.5px labels
truncate at 80px.
**Fixes:** (1) default to ONE family, "All" one click away — trivial; (2) a person-first
mode: click a person, get the Families board with that person's chips toggleable — the
edit unit finally matches the mental unit; (3) promote the buried per-family bulk buttons
to full size; (4) segment the per-row summary bar by family color.
**Note:** stage 4 (subgroups grant, ticks become exceptions) will shrink this page's job
dramatically — deep redesign should WAIT for stage 4 and land as the subgroup editor.

### Shift Catalog — ~1,000 live input controls rendered at once
Hard because: every row shows 11 editable fields all the time with NO column headers —
meaning lives in hover tooltips; exception states (missing time, no site, no demand) use
four different amber/red encodings while healthy rows shout just as loudly.
**Fixes:** (1) **read-first rows** — one quiet display line per shift (pill · times ·
site · demand · cap · warnings badge) with a ✎ that opens editing for that row only;
kills ~900 controls and most of the mid-edit-freeze complexity; (2) sticky column-header
row + pinned filter bar; (3) family headings become collapsible colored bands (92 rows →
~10 groups); (4) the summary card's problem counts become clickable filters.

### Stats — a 94-column × 80-row pivot dump
Hard because: mostly-empty cells, no totals, no sticky name column or header, raw catalog
column order, and the page's own stated question ("is call evenly distributed?") is
answered at the wrong grain — per-shift instead of per-family.
**Fixes:** (1) **collapse columns to families by default** (~14 columns, fits one
screen), click a family header to expand its shifts; (2) sticky names + header + per-person
Total column + group mean row; (3) cell background intensity scaled to value vs column
mean — "even?" becomes "look for dark cells"; (4) sortable call-total column + the
eligibility grid's crosshair hover.

### Reports — two 90-chip walls and settings-before-use
Hard because: the overnight-call tagger lists all 92 shifts flat (call shifts are
identifiable and there are ~15); the comparison pool lists 80 people flat; the two
rarely-touched settings cards sit ABOVE the run-a-report cards; batch output is 80
unlabeled blocks with no index.
**Fixes:** (1) group both chip walls by family / by MD-CRNA with bulk buttons — trivial;
(2) reorder: run first, settings collapsed at the bottom; (3) demote the explanatory prose
to "ⓘ why" disclosures (keep every word — it's decision history); (4) a name index atop
the batch report.

### Cross-cutting (one visual system)
Generalize the eligibility grid's `.eg` machinery (sticky both axes, family bands,
crosshair, filter chips) into THE dense-grid component and retire the weaker `table.grid`
from Grid/Stats/Users/Baseline/Coverage. Family color everywhere; kill the one-off
palettes. Shared filter bar (person / MD·CRNA / site / family) in the same position on
every data page. Type floor: nothing data-bearing below 11px on desktop.

## 3 · WHAT THE BEST PRODUCTS DO (adopted patterns)

From the research, the patterns worth adopting, in one line each: multiple projections of
one dataset (admin grid · calendar · day board · personal view) rather than one giant
grid; BOTH swimlane orientations — people-rows for load/fairness, shift-rows for coverage
holes; a **"who's on now" board** as a first-class page (time-aware, grouped by site,
contacts one click away — the most frequent 24/7 query is not "show me March"); color =
family, red reserved exclusively for uncovered/violation; a per-day coverage strip;
**draft vs published as a visual language** (muted/hatched vs solid) with publish
triggering notifications; frozen panes + density controls + hover detail cards instead of
inline-everything; live fairness tallies beside the grid while editing; print day-sheet
per site; mobile = agenda list, never a shrunken grid.

## 4 · MISSING FEATURES for 92 shifts / 80 clinicians / 24-7 / two sites

**Table stakes we already have** (or have approved): eligibility model, approval-checked
assignment, swaps with a target-accept step, audit trail, calendar feeds (§54a, approved),
e-mail digests (approved direction), stale-build gating, backups (auction pattern to port).

**Table stakes we're missing** — the gap list, roughly ordered by how often the industry
treats them as core: **draft → publish** with per-assignment state and scoped bulk publish
(stage 7 — the research says this is the single most defining feature of real products);
**who's-on-now board with contacts**; open-shift claiming for sick-call backfill (we have
posting; claiming exists — needs eligibility-filtered notifications); live violation
badges IN the grid (we warn at approval; the grid itself stays silent); per-person
**weighted** fairness tallies visible while editing; a **day-of board** (room assignments,
first-call/late ladder, relief order — the layer generic tools lack and anesthesia
departments need most); post-call protections as hard rules (§44's engine); holiday/
weekend equity with multi-year memory; **MD/CRNA supervision-ratio pairing rules** (newly
relevant with 40+40); credential/site eligibility (our site-per-shift covers part);
self-scheduling preference windows; payroll-ready exports.

**The weighted-burden point deserves its own line** (SaniShift/ASRA): two people with the
same COUNT of shifts can carry very different burden — late rooms, weekends, holidays,
repeat call. Raw counts (our stats today) will not settle fairness arguments in an
80-person group; weights will. This should be a stage-5 design input, not an afterthought.

## 5 · THE ROSTER QUESTION — biggest architectural fork, must be answered first

Tonight's directive said **40 MDs AND 40 CRNAs**. Every existing plan assumes the
schedule's people ARE the MD auction's roster (`vacations/userList` — the §1 sanctioned
exception exists for exactly this). CRNAs now have their own auction with its own roster
in a DIFFERENT Firebase project the schedule cannot see. Three options, morning question
#1: (a) schedule reads BOTH auction rosters (requires cross-project reads — new
machinery); (b) **the schedule gets its OWN roster**, seeded by import from either
auction, edited in its own Users page (decouples §1's dangerous shared-write path — the
Users page would stop writing the live auction at all, which retires the scariest thing
the schedule does); (c) MD roster stays shared, CRNAs hand-entered schedule-only.
Option (b) is my recommendation — it simplifies safety, matches "categories on the
person" (§53), and the auctions keep their rosters for bidding untouched.

## 6 · CODE ORGANIZATION — verdict and plan

**The owner's instinct is right on both halves: the format is genuinely decent, and more
thought is needed before the next growth wave.** Strengths worth naming: navigational,
decision-preserving comments (build tags, § cross-references); ONE eligibility checker
(`allowed()`) and ONE warnings checker routed through all paths (build 61) — stage 4/5
land in one place; the [59] and [63] migration playbooks are in-file precedents for every
migration still to come.

**The two real problems, in priority order:**
1. **`renderAll()` fan-out**: ~21 listeners, 8 of which redraw ~20 panels including
   hidden ones, on every snapshot. The build-64 typing guards are patches on this — four
   copies exist and every future editable surface would need another. **Fix once**: dirty
   flags per panel + render only the visible panel on a frame tick. Retires the defect
   class, ~10× less work per snapshot, no framework, ~a day.
2. **The three `{list:[]}` documents** (requests, swaps, openShifts) are the only things
   that actually BREAK at 80 users (write contention on publish days + unbounded growth).
   Migrate to per-item docs on the [63] audit pattern BEFORE the roster doubles.
   (Known as defect 8's remainder; this confirms sequencing: before stage 4's rollout.)

**Also approved-shape housekeeping:** a table-of-contents comment + numbered greppable
section banners (`§S07 SWAPS — owns: swaps; writes: swapsRef`) including the six unbannered
sections; merge the stray second `<style>` block; and when stage 5 is built, write the
engine as a sentinel-marked PURE block (no DOM, no Firestore, no globals) so the battery
extracts it verbatim — the file already proves that style works. A build-step split of the
page is NOT recommended yet; revisit only when the engine block pushes past ~8k lines.

## 7 · PROPOSED SEQUENCE (each its own gated build; order adjustable)

1. **Housekeeping build**: TOC + section banners + merged styles (no behavior change).
2. **Render rework**: dirty-flag rendering, retire the four typing guards for one helper.
3. **Quick-wins visual batch** (no redesigns): sticky headers/columns everywhere · today
   + holiday markers · eligibility defaults to one family · stats family-collapse +
   totals + sticky · reports reorder + grouped chips · catalog column headers + sticky.
4. **List migrations**: requests → swaps → openShifts, per-item docs, [63] pattern.
5. **Roster decision implemented** (per morning Q1).
6. **Stage 4**: categories + subgroups + §56 cutover (the eligibility redesign rides in).
7. **Grid upgrades**: coverage strip, filters, density toggle, shifts-rows view.
8. **Catalog read-first rows.**
9. **Stage 5**: the rules engine (pure block) — §44, with weighted burden and pairing
   rules as design inputs.
10. Then stage 7 (draft/publish), the day board, who's-on-now, stage 8 phone view —
    ordered by the morning answers.

---

## 8 · THE MORNING QUESTIONS (also posted in chat — quick answers are enough)

1. **Roster**: (a) read both auctions' rosters · (b) schedule gets its OWN roster —
   recommended · (c) share MD, hand-enter CRNAs?
2. **Quick-wins visual batch** (item 3 above, no redesigns): go?
3. **Architecture pair** (TOC/banners + dirty-flag render rework): go?
4. **List migrations before stage 4**: confirmed?
5. **Grid**: coverage strip + filters + density toggle: go? And the shifts-rows
   coverage view: yes/later?
6. **Day board** ("who's on today/now", per site, contacts): build? Should it become
   the admin landing page?
7. **Catalog read-first rows**: go?
8. **Family color as the universal system** (stats headers, report chips, everywhere): yes?
9. **Top three missing features** to schedule after stage 5 — pick 3: draft/publish ·
   who's-on-now · open-shift claim alerts · in-grid violation badges · weighted fairness
   tallies · day-of OR board · holiday multi-year equity · supervision-ratio pairing.
10. **Supervision ratios** (medical-direction pairing, e.g. 1 MD : N CRNAs): must-model /
    later / not applicable?
11. **Fairness**: weighted burden (late/weekend/holiday weights) or raw counts for now?
12. **Print day-sheet** per site: yes / later?
13. **Sequence in §7**: approve as ordered, or reorder?
