# Daily Schedule — TODO, open questions, known defects

**Living document.** Rulings live in `DECISIONS.md`; design lives in
`SCHEDULE-FOUNDATIONS-SPEC.md`. This file is what's *outstanding*.

> ⚠️ **This repository is PUBLIC.** Describe defects by their shape, never by a
> reproduction. Anything that reads as instructions belongs in a private note.

Last updated **15 Aug 2026**. Line numbers are anchored to **admin build 48**
(md5 `7b1a4822a2d1eb66e20a4e22b1e9a9b9`) unless stated; function names are the stable
reference.

---

## Builds

| page | live | in working tree | state |
|---|---|---|---|
| admin | **51** | **52** | 52 FILED, byte-verified, **NOT pushed** |
| staff | **26** | **27** | 27 FILED, byte-verified, **NOT pushed** |

**Build 52 / 27 — THE ASSIGNMENT MODEL (stage 3).** A cell is now `{a:[{s,by,at,via}], off}`
— a **list**, so a person can hold two day shifts (§8) and nothing is ever removed as a side
effect. **Closes defect 2**, the silent overwrite: approving a request used to write
`{...cur, day:null, call:null, [kind]:id}`, clearing both slots and setting one, with nothing
in the audit log naming what vanished.

**No migration.** One normaliser reads both shapes, `a` always wins and is never merged with
the old keys (§19), and a cell converts only when someone actually changes it. ~20 read sites
routed through it; three writers — add / remove / set-off — replace every whole-cell write,
each inside a transaction on the fresh cell.

Also: "no call" now points at the **overnight-call tag** rather than `kind`, so `Eye Call`
survives a no-call request (§27). Auto-populate's *policy* is deliberately unchanged — this
build changes how assignments are stored, not who gets what.

Gates: `sched/build52-test.mjs` **49/49** ×3 · honesty `--pre` vs 51/26 = **4 pass / 39 fail**
· build50 **37/37** · build51 **88/88** · elig **33/33** · isolation **27/27** ·
auction battery **14 suites / 1074 assertions green**.

*The auction battery went red first, for the second time on a schedule-only change* —
`test-audit-fixes.mjs` anchors an order-of-operations assertion on a literal string this
build replaced. The **anchor** was updated; the assertion was not weakened.

**Build 51 (admin only)** — the **Reports** section, stage 9. Per doctor, for any period:
shift counts with overnight call first, every overnight call listed by date, and an
FTE-adjusted comparison with the method printed on the page (DECISIONS §28/§29). Carries
the first admin-defined tag — **Overnight call**, seeded with the owner's `Call 16`,
`Call 24`, `OB PM` and never derived (§27) — the comparison-pool switch (§35), the no-FTE
handling (§36), the baseline split into a separate fairness view (§37), and a styled Excel
export built the same way as the auction's `exportUserSummary` (§32).
Staff page untouched, so staff stays 26. No rules change → no Firebase console step.

Gates, all executed 16 Aug: `sched/build51-test.mjs` **88/88** ×3 in a real browser ·
honesty `--pre` vs build 50 = **14 pass / 66 fail** · `sched/isolation-test.mjs` **27/27**
on 51 and 27/27 on 50 → **zero new auction writes** · FTE independence **5/5** ·
`sched/elig-test.mjs` **33/33** on 51 and 33/33 on 50 as a control.
**Still owed before push: the auction battery** (`node run-all.mjs`) — build 50 turned it
red on a schedule-only change, so it runs after every one.

*Worth recording:* the eligibility suite caught the first cut of this build. The Excel
library was loaded in a `<script>` tag exactly as the auction loads it, which made the page
log a console error on every load when the CDN was unreachable — and that suite asserts
zero console errors. The assertion was NOT loosened to fit the change; the library is now
fetched only when Excel is actually pressed, so the page keeps the zero network
dependencies it had.

**Build 50 / 26** — the small-fix batch (DECISIONS §33): stale-build gate ported from
auction 268 · Quick View month-boundary fix · a staff error surface (the page had none) ·
the Users-page lock · six missing audit entries · sticky name column on the Schedule Grid ·
the false `// vacations — READ-ONLY` comment corrected.
Closes defects **11, 14, 19, 30** and the `saveSchedField` audit gap under
"Owed mitigation".
Gates: `sched/build50-test.mjs` **37/37** ×3 · honesty `--pre` vs 49/25 = 11 pass / 26 fail ·
`sched/elig-test.mjs` **33/33** on 50 (and 33/33 on 49 as a control) ·
`sched/isolation-test.mjs` **27/27**, zero new auction writes · FTE-independence 5/5 ·
auction battery **14 suites / 1074 assertions, green**.
No Firebase console step — rules unchanged.

**Build 49 / 25** — LIVE since 16 Aug. Shift Eligibility readability rebuild + demo banner
removed from both pages.

---

## OPEN QUESTIONS — awaiting the owner

| # | question | why it matters | asked |
|---|---|---|---|
| Q8 | **Suggestion 3** — phone-first staff view, notifications, Quick View fix. No verdict given; absorbed as stage 8 and deliberately movable. | If the group starts using the site before the foundations land, this is the stage to pull forward. Nothing in it depends on the rest. | 15 Aug |
| Q10 | **ANSWERED 15 Aug** — *"Richmond shifts generally say RCH or R at the start."* Applied: 9 Richmond, 82 Oakland, none blank. Residual: 2 rows marked CHECK ME (`NICU9+` starts with N; `SMOB Uro` matches neither), and 7 of the 9 Richmond shifts rest purely on the R-start rule with the abbreviation undecoded. | Ruling 18 makes site a property of a person's whole DAY. | 15 Aug |
| Q18 | **Subgroups — the third question of §53.** ANY-vs-ALL and multi-membership are ANSWERED (DECISIONS §53a). Still open: do subgroups REPLACE the per-shift eligibility tick grid or FILTER it; may a person hold subgroups across categories; and is the minimum zero subgroups or one. | Stage 4 cannot be built without it, and §19 forbids two answers to "can this person do this shift". | 16 Aug |

### Answered

| # | question | answer |
|---|---|---|
| Q1 | Do shift times exist in an export? | **Moot** — the owner dictated 22 directly and asked Claude to estimate the rest. `shift-times.xlsx` delivered 15 Aug. |
| Q2 | Location list / site pinning | **Oakland and Richmond only.** And **one site per day, never both** — see DECISIONS §18. Residual: which shifts are where → Q10. |
| Q3 | Eligibility grid vs group rules | **Group rules drive the grid** — DECISIONS §19. |
| Q5 | "N per month" — shift demand or person limit? | **A debt the month owes, and the app suggests dates.** Per-person caps **not yet** — DECISIONS §21. |
| Q17 | Report averages — FTE-adjusted? per diem/locums excluded? | **Both yes**, and the method must be printed in the report — DECISIONS §29. |
| Q4 | Per diem / locums and fairness | **Out of the fairness pools** — scheduled and tracked, excluded from balancing. Set per group. DECISIONS §26. |
| Q16 | How is tracking specified? | **Universal counting + admin-defined tags**, retiring `kind: day/call`. DECISIONS §25. |
| Q6 | Lock scope | **Everything, add and remove included**, and **one master switch per page** with config pages locked / daily-work pages unlocked by default, no auto-relock — DECISIONS §20. |
| Q14 | Should `Pedi PM` be 13:30–17:30? | **Yes** — owner, 16 Aug. With that, **no shift remains on the blanket PM rule**; it is retired (DECISIONS §17). |
| Q12 | Do the PM shifts really run 16 hours? | **Admin is an exception** — nothing admin past 17:30; Admin AM 07:30–11:30, Admin PM 13:30–17:30, D pm 11:30–15:30, CVpm 13:30–17:30. Residual → Q14 (`Pedi PM`). |
| Q7 | Bulk demand editing? | **No** — owner, 16 Aug. Dropped from stage 1. DECISIONS §40. |
| Q11 | Is `4 to 6` a shift? | **Yes** — *"add 4-6 as a shift in the weekday daytime category."* 15:30–17:30, catalog 91 → 92. Add it in the Shift Catalog UI, not in code — the seeding migration is one-shot (defect 24) and §11 says data changes need no build. DECISIONS §39. |
| Q13 | Accept the 68 estimated times? | **No — leave them blank.** Owner, 16 Aug: *"leave remaining times blank for now."* The estimates are parked, not loaded. DECISIONS §38. |
| Q15 | The four SUSPECT call times | **Leave blank** — owner, 16 Aug. Same ruling as Q13. DECISIONS §38. |
| Q9 | Bulk entry priority | **Duplicate-an-existing first**, then paste-a-list. ~~then bulk demand~~ — bulk demand was later declined outright (Q7 / DECISIONS §40). DECISIONS §23. |

---

## Request types — the QGenda list the owner wants (raised 16 Aug)

The owner sent screenshots of the current system's **Task** dropdown — the list a person
picks from when submitting a request — and asked for it. **27 entries**, confirmed by him
as the complete list:

*Work something specific:* MD Sat D · PACU MD · CVpm · DE · RCH, 8hr, MD only (R8:MD) ·
Admin · Admin AM · Admin PM · Req OAK Call · Req OAK Call AM · Req OAK Call PM · Req RCH Call
*Avoid something:* No Call · No OAK AM · No OAK PM · No Late [MAX] · No Late [HIGH] · No Late [LOW]
*Time off:* CV-Day Off · Day Off [MAX] · Day Off [HIGH] · Day Off [LOW] · Weekend Off ·
Use PTO if off · Ed Leave · Jury Duty (JD)
*Availability:* AVAILABLE

Today the staff page offers **four** types — `shift`, `dayoff`, `nocall`, `other`.

Design in `design/REQUEST-TYPES.md` + `design/request-types-preview.html`. **Not built.**
Two structural points are the whole design, and both were raised before any of it was built:

1. **`[MAX]` / `[HIGH]` / `[LOW]` is a strength, not a name.** Listing the same request
   three times buries the priority inside a text label, so a queue can never be sorted by
   it and every future priority-bearing type triples the list.
2. **The list is a deliberate SUBSET of the catalog, not a view of it.** Owner, 16 Aug:
   *"Not all shifts can be requested, that's why i want just these."* Claude had proposed
   generating the work-something entries from the 91-shift catalog; **wrong** — a person
   may not request most shifts, and offering them all would invite requests that can never
   be granted. Which shifts are requestable is an **admin-curated list**, managed exactly
   like the Overnight-call tag: the app never works it out, the admin sets it. Same shape
   as §27, and §11 is still satisfied because the list is data, not code.

**Depends on:** the overnight-call tag (shipped, 51) for *No Call*; a **late** tag for
*No Late*; and **site on shifts** (stage 1, Q10) for the OAK / RCH entries.
**Makes defect 1 worse until stage 6:** approving a request writes an assignment with no
eligibility, capacity, vacation or collision check. More request types means more ways to
walk into that.
**Open:** the screenshots show **Limits** and **Balances** tabs — how many of each request
type a person may make per period. Not specified, deliberately not invented (§22).

---

## FUTURE CAPABILITY — ideas raised in conversation. NOT yet specified, NOT scheduled.

> **⚠️ WHY THIS SECTION EXISTS, AND THE LESSON IN IT.** On 16 Aug 2026 the owner asked that
> earlier recommendations stay on the list — *"there were a lot of good ideas in there such as
> linking to calendars on phones, e-mail setup…"*. They were not recoverable. They had been
> raised in chat and **never written to any file**, and the session's context had since been
> compacted. The only surviving transcript begins after that point.
>
> **A chat is not storage.** An idea that lives only in a conversation is one compaction away
> from gone. **BINDING, from now on: when an idea, preference or "we should eventually…" is
> raised, write it into this section in the same turn** — one line is enough. Do not wait for
> it to be specified, scheduled, or agreed. Capturing a rough idea costs nothing; losing a
> good one costs the owner something he cannot get back.

**Recovered so far — the two the owner named on 16 Aug.** Both are HIS words and are recorded
here deliberately unelaborated, because the detail was lost and inventing it would breach §22
(never present invented data as the owner's). Ask him to specify before designing either.

- [ ] **Linking to calendars on phones.** Owner-raised, detail lost. The obvious shape is a
      per-doctor subscribable feed (`.ics`) that a phone can subscribe to so a doctor's shifts
      appear in their own calendar and update when the schedule changes — but that is MY guess
      at what he meant, not his specification. Confirm before building. Note the auction
      already has an "Auction Calendar" concept in its admin; check whether he wants these
      unified or kept separate.
- [ ] **E-mail setup.** Owner-raised, detail lost. The auction already sends mail through
      EmailJS (shared template `template_rss3fn3`, footer added 13 Aug — see the auction's
      TODO). Whether the schedule should reuse that template, use its own, and what it should
      send (assignment changes? open-shift alerts? request decisions?) is unspecified. Ask.

- [x→specified] **ANSWERED IN PART, 17 Aug 2026 — the owner re-specified both lost ideas,
      verbatim:** *"They will need to have access to the schedule from their phones, either
      apple or andoird. They will need e-mail updating and alerts."* And: *"There are big
      builds left to do on the schedule site. … My schedule site needs to have all
      functionality for a group of busy physicians."* So: phone access (Apple AND Android —
      which points at the web app working well on both phone browsers, not native apps,
      unless he says otherwise — ASK) and e-mail updates + alerts are CONFIRMED wanted.
      Detail still unspecified: what triggers an alert, what a phone view shows first.
      A full ideas list is queued as item A8 in `anesthesia-kp.github.io/MASTER-TODO.md`.
- [ ] **Anything else the owner remembers from the pre-16-Aug sessions.** He said there were
      "a lot of good ideas". These two are the ones he named. **Ask him directly what else he
      recalls, and write each one here the moment he says it.**

---

## Staged roadmap

From `SCHEDULE-FOUNDATIONS-SPEC.md` §6. Each stage ships on its own and leaves the site
working.

| # | stage | size | state |
|---|---|---|---|
| 0 | **Test battery** — grow the schedule suite to vacation standard | medium | started: isolation + eligibility suites exist |
| 1 | **Shift definition** — times, location, demand rules, preview, holiday calendar, per-page lock, group edit, bulk entry (duplicate first — **no bulk demand**, §40), **tag membership** | large | **designed + previewed, not built.** The Overnight-call tag SHIPPED in 51 as its first slice. |
| 2 | **Coverage board** — uncovered shifts, `filled / needed` | small | not started |
| 3 | **Assignment model** — list not slots; explicit add/remove | large | not started |
| 4 | **People** — roles + admin-defined groups, each with a "counts toward fairness" switch (§26) | small | not started |
| 5 | **Rules section** + conflict report. Fairness and post-call rules point at a **tag**, not at `kind` | large | not started |
| 6 | **Safety check + uniform confirmations** | medium | not started — *was* going to be first; moved back because it consumes 1–5 |
| 7 | **Draft / publish + per-person change feed** | large | not started |
| 8 | **Staff phone view, notifications, Quick View fix** | medium | not started — movable, see Q8 |
| 9 | **Reports (admin only)** — per-doctor shift counts with call first, dated call list, comparison to the group. | medium | **BUILT — admin 51**, filed and gated, awaiting the auction battery and a push. |

---

## Owed mitigation (from DECISIONS §1)

The Users panel keeps full auction-roster write access. A phase gate is ruled out (the
auction runs all year). Still owed, approach not yet agreed:

- 🗑 **Remove user** strips someone from the live auction roster (`removeSchedUser`,
  ~1651–1664). Needs to be visible and recoverable rather than blocked — e.g. name their
  live auction state in the confirmation ("has 4 active bids in Phase 3"), and log it
  loudly.
- **Login-e-mail save** rebuilds `vacations/emailToUser` with a full non-merge `setDoc`
  (`syncEmailToUserFromLogin`, ~1460). A duplicate address is dropped from the map and
  that person cannot bid. Needs a before/after diff in the confirmation at minimum.
- ~~**`saveSchedField` writes no audit entry**~~ **FIXED in admin 50** — all four field
  saves (name, login e-mail, KP e-mail, FTE) are audited, as are `postOpen`, `removeOpen`
  and the Users-page unlock itself. The *before/after diff in the confirmation* for the
  `emailToUser` rebuild is still owed.
- **The Users page now opens LOCKED** (admin 50, DECISIONS §20/§30). That is the agreed
  mitigation, and it is a real reduction in accident surface — but it does not make the two
  dangerous operations *recoverable*, which is still owed.

---

## Known defects — found 15 Aug

**Fixed in build 50 / 26:** 11 (Quick View month boundary), 14 (silent staff write
failures), 19 (sticky name column), 30 (stale-build gate). Left in place below, struck
through, so the record of what was found stays intact.

Verified by reading build 48 unless noted.

### Correctness

1. **Request and swap approval bypass every check.** `decideReq` (~1175–1181) and
   `decideSwap` (~1294–1308) write assignments with no eligibility, capacity, vacation or
   collision check. The hand-editing path *does* check (`cmConflicts`); the fast path
   working down a queue does not. → stage 6.
2. ~~**Silent overwrite.**~~ **FIXED in 52/27.** Assigning a second day shift replaced the
   first with no warning and no record. A cell is now a list; adding never removes, and
   every removal is named in the audit log.
3. **Swap apply is not atomic with swap status** — self-declared in-code at ~1269–1272. A
   mid-apply failure leaves "approved" with only some legs moved, and no repair path in
   the UI.
4. **Staff `elig` is loaded and never used** (subscribed ~1078). Users can request shifts
   they aren't eligible for; nothing flags it at any point.
5. **Auto-populate is unusable at catalog size.** It loops every shift in the catalog for
   every day, so ~97 shifts get attempted on a Sunday. Needs stage 1. → stage 1/2.
6. **`dashCoverage` is meaningless** — denominator is every shift × capacity × every day.
   Structurally near-zero. Fixed by stage 2.

### Data safety

7. **Non-merge full overwrites**: `Clear Month` (~1101) wipes any other top-level field on
   the month doc and any concurrent edit made during the confirm dialog; same pattern in
   `clearAllSchedFte` (~1648) and `saveBaseline` (~2059).
8. **Single-document growth.** `requests`, `swaps`, `openShifts`, `auditLog` are each one
   `{list:[…]}` document. Firestore caps a document at 1 MB and every write rewrites the
   whole thing. Fine now; will not survive daily use by 60 people. Needs a subcollection
   migration — cheap now, expensive later.
9. **H-5 deferred (security).** These three documents are writable wholesale by any
   registered account, so the rules cannot constrain a write to the author's own entry.
   Detail deliberately omitted — **this repository is public.** The `firestore.rules`
   comment at the `dailysched` block states the constraint; the subcollection migration
   in (8) is the fix. Treat as real, not theoretical.
10. **Audit gaps**: no entry from `saveSchedField` (all four per-user fields), `postOpen`
    or `removeOpen` — contradicting the Audit Log panel's own claim that "everything that
    changes real data" is recorded.

### UI / UX

11. ~~**Quick View breaks outside the current month.**~~ **FIXED in staff 26.** It always shows 7 days from today,
    but assignment data only loads for the *browsed* month — so paging away turns the
    whole view into the literal text "view month", and a week straddling a month boundary
    is half blank even on first load. → stage 8.
12. **`renderAll()` rebuilds 13 components on every snapshot** from ~14 listeners,
    destroying unsaved typing in the Users grid and the baseline grid.
13. **Year-mode Stats has no in-flight guard** — concurrent snapshots during a cold load
    fire multiple parallel 12-document reads.
14. ~~**Staff write failures are silent.**~~ **FIXED in staff 26** — a toast, plain-language
    messages per Firestore error code, and a handled-rejection guard. Every action handler (`submitRequest`,
    `submitSwap`, `applyOpen`, all four accept/decline) lacks a try/catch: a rejected
    transaction shows the user nothing at all.
15. **No withdraw.** Once submitted, a request or swap can only be resolved by an admin.
16. **No denial reason.** Status is just `denied`.
17. **Mobile**: the Full Schedule grid is 9px with ~31 no-wrap columns; Quick View and the
    personal calendar are hardcoded to 7 equal columns with no small-screen override.
18. **Shift Families drag-and-drop is HTML5-only** — no touch fallback, so regrouping is
    impossible on a tablet.
19. ~~**Schedule Grid's name column is not sticky**~~ **FIXED in admin 50.** (unlike the eligibility grid's), so it
    scrolls out of view at 31 columns.

### Hardcoding — violates DECISIONS §11

20. **Two default admin e-mails** baked into source in two places that must be kept in
    sync by hand (`DEFAULT_ADMIN_EMAILS_UI` ~1389, `DEFAULT_ADMIN_EMAILS` ~2065).
21. **MD / CRNA / Both** is a fixed three-option list, and collides with the groups model
    in DECISIONS §10.
22. **The vacation site URL** is hardcoded in both pages.
23. **Shift `role` is decorative** — stored, shown, filtered in the catalog list, and
    never compared to a person anywhere.
24. **Five shift labels flagged `photo unclear — verify`** (`NICU9+`, `RC0+`, `R9/5`,
    `R11+`, `CV8+`) transcribed from a handheld photo. The seeding migration is one-shot
    and self-marking, so editing the source constants now has no effect — they must be
    fixed in the Shift Catalog UI.

### Stale-build gate — the auction fixed this in 268; the schedule never got it

30. ~~**A tab can be stranded on an old build, permanently.**~~ **FIXED in 50 / 26** —
    cache-busted `?v=` reload via `location.replace()`, plus a refocus re-check throttled
    to 60s. The auction's `requiredBuilds` ratchet was NOT ported; that is still open. Both pages check
    `versions.json` and then call a bare `location.reload()` (admin ~line 22, staff the
    same), guarded by a once-per-version `sessionStorage` key (`vrl-<page>`). If the CDN
    serves the cached old page, the reload changes nothing — and because the guard has
    already recorded that version as "seen", it never tries again. That tab stays on the
    old build until the browser cache expires or the user hard-refreshes.
    **The Vacation Auction fixed exactly this in build 268**: reload cache-busted with
    `?v=N`, re-check on tab refocus (≥60s throttle), and a push-driven
    `requiredBuilds` one-way ratchet that forces every open tab forward. Porting it is
    small, self-contained, and independent of every roadmap stage.
    *Raised by Claude in the opening survey on 15 Aug and then dropped from the record —
    recovered 16 Aug when the owner asked whether the early suggestions were all tracked.*

### Dead code

25. `dailysched/callTotals` — subscribed, assigned, never read.
26. `window.saveSchedUser` (~1511–1550, ~40 lines) — no call site.
27. Staff: `sha256`, `resolveUser`, `onSignUserInput`, `#signWelcomeErr`, and CSS for
    three inputs that no longer exist — all leftovers of the removed passcode/username
    sign-in.
28. Staff: `passcodesData` is loaded and gates the sign-in screen but is never read; two
    comments still promise a passcode step that does not exist.
29. `namesLoaded` / `schedFteLoaded` set but never read (their siblings *are* used —
    looks like an unfinished gate).

---

## Test assets

In the sibling `tests` repo, filed and **uncommitted**:

- `tests-schedule-isolation.mjs` — the cardinal rule, plus FTE independence. Static
  analysis over both pages with a comment/string/regex-aware parser and a canary that
  ABORTS on parser desync rather than passing vacuously. Mutation-tested.
  `--pre` honesty fixture: `/tmp/schedpre/`.
- `sched/elig-test.mjs` + `sched/fake/{firebase-app,firebase-auth,firebase-firestore}.js`
  — drives the real admin page in headless Chromium against an in-memory Firestore that
  records every write. 33 assertions. The fake supports `window.__denyPath` to simulate a
  rules rejection (sticky, because `mergeFields` retries on failure and a one-shot denial
  is silently absorbed).

**Fixtures.** Pre-49 bytes: admin md5 `7b1a4822a2d1eb66e20a4e22b1e9a9b9`, staff
`9ff369118eebd8b12c253dcb25893d42`. Reconstruct with
`git -C schedule show <pre-49-ref>:admin/index.html > /tmp/schedpre/admin_index.html`.

**Still missing** for vacation-site parity: a button sweep, a full-lifecycle run-through,
a never-events list, engine fuzzing, mobile sweeps, and an `audit-handlers` equivalent.
→ stage 0.

---

## Stage 1 — confirmed requirements

Beyond the spec, these are settled or explicitly requested:

- **24-hour clock everywhere.** The native `<input type="time">` renders AM/PM on a
  US-locale browser and cannot be forced to 24h, so the field must be a custom one.
  Accepts `730` / `7:30` / `0730` / `07.30`, stores `HH:MM`, refuses `25:00` and `7:5`
  with the previous value kept. Proven in the preview harness.
- **No default times in code.** Every shift is blank until an admin sets it; blank warns
  against every pairing rather than being treated as compatible. Approved pairings
  likewise start empty.
- **Sites: Oakland and Richmond only**, and a person is at ONE site for a whole day —
  so a site mismatch is impossible regardless of hours (DECISIONS §18). Only 3 of the 91
  shifts have a site set; see Q10.
- **Owner's seed times, 15 Aug** — to be entered as data, not baked in:
  D shifts 07:30–15:30 (8h) · D10 group 07:30–17:30 (10h) · AP 07:30–19:30 (12h) ·
  all PM shifts start 15:30.
- **Bulk entry**: duplicate-an-existing **first** (owner: "love the duplicate idea"), then
  paste-a-list with a create/update/rejected preview, then bulk demand.
- **Estimated vs confirmed times.** Every shift carries a flag; an estimated time stays
  visibly provisional in the admin UI until accepted. Source: `shift-times.xlsx`.
- **"N per month" is a debt the month owes**, with suggested dates the owner accepts or
  moves. Never placed silently. No per-person caps yet.
- **Group edit** of times and location, with a before → after table and the
  approved-pairing knock-on named.
- **Lock: one master switch per page** (DECISIONS §20). Config pages default locked,
  daily-work pages default unlocked; a page stays open until locked or reloaded, with no
  timeout and no relock on navigation. Unlocking is what enables batch editing. Deliberate,
  logged, persistent banner, enforced in the Firestore rules as well as the page.

### Times — resolved 15 Aug

The owner dictated times for 22 shifts and asked Claude to estimate the remaining 69.
Delivered as `shift-times.xlsx` (all 91 rows, CONFIRMED / ESTIMATED flag, reasoning per
estimate, computed hours and overnight flag, site dropdown). Residual: **Q10** (sites),
**Q11** (`4 to 6` not in the catalog), **Q12** (16-hour PM shifts), **Q13** (accept the 69
estimates).

**Do not present invented data as the owner's** — see DECISIONS §22. All fabricated
demand rules were stripped from the previews on 15 Aug; the spec's examples are now
labelled; the preview hides example rules behind a button that names them as invented.

---

## Design artefacts

- `SCHEDULE-FOUNDATIONS-SPEC.md` — shifts, compatibility, people/rules, assignment model,
  coverage, staged order of work, open questions.
- Two interactive previews delivered in chat 15 Aug (not in the repo): the eligibility
  grid redesign, and the shift editor with times / demand rules / 60-day preview /
  compatibility / lock / group edit.
