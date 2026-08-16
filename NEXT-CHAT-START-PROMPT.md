# NEXT CHAT START PROMPT — Daily Schedule

**Written 16 Aug 2026** by the session that shipped schedule admin **51** (Reports),
designed request types, the assignment model and the rules section, and recorded owner
rulings 35–41. Read fully before
touching anything.

**Build numbers in this file go stale the moment the owner pushes.** Every one of them is
written as "live X · filed Y". Verify against a cache-busted `versions.json` before you
believe any of them — that is step 2 under *First moves*, and it is not optional.

Companion to the Vacation Auction's own `NEXT-CHAT-START-PROMPT.md`, which governs that
site. **Both sites are worked in ONE chat, moving between them** — owner decision 16 Aug,
after trying it for a day; see `HANDOFF.md`. That works *because* the sites are
deliberately convergent, and because the repos hold the memory rather than the chat.
It does not soften the priority rule below by one inch.

---

## ⛔ THE VACATION AUCTION TAKES ABSOLUTE PRIORITY

**This session governs the SCHEDULE site only. It does not govern the Vacation Auction.**

The owner is building the schedule **in parallel** with a live auction serving ~60
anesthesiologists that runs **all year**. Phase 3 began around 17 Aug 2026.

**As of 16 Aug the owner has put Vacation Auction work on hold until Monday.** That is a
pause on *building* it — it does **not** relax the cardinal rule by one inch. The auction is
still live and still serving people while nobody is working on it.

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
4. **Read `DECISIONS.md` before proposing anything.** **41 owner rulings** are recorded
   there, four of which overrule Claude's own recommendation (§1, §28, §34, and the
   phase-gate proposal under §1). Do not re-litigate them. `HANDOFF.md` carries a
   one-line index of all 34 if you need the map before the detail.

---

## What this is

A daily shift-scheduling site for ~60 anesthesiologists (Kaiser East Bay), sharing one
Firebase project with the live Vacation Auction.

* Staff: `anesthesia-kp.github.io/schedule/` — build **26**
* Admin: `anesthesia-kp.github.io/schedule/admin/` — build **51** live, **52 filed**
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
| admin | **51 — live** | **52 filed, not pushed** |
| staff | **26 — live** | clean |

**Build 49 / 25** — Shift Eligibility readability rebuild + demo banner removed from both
pages. No rules change, so **no Firebase console step**.

**Build 51 (admin) — PUSHED and LIVE 16 Aug** (commit `0027a5e`), `versions.json` verified
cache-busted at `{"index":26,"admin":51}`. Staff untouched, stays 26. No rules change, so
no Firebase console step.

**The Reports section — stage 9.** Per doctor, for a day / month / quarter / year / range:
shift counts with **overnight call at the top**, a **dated list of every overnight call**,
and an **FTE-adjusted comparison with the method printed on the page** (§28, §29). One
doctor or all of them in one page-broken document. Opens in its own tab, prints, or exports
to a styled `.xlsx` built the same way as the auction's `exportUserSummary` (§32).

It carries the **first admin-defined tag** — Overnight call, seeded with the owner's
`Call 16`, `Call 24`, `OB PM`, and **never derived** (§27) — plus the comparison-pool switch
(§35), the no-FTE handling (§36), and the baseline kept out of dated reports (§37).

Gates, executed 16 Aug: `sched/build51-test.mjs` **88/88** ×3 · honesty `--pre` vs 50
**14 pass / 66 fail** · `sched/isolation-test.mjs` **27/27** on 51 and 27/27 on 50 →
**zero new auction writes** · FTE independence **5/5** · `sched/elig-test.mjs` **33/33** on
51 and 33/33 on 50 as a control · **auction battery 14 suites / 1074 assertions green** and
`test-audit-fixes.mjs` **333/333**, both run on the owner's own machine.

**Build 52 / 27 — FILED, NOT PUSHED. The assignment model (stage 3).** A cell is a **list**
now, so a person can hold two day shifts (§8), and **defect 2 is closed** — approving a
request no longer silently deletes what they already hold. No migration: one normaliser reads
both shapes for ever. Gates: build52 **49/49** ×3 · honesty vs 51 **4 pass / 39 fail** ·
the whole schedule battery **234 assertions green** · **auction battery green** — after going
red first, for the second time on a schedule-only change (see `HANDOFF.md`).

Commit messages are ready at `.claude-commit-msg.txt` in both repos.


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

* `sched/isolation-test.mjs` — the cardinal rule, plus FTE independence. Static
  analysis over both pages with a comment/string/regex-aware parser and a **canary that
  ABORTS on parser desync** rather than passing vacuously. Mutation-tested: injecting one
  fake `setDoc(userListRef, …)` into the staff page turns it red at the right line.
* `sched/elig-test.mjs` + `sched/fake/*` — drives the real admin page in headless Chromium
  against an in-memory Firestore that records every write. 33 assertions.
  `window.__denyPath` simulates a rules rejection (**sticky**, because `mergeFields`
  retries on failure and a one-shot denial is silently absorbed).
* `sched/build50-test.mjs` — the build-50 batch, 37 assertions, both pages driven live.
* `sched/run-all.mjs` — runs all three. The browser suites skip cleanly on the owner's
  machine (no chromium there); run them from a cloud session with `PW_CHROMIUM` set.
* **Then run `tests/run-all.mjs` too — the AUCTION battery — after every schedule change.**
  On 16 Aug a schedule-only change turned it red: `test-audit-fixes.mjs` is an auction suite
  that extracts and executes the schedule page's `saveSchedField`. This is not theoretical.

**Two harness traps already paid for:** `versions.json` in a fixture must match the
`var BUILD` of the bytes under test, or the stale-build gate reloads the tab mid-run and
wipes the seeded fakes (both harnesses now read the number out of the file). And the fake
auth starts **signed out**, so a test must call `window.__signInNow()` — hiding the auth
gate is not enough, and without it every grid renders header-only and dozens of assertions
fail for no real reason.

Fixtures for an honesty baseline — the PREVIOUS build's bytes. `build50-test.mjs` and
`elig-test.mjs` both look in `/tmp/schedpre/` by default (override with `PRE_ADMIN` /
`PRE_STAFF`). Reconstruct from git:

```
mkdir -p /tmp/schedpre
git -C ../schedule show <ref>:admin/index.html > /tmp/schedpre/admin_index.html
git -C ../schedule show <ref>:index.html      > /tmp/schedpre/staff_index.html
```

For the **50 / 26** honesty run, `<ref>` is the build-49/25 commit — admin md5
`c50aaad09d5890941221716f9ba546f1`, staff `f838c9492990d3e860dbbcc45b1d10ce`.
For the older 49 baseline, pre-49 admin was `7b1a4822a2d1eb66e20a4e22b1e9a9b9`, staff
`9ff369118eebd8b12c253dcb25893d42`. **When you ship the next build, add its predecessor's
md5s here** — a baseline you cannot reconstruct is a baseline you will skip.

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

## SWITCHING BETWEEN THE TWO SITES

Both sites are worked from one chat, a day or a session at a time. **On every switch,
re-ground from disk before doing anything** — read that site's start prompt and `TODO.md`,
verify its live `versions.json` cache-busted, check `git status`. The failure mode is not
mixing the sites up; it is answering from stale in-chat memory. See `HANDOFF.md` for the
worked example of why that matters.

## First moves for the new session

1. Read this file, then `DECISIONS.md` (**41 rulings**), then `TODO.md`.
2. Verify live builds: `anesthesia-kp.github.io/schedule/versions.json`, **cache-busted**.
   Assume every build number you did not personally verify in the last few minutes is stale.
3. **Check for a stale git lock** — `find <repo>/.git -maxdepth 2 -name '*.lock'`. This has
   blocked the owner's GitHub Desktop twice. `HANDOFF.md` has the rule and the fix; the short
   version is **never run a plain `git` command over the device bridge**, always
   `git --no-optional-locks`, and never `add` / `commit` / `checkout` from there.
4. Ask the owner where the **Vacation Auction** stands before touching anything shared —
   it is on hold until Monday, which is not the same as safe to disturb.
5. **The three design documents are waiting on rulings, and one is blocking.**
   `design/RULES.md` cannot be built until roles and groups exist on people, and two
   questions inside the proposed slice need the owner rather than a guess.
6. Then **stage 3** (`design/ASSIGNMENT-MODEL.md`) — everything else rests on it.

The standard: every claim executed, every fix honesty-proven, every guess labelled as a
guess, the owner's authority absolute.
