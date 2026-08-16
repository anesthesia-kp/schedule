# NEXT CHAT START PROMPT — Daily Schedule

**Written 16 Aug 2026** by the session that shipped schedule admin 49 / staff 25, designed
the foundations, and designed the Reports section. Read fully before touching anything.

Companion to the Vacation Auction's own `NEXT-CHAT-START-PROMPT.md`, which governs that
site. **Keep the two sites in SEPARATE chat sessions** — see `HANDOFF.md` for why, and for
the one case that legitimately crosses over (a Firestore rules change).

---

## ⛔ THE VACATION AUCTION TAKES ABSOLUTE PRIORITY

**This session governs the SCHEDULE site only. It does not govern the Vacation Auction.**

The owner is building the schedule **in parallel** with a live auction serving ~60
anesthesiologists that runs **all year**. Phase 3 began around 17 Aug 2026.

> **No schedule work may degrade the auction — not by a little, not temporarily, not
> "just while testing".** If a schedule change carries any risk to the auction, it does
> not ship, however good it is. If the auction needs attention — a phase opening or
> closing, a results send, an incident — **schedule work stops** until it is settled.
> The auction is production. The schedule is a prototype being built alongside it.

The two share one Firebase project, the roster, and `firestore.rules` (which lives in the
**auction** repo). A schedule rules change is therefore an **auction deploy** — do it from
the auction session, not this one. Full detail in `HANDOFF.md`.

---

## ⚠️ FIRST THINGS TO KNOW

1. **Read `HANDOFF.md` next** — it lists exactly what the two sites share and where the
   guard is. `DECISIONS.md` §1 is the cardinal rule and outranks everything else here.
2. **This repository is PUBLIC** (`github.com/anesthesia-kp/schedule`). Never write a
   reproduction of a security weakness into a file here.
3. **The owner does every git push.** Claude files to the working tree and byte-verifies;
   the owner commits and pushes in GitHub Desktop. Never deploy, never write to
   production Firebase.
4. **Read `DECISIONS.md` before proposing anything.** **29 owner rulings** are recorded
   there, several of which overrule Claude's own recommendation. Do not re-litigate them.

---

## What this is

A daily shift-scheduling site for ~60 anesthesiologists (Kaiser East Bay), sharing one
Firebase project with the live Vacation Auction.

* Staff: `anesthesia-kp.github.io/schedule/` — build **25**
* Admin: `anesthesia-kp.github.io/schedule/admin/` — build **49**
* Repo `anesthesia-kp/schedule`, local at `Documents/GitHub/schedule`
* Its own Firestore collection `dailysched`; its own admin list
  (`dailysched/adminAccess`), independent of the auction's
* Tests in the sibling repo `Documents/GitHub/tests`
* Firestore rules live in the **auction** repo (`vacation-kp.github.io/firestore.rules`,
  the `dailysched` block) — a rules change means a Firebase console publish there

**Status: an advanced prototype.** The owner's words, 15 Aug: *"minimal work has been
done on it, no testing, features not there yet — it's basically just a prototype."*
The demo banner came off on 16 Aug, but it is not in real use yet.

---

## Current state

| page | live | working tree |
|---|---|---|
| admin | 48 | **49 — filed, awaiting push** |
| staff | 24 | **25 — filed, awaiting push** |

**Build 49 / 25** — Shift Eligibility readability rebuild + demo banner removed from both
pages. No rules change, so **no Firebase console step**.

**Build 50 / 26 — WRITTEN, NOT GREEN, NOT IN THE REPO.** Six approved small fixes
(stale-build gate ported from auction 268 · Quick View month-boundary bug · a staff error
surface, the page has none · Users-page lock · missing audit entries · sticky name
column). Its harness is mostly passing but the staff sign-in step is flaky under test —
the page itself is fine, the harness is not. **Finish the harness before filing any of
it.** Details in `HANDOFF.md`.

Gates: `sched/elig-test.mjs` **33/33** executed in a real browser · honesty `--pre`
against the build-48 fixture fails 9, none vacuous · `tests-schedule-isolation.mjs`
9 failures on 48 and 9 on 49, i.e. **zero new writes to the auction** ·
FTE-independence 5/5.

---

## The roadmap — stages 0 to 9

Full detail in `SCHEDULE-FOUNDATIONS-SPEC.md` §6 and `TODO.md`. In short:

0. **Test battery** — grow to vacation-site standard *(started)*
1. **Shift definition** — times, sites, demand rules + 60-day preview, holiday calendar,
   per-page lock, group edit, bulk entry, tag membership *(designed + previewed, NOT built)*
2. **Coverage board** — uncovered shifts
3. **Assignment model** — a list per person per day, never a silent replace
4. **People** — roles + admin-defined groups
5. **Rules section** + conflict report
6. **Safety check + uniform confirmations**
7. **Draft / publish + per-person change feed**
8. **Staff phone view, notifications, Quick View fix** *(movable — pull forward if the
   group starts using the site before the foundations land)*
9. **Reports — ADMIN ONLY** *(designed + previewed, NOT built)*. Per doctor, for a chosen
   day / month / quarter / year / range: how many of each shift they did with **overnight
   call at the top**, a **dated list of every overnight call**, and an **FTE-adjusted
   comparison**. Producible for one doctor or all of them in one page-broken document.
   Needs only the Overnight-call tag — a thin slice of stage 1 — so it can come early.

**Two things that will bite a fresh session:**

* **`kind: 'day' | 'call'` is retired** (25, 27). Tracking is universal and needs no
  configuration; **tags** are what rules, fairness and reports point at. The first tag is
  **Overnight call**, and the owner set its membership to exactly `Call 16`, `Call 24`,
  `OB PM`. **Never derive it** — crossing midnight wrongly catches `RCH-ICU B`, the call
  family wrongly catches `Eye Call` (07:30-15:30) and `Call 12 AM`.
* **Every comparison is FTE-adjusted** (29). The pool excludes per diem and locums; a rate
  is taken per 1.0 FTE across the pool; a person's expectation is that rate multiplied by
  their own FTE. The method must be **printed inside the report** — the owner asked for
  that explicitly.

**Stage 6 was originally going to be first.** It moved back because the owner's 15 Aug
input (two day shifts per person, per-shift demand, a rules section) means a safety check
has nothing correct to check against until 1–5 exist. Do not move it forward again.

---

## What is designed but NOT built

Three interactive previews were delivered and are in `design/`. They are **mockups, not
the app** — no Firebase, no real data.

* `design/elig-grid-preview.html` — the eligibility rebuild (this one **shipped** in 49)
* `design/shift-editor-preview.html` — stage 1: times, sites, stacking demand rules with a
  live 60-day preview, compatibility, per-page master locks, group edit
* `design/reports-preview.html` — the Reports section (stage 9), reusing the auction's
  `REPORT_CSS` **verbatim**. Includes the Overnight-call tag picker, because the report
  cannot work without it. **Per doctor only** — a per-shift report is deferred.

`design/shift-times.xlsx` holds proposed times for all 91 shifts, flagged CONFIRMED
(the owner's own words) vs ESTIMATED (Claude's guess, with reasoning per row). **It is the
intended input for the bulk paste-a-list importer.** The owner edits it; do not regenerate
it and overwrite his edits.

---

## Working discipline — binding

* Smallest change → explicit "go" → only that change. Targeted edits, never a rewrite.
* Every fix ships with tests that **execute** real extracted code, plus an honesty check
  proving they fail on the previous build. A test that passes on the pre-fix bytes proves
  nothing.
* Bump `var BUILD` **and** `versions.json` together.
* Anything that decides who works gets an adversarial audit before it ships.
* **Never present invented data as the owner's.** `DECISIONS.md` §22 exists because
  Claude did exactly that on 15 Aug and was caught. Label every placeholder, every time.
* **No reassurance without an executed reproduction.**
* Plain language — the owner is not a coder. Push back on bad ideas.

## Verification toolbox

In the sibling `tests` repo:

* `tests-schedule-isolation.mjs` — the cardinal rule, plus FTE independence. Static
  analysis over both pages with a comment/string/regex-aware parser and a **canary that
  ABORTS on parser desync** rather than passing vacuously. Mutation-tested: injecting one
  fake `setDoc(userListRef, …)` into the staff page turns it red at the right line.
* `sched/elig-test.mjs` + `sched/fake/*` — drives the real admin page in headless Chromium
  against an in-memory Firestore that records every write. 33 assertions.
  `window.__denyPath` simulates a rules rejection (**sticky**, because `mergeFields`
  retries on failure and a one-shot denial is silently absorbed).

Fixtures: pre-49 admin md5 `7b1a4822a2d1eb66e20a4e22b1e9a9b9`, staff
`9ff369118eebd8b12c253dcb25893d42`. Reconstruct with
`git show <pre-49-ref>:admin/index.html > /tmp/schedpre/admin_index.html`.

Chromium: `PW_CHROMIUM=/opt/pw-browsers/chromium` in a cloud session.

**Still missing** for vacation-site parity: a button sweep, a full-lifecycle run-through,
a never-events list, engine fuzzing, mobile sweeps, an `audit-handlers` equivalent.

---

## Known defects

**29 recorded in `TODO.md`**, evidence-anchored to function names. The ones that will bite
first: request and swap approval bypass every check; a second day shift silently replaces
the first; Quick View breaks outside the browsed month; staff write failures are silent;
`renderAll()` destroys unsaved typing on every snapshot.

---

## Owed, and not yet designed

The Users panel keeps full write access to the auction's roster — the owner's ruling
(`DECISIONS.md` §1), made knowing the hazards. A **phase gate is ruled out**: the auction
runs all year, so "refuse while a phase is live" would block roster changes for twelve
months. The mitigation must instead make those two operations *visible and recoverable*.
Not yet designed. Per-page locks (§20) mean the Users page at least opens locked, which
helps but does not close it.

---

## First moves for the new session

1. Read this file, then `DECISIONS.md`, then `TODO.md`.
2. Verify live builds: `anesthesia-kp.github.io/schedule/versions.json`, cache-busted.
3. Ask the owner where the **Vacation Auction Phase 3** stands before touching anything
   shared.
4. Check the open questions at the top of `TODO.md` — several are one-line answers that
   unblock real work.
5. Then stage 1.

The standard: every claim executed, every fix honesty-proven, every guess labelled as a
guess, the owner's authority absolute.
