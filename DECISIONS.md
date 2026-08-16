# Daily Schedule — owner rulings

**Settled decisions. Do not re-litigate.** Add to the bottom with a date; never quietly
reverse an entry. If a ruling turns out to be wrong, write a new dated entry that says so
and why — the history is the point.

Mirrors the Vacation Auction's practice of recording owner rulings so a later session
can't undo them by accident.

---

## THE CARDINAL RULE — 15 Aug 2026

> *"Anything we work on for now cannot mess with the vacation site. There is some
> interaction and the absolute guiding principal must be to not disturb the vacay site."*

The Vacation Auction is live and running **all year**. Nothing built on the schedule
site may put it at risk. This outranks every other consideration in this file.

**Enforced by** `tests/tests-schedule-isolation.mjs`, which fails if the schedule gains
a write path to a `vacations/*` document outside the sanctioned set below.

**Note:** Firestore rules *cannot* enforce this — same project, same signed-in person, so
the server can't tell which page a write came from. The guarantee is the code plus the
test, nothing else.

---

## 1 · Roster writes stay on the schedule site — 15 Aug 2026

Claude proposed making the schedule read-only against the auction's roster. **Rejected.**

> *"I am okay with just the User section being able to write, but nothing else."*
> *"I want to keep full permissions for users in the schedule site. In the future, the
> schedule site will be used much more often than the Vacation site."*

The Users panel keeps full write access to `vacations/userList`, `usernames`,
`loginEmails`, `emails` and `emailToUser`. Nothing else on either schedule page may write
the auction — the staff page writes none today and must stay that way.

**Live hazards accepted by this ruling**, both in the Users panel:
- 🗑 Remove strips a physician from the live auction roster.
- Saving a login e-mail rebuilds `vacations/emailToUser`, the H-3 bid-security map, with a
  full non-merge overwrite. A duplicate address is dropped from the map, and that person
  then cannot bid.

Mitigation is still owed — see TODO. It must **not** be a phase gate: the auction runs all
year, so "refuse while a phase is live" would block roster changes for twelve months.
Ruled out 15 Aug.

## 2 · FTE stays independent of the auction — 15 Aug 2026

> *"The key about this feature is that the FTE setting must remain independent of
> vacation site."*

The schedule's FTE is `dailysched/fteMap`. The auction's is `vacations/fteMap`. Same
person, two numbers, deliberately. No seeding, no syncing, no fallback in either
direction. Already true as of build 48; now pinned by 5 assertions in the isolation test.

## 3 · Confirm every change — 15 Aug 2026

> *"I certainly want confirmation alert for every change that is made by both admin
> and user."*

Every mutating action, admin and staff, names exactly what it is about to do before
doing it — not a generic "are you sure." Applies to configuration as much as to
assignments (see the shift editor's Save dialog, which names the knock-on effects).

## 4 · Nothing is ever blocked — 15 Aug 2026

Safety checks **warn and let you override**. Nothing is hard-blocked. Every override is
recorded with who, when, and which rule.

Rationale: real scheduling breaks its own rules, and a tool that fights you at 6am gets
worked around.

## 5 · Draft vs published months — 15 Aug 2026

Each month has a draft (admins only) and a published version (what staff see).

> *"All admin approved swaps and requests once immediately, as long as the final schedule
> has been published for that specific month. Any requests made before final schedule
> published are part of draft schedule."*

- Month **published** → approving a request or swap applies immediately and lands in the
  affected people's change feed at once.
- Month **not yet published** → the approval builds the draft and reaches people at publish.

**Claude's default on the edge case** (stated 15 Aug, not contradicted): the test is the
month's state *at the moment of approval*, not when the request was submitted. Otherwise
an old request approved after publication would become an invisible change.

## 6 · Change feed is personal — 15 Aug 2026

> *"Users should only see changes that involve them."*

## 7 · Compatibility = times AND an approved-pairs list — 15 Aug 2026

Both, not either. Times and location filter automatically and cannot be overridden by
approval; whatever survives, the admin ticks. An unticked surviving pair is *unapproved*
(warns, per ruling 4), not impossible.

## 8 · People can hold two day shifts — 15 Aug 2026

> *"People can definitely have 2 daytime shifts. No shift can ever just be replaced.
> Good to have the warning, but some day shifts are compatible together."*

The `{day, call, off}` slot model is wrong and must become a list. No operation may
remove a shift as a side effect; removal is always explicit and named.

## 9 · Shift demand — every imaginable frequency — 15 Aug 2026

> *"Daily. Weekly on certain days, certain days/week or month, weekdays, weekends,
> holidays, every combination of the above, and more."*

Modelled as a **stacking list of rules per shift**, last match wins — not one setting.
Requires a live preview of the next 60 days, because the failure mode is silent.

Also: *"Not all shifts need a person every day. Some shifts are only once per month."*
A shift with no rules is never demanded and never counts as uncovered.

## 10 · Groups — 15 Aug 2026

> *"MD vs. CRNA is primary. Each person in that group is further subdivided into
> additional groups: pediatric, obstetric, admin, call/non-call, per diem, locums, and
> probably more."*

One primary role plus **any number of overlapping groups**, admin-created, not a fixed
list in code and not a tree. Rules target: everyone · a role · a group · a combination ·
named individuals.

## 11 · Everything admin-editable — 15 Aug 2026

> *"I want all builds and choices to be admin editable so that when something changes,
> I don't have to go into code."*

Every value and every instance is editable in the admin UI: shifts, times, locations,
demand, rules, approved pairs, groups, holidays.

**Stated boundary, accepted:** rule *types* are code. "Minimum hours between shifts" is
built once; after that the owner creates as many instances as wanted, for anyone, with any
numbers, without a build. A genuinely new *kind* of constraint is a build.

## 12 · Lock / unlock for rarely-changed config — 15 Aug 2026

> *"Features like the times and days will likely only require editing before go live and
> occasionally after that. It should have lock and unlock feature to prevent mistakes."*

Shift configuration is locked by default. Unlock is deliberate, logged, and shows a
persistent banner while open. Must be enforced in the Firestore rules, not only in the
page — the same discipline as the auction's 7-key config freeze.

## 13 · Group editing — 15 Aug 2026

Times (and location) can be applied across a multi-shift selection. The confirmation lists
every affected shift before → after, and names any approved pairing the change would
invalidate.

## 14 · Demo banner removed — 15 Aug 2026

Both pages. Shipped in admin 49 / staff 25.

## 15 · Working discipline — inherited from the Vacation Auction

- **The owner does every git push.** Claude files to the working tree and byte-verifies;
  the owner commits and pushes.
- Never write to production Firebase. Never deploy.
- Smallest change → explicit go → only that change.
- Every fix ships with tests that **execute** real extracted code, plus an honesty check
  proving they fail on the previous build.
- Bump `var BUILD` **and** `versions.json` together.
- Anything that decides who works gets an adversarial audit before it ships.
- Plain language. The owner is not a coder. Push back on bad ideas.
- No reassurance without an executed reproduction.

## 16 · Test battery and periodic audits — 15 Aug 2026

> *"I will also need a full battery of test in similar fashion to the Vacation site.
> I want periodic extensive audits of new features in new builds with adversarial reviews."*

The schedule gets its own suite grown to vacation-site standard, and each feature build
gets a multi-agent adversarial audit.

## 17 · Times, sites and the clock — 15 Aug 2026

- **24-hour clock everywhere.** The native `<input type="time">` renders AM/PM on a
  US-locale browser and cannot be forced; the field must be a custom one.
- **Labels and times are separate data.** A shift whose label carries a 12-hour time
  (`4 to 8`, `6 to 8`, `11-7:30`) **keeps that label** and stores 24-hour times
  underneath. Neither is ever derived from the other.
- **No default times in code.** Every shift is blank until an admin sets it. Blank warns
  against every pairing rather than being treated as compatible.
- **Sites: Oakland and Richmond only.**
- Owner's dictated times, 15 Aug (21 shifts): D shifts 07:30–15:30 · D10 07:30–17:30 ·
  AP 07:30–19:30 · all PM shifts 15:30–07:30 next day · `4 to 8` 15:30–19:30 ·
  `6 to 8` 17:30–19:30 · `4 to 6` 15:30–17:30 (**not in the catalog — add?**) ·
  `D am` 07:30–11:30 · `D6` 07:30–13:30 · `Call 12 PM` and `OB PM` 19:30–07:30 ·
  `Call 16` 15:30–07:30 · `Call 24` 07:30–07:30 ·
  `PACU MD` and `OFL` same as D shifts.
- **`Eye Call` 07:30–15:30** (owner, 16 Aug) — **a call-family shift with ordinary day
  hours.** This kills the assumption that `kind: 'call'` implies evening or overnight
  hours. `kind` is a *tag* driving post-call and call-fairness counting; it says nothing
  about when the shift runs. Four of Claude's guesses rested on that bad assumption
  (`C2PA`, `C2AP`, `Call 8`, `PCV Call`) and are now marked SUSPECT rather than merely
  estimated.
- **`EV` corrected 16 Aug to 15:30–23:30** (8h, does not cross midnight). Supersedes the
  15 Aug statement *"Ev is 15:30-730 next day"*.
- **THE BLANKET PM RULE IS DEAD — do not apply it to a new shift.** The 15 Aug rule
  *"all PM shifts start at 15:30 and end at 07:30 next day"* has been superseded by named
  values for every shift it touched: `Admin PM` 13:30–17:30 · `Pedi PM` 13:30–17:30
  (owner, 16 Aug) · `Pedi Admin PM` 13:30–17:30 (inferred) · `D pm` 11:30–15:30 ·
  `CVpm` 13:30–17:30 · `OB PM` and `Call 12 PM` 19:30–07:30. **Nothing is left on it.**
  A future `* PM` shift must be given its own times, not the retired rule's.
- **Admin is an exception to the blanket PM rule** (owner, 15 Aug): *"Nothing admin runs
  past 1730 … AM is 730-1130 and PM is 1330-1730."* So `Admin AM` 07:30–11:30 and
  `Admin PM` 13:30–17:30 — **no admin shift may end after 17:30**, which is a validation
  rule the app should enforce, not just a set of values.
- Further named corrections: `D pm` **11:30–15:30**, `CVpm` **13:30–17:30**.
  `Pedi Admin AM` / `Pedi Admin PM` follow the admin pattern by inference (estimated).
  `Pedi PM` was **not** mentioned and is the only shift left on the blanket
  15:30–07:30 rule — flagged CHECK ME rather than quietly changed.
- **Estimated times must be visibly distinct from confirmed ones.** The owner said
  *"make your best guess at the rest… I can edit later"*, so every shift carries a
  confirmed/estimated flag and an estimated time stays provisional until accepted.

## 18 · One site per day — 15 Aug 2026

A person is at **one site for a whole day, never both**. A site mismatch between two
shifts is impossible *regardless of their hours* — it is not a timing question. Site
therefore becomes a property of a person's day, and near-mandatory data on every shift.

## 19 · Group rules drive the eligibility grid — 15 Aug 2026

The eligibility grid stays the single per-person truth. Applying a group rule ticks the
grid for everyone in that group; an individual can still be overridden afterwards. Rules
and the grid are never two competing sources of the same answer.

## 20 · Locks — one master switch PER PAGE — 15 Aug 2026

> *"The unlock for shift edits should be a master lock for batch editing."*
> *"Master switch on each page would be good."*

**One switch per admin page, not one for the site.** Unlocking a page is what puts it
into batch-editing mode — the selection boxes, group edit and bulk actions only exist
while its switch is open. Unlocking one page never unlocks another.

**Scope on each page is all-or-nothing**, including adding and removing (so the Shift
Catalog's switch covers add/remove shifts, not just their configuration).

**Pages that get a switch:** Shift Catalog · Compatibility · Shift Families ·
Shift Eligibility · Users · Schedule Grid · Requests · Swaps · Open Shifts.
Audit Log and Stats are read-only and get none.

**Defaults on open:** config pages **locked** (Shift Catalog, Compatibility, Families,
Eligibility, Users); daily-work pages **unlocked** (Schedule Grid, Requests, Swaps,
Open Shifts) — a lock on the daily job is friction every single time.

**Re-locking:** a page stays open until you lock it or reload. **No inactivity timeout,
and no relock when you navigate away.** A banner stays visible the whole time it is open,
naming the page and who unlocked it.

Enforced in the Firestore rules as well as the page, per §12.

## 21 · "N per month" is a debt the month owes, with suggestions — 15 Aug 2026

A shift owed N times in a month is tracked as an obligation: the coverage board reports it
short until N are placed. The app **suggests candidate dates** based on who is eligible and
free; the owner accepts or moves them. It never places one silently.

**Per-person monthly caps are NOT wanted yet** — shift demand only, revisit once the Rules
section exists.

## 22 · Never present invented data as the owner's — 15 Aug 2026

Claude invented "Pedi Cardiac, twice a month" as an illustrative example, then repeated it
across the spec, the preview seed data and chat as though it were the owner's figure. The
owner caught it: *"Who said pedi cardiac is twice /month?"*

**Rule:** any placeholder, sample or guessed value shown to the owner must be labelled as
such at the point it appears — not in a footnote, and not only the first time. Applies to
demand rules, headcounts, capacities, times, locations and anything else. Where a value is
genuinely unknown, leave it empty rather than plausible.

All invented demand rules were stripped from the previews on 15 Aug; the spec's examples
are now marked. The times spreadsheet uses an explicit CONFIRMED / ESTIMATED flag per row.

## 23 · Bulk entry — duplicate first — 15 Aug 2026

> *"Love the duplicate idea."*

Duplicate-an-existing-shift is the priority, ahead of paste-a-list and bulk demand.
Rationale: the catalog is full of near-identical clusters (`ICU7A8` / `ICU7A12` /
`ICU7B8` / `ICU7B12` / `ICU7C8` / `ICU7C12`, `D10` / `D10+` / `D10 Float` / `D10Float2`).

## 24 · Catalog size — corrected 15 Aug 2026

The catalog holds **91 shifts**, not 104. Claude reported 104 from the highest `order`
value; the orders have gaps. Verified by counting entries in `DEFAULT_SHIFTS` (7) and
`ADDITIONAL_SHIFTS_V2` (84).

## 25 · Tracking: universal counting + admin-defined tags — 16 Aug 2026

> *"Call will have to be specified as such on the admin site and during shift edition …
> some items labeled call are actually not tracked as call or overnight … Ideally all
> shifts should be able to be audited and tracked although overnight call is definitely
> the most important one."*

Two separate things, deliberately:

**Tracking is universal and needs no configuration.** Every shift is counted per person
per period, always. Any shift can be audited and reported on. This is the default, not a
setting.

**Tags are what rules and fairness point at.** Admin-defined named sets of shifts,
managed exactly like Shift Families — create a tag, drop shifts into it. A fairness rule
balances *a named tag* across a population; a post-call rule triggers off *a named tag*.
`Overnight call` is expected to be the first and most important one.

**This retires `kind: 'day' | 'call'`.** "Call" stops being a property baked into a shift
and becomes one tag among several. That is what the `Eye Call` correction (§17) implies:
a shift can be called "call", run 07:30–15:30, and belong to no overnight-call tag at all.

Consequences: the shift editor gains tag membership; the Stats page can report on any tag
or any single shift; `windowShiftCounts` (today the only real fairness input, and it
counts day shifts as well as call despite the UI calling it call fairness) is rewritten to
count a named tag.

## 26 · Per diem and locums are OUT of the fairness pools — 16 Aug 2026

They are scheduled and tracked like anyone else, but excluded from the balancing maths —
a locum should not dilute the partners' call equity. Which pools a group is excluded from
is set on the group (§10), not hard-coded.

## 27 · Overnight call is a list the admin sets — 16 Aug 2026

> *"The shifts that count will be specified as call shifts by admin. You don't know those
> yet. You can start with call 16 call 24 and OB PM."*

**Starting set: `Call 16`, `Call 24`, `OB PM`. Nothing else.**

It cannot be derived, and Claude must not try:
- *Crossing midnight* would include `RCH-ICU B` (19:30–07:30), a night ICU shift.
- *The call family* would include `Eye Call` (07:30–15:30) and `Call 12 AM` (07:30–19:30),
  both daytime.

An untagged shift is **not** overnight call, whatever its name or hours suggest. This is
the first instance of the tag model in §25 and is admin-editable per §11.

Claude pre-ticked five shifts on first pass, including `Call 12 PM` and `Call 8`, which
was an assumption dressed as a default — corrected on the owner's instruction. Cf. §22.

## 28 · Reports — first set — 16 Aug 2026

**Admin only.** Not exposed on the staff site; Claude's suggestion of a staff-facing
"my report" was declined.

**Per person, not per shift.** A shift report can come later *"if needed."*

Each doctor's report, for a chosen day / month / quarter / year / custom range:

1. **How many of each shift they actually did**, with **overnight call at the top**, each
   line carrying the group average and the difference, plus subtotals for all overnight
   call and for all shifts.
2. **A dated list of every overnight call** in the period — a list, not a count.
3. **Compared with the group** — their number against the average, lowest, highest, and
   their standing.

Producible for one doctor or for every doctor in one page-broken document, in the shape
of the auction's User Summary. Visual language is the auction's `REPORT_CSS`, lifted
verbatim.

Sections Claude proposed and the owner rejected as not useful: requests/swaps activity,
change history, hours-and-shifts group summary, individual printable schedule.

## 29 · Report comparisons are FTE-adjusted; per diem and locums excluded — 16 Aug 2026

> *"For these averages, FTE must be considered in numbers should be adjusted for FTE.
> That should be specified in the report. Locum's and per diem are excluded."*

Not a flat mean. The method:

1. **The pool** is every doctor except per diem and locums.
2. **A rate per 1.0 FTE** is taken across the pool: pool total ÷ pool FTE.
3. **Each doctor's expectation** is that rate × their own FTE. A 0.6 FTE is measured
   against 0.6 of the load, never against a full-timer's number.
4. The report shows *Did · Expected at FTE x.x · per 1.0 FTE for them · per 1.0 FTE for
   the group · difference*.

**The method is printed inside the report** — the owner asked for it to be specified, so
it is stated on the page rather than assumed: pool size, pool FTE, and who is excluded
and why, by name.

**An excluded doctor still gets a full report.** They are shown and measured against
their own FTE; they simply do not influence the rate, their block says so explicitly, and
they get no pool ranking (which would be meaningless).

Worked example from the preview: pool of 4 = 3.8 FTE, 24 overnight calls → 6.3 per 1.0
FTE. A 0.8 FTE doctor is expected to do 5.1. The old flat mean over all six would have
said 4.7 — a materially different bar.

## 30 · Roster-write mitigation — the per-page lock is the answer — 16 Aug 2026

The Users panel keeps full write access to the auction roster (§1). A phase gate was ruled
out (§1). Offered the choice between naming the live auction consequence in the
confirmation, a soft delete, both, or relying on the per-page lock, the owner chose:

> **"Leave it — the per-page lock is enough."**

**Accepted, with the hazard restated so it is never mistaken for closed:** an unlocked
Users page still removes a physician from the LIVE auction roster in one click, and still
rebuilds `vacations/emailToUser` on a login-e-mail save. The lock makes that two
deliberate actions instead of one. It does not make it recoverable.

**Caveat flagged 16 Aug: the per-page lock is designed, not built.** Until it ships there
is no mitigation at all. The Users-page lock is therefore pulled forward into the small-fix
build rather than waiting for stage 1.

## 31 · Quick View bug now, phone view and notifications later — 16 Aug 2026

Suggestion 3 (stage 8) is split. The **Quick View month-boundary bug is fixed now** — it
makes the staff page look broken on first load. The phone-first view and e-mail
notifications stay at stage 8.

## 32 · Report Excel matches the auction — 16 Aug 2026

Fully styled: title row, coloured scope row, timestamp, navy block headers, colour-coded
cells, auto-sized columns — the same construction as `exportUserSummary`. Roughly half the
effort of the reports section; the owner judged it worth it.

## 33 · Build order, 16 Aug — small independent fixes first

Before stage 1 or stage 9: the batch of small, self-contained defect fixes that carry no
data-model risk.

## 34 · One chat for both sites — 16 Aug 2026

> *"I changed my mind. It seems to be working for us to move back and forth like this."*

Claude had recommended separate chat sessions, reasoning from context budget and
mis-filing risk. **Withdrawn** — a day of evidence contradicted it: the auction's context
is what made the schedule work good (REPORT_CSS reused verbatim, the stale-build gate
ported from auction 268, the holiday computation reused), the cardinal rule was enforced
*better* for holding both systems at once, and the predicted mis-filing never occurred.

The sites are deliberately convergent — same visual language, same confirmation style,
same discipline. Splitting the sessions would work against that.

Safe because the **repos hold the memory, not the chat**. Revisit only when the schedule
reaches the auction's scale.

**How the switching works:** a day or a session at a time — *"today is all scheduling,
tomorrow could be vacation"*. On every switch, **re-ground from disk before working**:
that site's start prompt and TODO, its live `versions.json` cache-busted, its `git status`.
The failure mode is not mixing the sites up; it is answering from stale in-chat memory.
On 16 Aug the handoff claimed the vacation battery had 8 reds — it had none. Run it, don't
recall it.

**Unchanged:** the auction takes absolute priority, and a Firestore rules change is an
auction deploy whichever site it serves.

## 35 · The comparison pool — a per-person switch on Users — 16 Aug 2026

§26 excludes per diem and locums from the fairness pools, and §29 requires the report to
name who was excluded. **Neither can be answered from the data that exists**: a person's
record holds name, username, login e-mail, KP e-mail and FTE, and nothing else. There is
no per diem or locum flag anywhere on either page (`grep` on both, 16 Aug: zero hits).
`role` exists but sits on *shifts*, not people, and is decorative (defect 23). Groups are
stage 4 and not built.

Offered the choice between adding a per-person switch now, shipping Reports without the
comparison, or building stage 4 first, the owner chose **the per-person switch**.

**Ruling:** each person carries a *counts toward comparisons* flag on the Users page,
**defaulting to ON**. The admin unticks per diem and locums. Stored as the schedule's own
data; admin-editable per §11, with no code change needed to alter it later.

This is a thin slice of stage 4, in the same way the Overnight-call tag is a thin slice of
stage 1. **When stage 4 lands, the switch moves onto the group** (§26 says which pools a
group is excluded from is set on the group) and the per-person flag becomes the override,
not the source. Written down here so the later session migrates it rather than finding two
competing answers.

## 36 · A doctor with no FTE — reported, but never guessed — 16 Aug 2026

FTE is deliberately optional: `getSchedFTE` returns undefined and the code says *"no
default on this site, ever"* (§2 territory). The Users page already counts how many are
blank, so this is a live condition, not a hypothetical.

Offered the choice between excluding them from the rate, treating blank as 1.0, or
refusing to run the report at all, the owner chose **exclude from the rate, still report
them**. Claude argued against treating blank as 1.0 — it would measure a half-timer
against a full load and never say so, which is §22.

**Ruling:** a doctor with no FTE recorded gets their **full report** — shift counts and
the dated overnight-call list — but **no expected figure**, and their block states plainly
that no FTE is set so no expectation can be worked out. They do **not** enter the pool and
do **not** influence anyone else's rate. Nothing is assumed in either direction.

## 37 · The call baseline — out of period reports, in a rolling-12-month view — 16 Aug 2026

`dailysched/callBaseline` holds admin-entered call from before the site existed: one lump
per person per shift, **no dates**, one `_asOf` stamp, and a weight of
`(12 − months elapsed) ÷ 12` so it decays to zero across a year.

The owner first chose to include it in report totals. Claude pushed back once, on two
grounds not covered by the original framing:

1. **It cannot be apportioned to a period.** Nothing records which of the lump fell in
   August 2026, or in Q3, or in any chosen range. Adding it to a one-month report puts all
   prior call inside 31 days, and re-running that same August report months later gives a
   different number each time.
2. **It is fractional and time-dependent by design.** The decay is correct for fairness,
   where a starting handicap should wash out. It is wrong for a document someone prints and
   hands to a colleague, which has to be reproducible.

The owner then chose the **two-view** answer.

**Ruling:**

- **Period reports** — day / month / quarter / year / custom range — are **pure schedule
  data**. The baseline never enters their totals. The report says so on the page.
- **A separate "last 12 months — fairness view"** shows exactly what auto-populate and the
  fairness maths see: baseline included, decayed, fractional — and states that on the page,
  including the `_asOf` stamp and the weight currently applied.

Two views with different jobs, each honest about which it is. Neither is allowed to be
mistaken for the other.

**Not the owner's words.** Rulings 35, 36 and 37 were settled by the owner selecting from
written options, not by dictation. Recorded that way on purpose — see §22. No quotation
marks appear above because there is nothing to quote.

## 38 · Estimated times are parked — every unconfirmed shift stays BLANK — 16 Aug 2026

Owner, 16 Aug, on Q13 and Q15: *"q15 - leave all these blank for now. q13 - leave
remaining times blank for now."*

Claude estimated times for 68 of the 91 shifts and flagged 4 of them SUSPECT after
`Eye Call` disproved the reasoning behind them (§17). **None of the estimates go into the
app.** A shift whose time the owner has not stated stays empty.

This is the same answer §17 already gave — *"no default times in code. Every shift is blank
until an admin sets it"* — now extended to Claude's spreadsheet: an estimate is not a
setting, and a blank is not a gap to be helpfully filled. A blank time warns against every
pairing rather than being treated as compatible, which is the safe direction.

`design/shift-times.xlsx` stays as a **worksheet for the owner**, not as an import.
The CONFIRMED rows are his own words and remain usable; the ESTIMATED and SUSPECT rows are
Claude's and are now explicitly not to be loaded. Cf. §22.

## 39 · `4 to 6` is a real shift — add it — 16 Aug 2026

Owner, 16 Aug, on Q11: *"add 4-6 as a shift in the weekday daytime category."*

Times are already confirmed in §17: **15:30–17:30.** Catalog size goes 91 → 92.

**How it gets added matters.** The v2 catalog seeding is one-shot and self-marking
(`_v2Seeded`), so editing the source constants has no effect on a database that has already
been seeded — that is defect 24, and it applies here. Adding this shift is therefore either
a few clicks in the Shift Catalog UI or a new one-shot migration in code.

**The UI is the right route**, and §11 is the reason: *"when something changes, I don't have
to go into code."* A shift is data. Claude does not write to production Firebase.

## 40 · No bulk demand editing — 16 Aug 2026

Owner, 16 Aug, on Q7: *"No."*

Bulk demand would have **replaced** whatever demand rules each selected shift already had —
the most destructive bulk operation on the page, and the one needing the sharpest
confirmation. It is not wanted. Bulk times and bulk location stay (§13); bulk demand is
dropped from stage 1 and from the §23 ordering, where it was third and last anyway.

## 41 · Only some shifts are requestable — it is a curated list — 16 Aug 2026

> *"Not all shifts can be requested, that's why i want just these."*

Shown the 27-entry Task list from the current system, Claude proposed generating the
"request to work X" entries from the 91-shift catalog, reasoning from §11 that a
hand-maintained list means a build every time it changes. **Overruled, and rightly.**

A person may not request most shifts. Offering all 91 would invite requests that can never
be granted, and put the refusal at the end of the process instead of the start.

**Ruling: requestable shifts are an admin-curated list**, seeded with the entries the owner
already uses. The app never derives it from the catalog, from `kind`, from a family, or
from eligibility. This is the **same shape as §27** — overnight call is a list the admin
sets, and so is this — and it is the second instance of the tag model in §25.

§11 is not violated: the list is **data, editable in the admin UI**, so changing it never
needs a build. What §11 forbids is a value baked into code, not a value chosen by a human.

**Note on §35.** The comparison-pool switch shipped in build 51 on the **Reports** page
rather than the Users page as §35's wording said. The wording was Claude's, not the
owner's; the owner approved the move on 16 Aug. Reason: the Users page is the one page that
writes the LIVE auction roster and opens locked for that reason, and a schedule-only report
setting must never be a reason to unlock it.

## 42 · "Both" is a property of the SHIFT, not the person — 16 Aug 2026

> *"Both means that both MDs and CRNAs do the shift. MDs are always different users from
> CRNAs however."*

Claude asked whether `Both (MD & CRNA)` was a third **role for a person**. It is not, and
the question was wrong.

* **A person is an MD or a CRNA. Never both.** One value, no third option.
* **A shift is MD only, CRNA only, or Both** — *Both* meaning either may cover it.

**This makes the shift's `role` field mean something for the first time.** Defect 23 records
that it is currently decorative: stored, shown, and filtered in the catalog, but **never
compared to a person anywhere**. Once people carry a role it becomes a real eligibility
constraint — a person may only be given a shift marked for their own role or marked *Both* —
and defect 23 is closed by using the field rather than by removing it.

Defect 21 is also resolved by this: the hardcoded `MD / CRNA / Both` three-option list is
correct **on a shift**. What must become data is the list of **person roles**, which is two
entries today and should not be baked in (§11).

Consequence for stage 5: role is a legitimate rule target (*"everyone · a role · a group"*,
§10) and needs no group to express it.

## 43 · The fairness pool — the group sets it, a person can override — 16 Aug 2026

The question: whose numbers go into the group average a report compares someone against?
§26 already ruled that per diem and locums are out of it. This settles *where that is set*.

Offered per-group, per-person, or group-with-override, the owner chose
**group sets it, person can override**.

**Claude argued against it and was overruled.** The objection was §19 — *"Rules and the grid
are never two competing sources of the same answer"* — which is the lesson from the
eligibility grid. Two places that can answer "does this person count?" is exactly that shape.

**Accepted, with the hazard named so it is never mistaken for closed, and with a mitigation
that is part of the ruling rather than an afterthought:**

An override must be **visible everywhere it matters**, never a quiet difference between two
screens:

1. On the **person**, wherever their status is shown: *"In Per diem, which does not count
   toward averages — individually overridden to count."*
2. On the **group**, listing its members whose individual setting disagrees with it.
3. **Inside the report itself.** §29 already requires the method to be printed on the page,
   naming the pool and who was excluded and why. An override is part of that answer and must
   appear there by name — otherwise a number changes and nothing on the page explains it.

The rule: **there is one answer, with visible exceptions** — not two answers that happen to
disagree. That is the difference between this and what §19 warns about, and it only holds if
the visibility above is actually built.

**Supersedes the placement in §35**, which shipped the switch per person on the Reports page
as an interim. That per-person value becomes the *override*, not the source. When groups
land, the group is the default and the person's setting is an exception to it.

## 44 · THE TARGET ARCHITECTURE — an engine, fed by rules and requests — 16 Aug 2026

> *"The ultimate workflow will be a set of rules, users submit requests, admin
> approves/denies requests, then the engine creates a schedule that takes all that into
> account."*

**This is the most important thing said in the project so far, and it reframes the whole
roadmap.** Stages 1, 3, 4 and 5 are not a list of features. They are the **inputs to an
engine**:

```
     RULES            (stage 5 — what scheduling must obey)
       +
     REQUESTS         (what people asked for, approved or denied by an admin)
       +
     SHIFTS, PEOPLE   (stages 1 and 4 — times, sites, demand, roles, groups)
       ↓
     THE ENGINE  →  a proposed schedule
       ↓
     an admin accepts, adjusts, or rejects it — nothing is placed silently (§21)
```

**Consequences a later session must not lose:**

* **Auto-populate is NOT the engine.** It is a crude ancestor of one — greedy, single-pass,
  fairness-only. Do not grow it into the engine by accretion; the engine is a build of its
  own, against rules that do not exist yet.
* **Every earlier stage is now judged by whether the engine can consume it.** A shift with
  no time is not just an incomplete record — it is an input the engine cannot reason about.
  That is why §38 leaving times blank has a real cost, and why stage 1 is the bottleneck.
* **§4 still holds at the engine's output.** Whatever it proposes, nothing is blocked and
  nothing is placed silently. The engine suggests; a person accepts.
* **§21's shape generalises**: the app suggests candidate dates, the owner accepts or moves
  them. The engine is that idea at full size.

Not yet designed. Recorded now so the stages are built as inputs rather than as islands.

## 45 · Auto-populate is a TESTING tool, and moves to a Testing section — 16 Aug 2026

> *"Auto-populate is funky. My original thought was that it would work as a simulator so I
> could rapidly assign shifts to test things. For this reason, I think it should move to a
> new testing section of admin, like the vacation site. Auto-pop month and year should move
> there. Let's stash clear month there as for now. Auto-pop for now should only give 1
> assignment."*

**What moves:** Auto-populate month · Auto-populate year · Clear Month.

**Where to:** a new **Testing** section, mirroring the Vacation Auction's exactly — which
already has a `Testing` nav heading, a 🎲 Simulator page, and a **Rehearsal Mode** master
switch that arms every destructive testing tool at once, with a persistent red banner while
it is on and blunt wording: *"This is NOT a sandbox: everything still writes the real
auction."* The schedule copies that shape rather than inventing one. The sites are
deliberately convergent (§34).

**Behaviour change:** auto-populate gives **one shift per person per day, total** — not one
day shift plus one call as it does today (owner, 16 Aug, asked to choose). A simulator that
can never double someone up is easier to reason about while testing.

**Why it matters beyond tidying:** per §44 the real thing is an engine driven by rules and
approved requests. Auto-populate is not that and must not become it by accretion. Moving it
out of the daily-work pages stops a prototype sitting where a stray click has consequences.

## 46 · Per-person caps ARE wanted — as a rule type — 16 Aug 2026

> *"Yes, as a rule type. Maybe it's time to have a rules section of admin where I will enter
> all the rules that scheduling must follow and shift assignments must follow."*

**Supersedes §21's deferral**, which said per-person monthly caps were *"NOT wanted yet —
shift demand only, revisit once the Rules section exists."* This is that revisit.

A cap is an instance of the **Not more than N of [tag] per week / month** rule type in
`design/RULES.md` — targeted at everyone, a role, a group, or named individuals. Per §4 it
**warns and is overridable**, never blocks, and every override is recorded.

## 47 · Split the month document into a subcollection — now — 16 Aug 2026

Defect 8: each month is a single `dailysched/sched_YYYY-MM` document, Firestore caps a
document at 1 MB, and **every write rewrites the whole thing**. Build 52 made each cell
larger — a list with provenance on every entry instead of two strings — so the headroom
shrank at exactly the moment it became easier to fix.

Offered now / later / measure-first, the owner chose **now, while there is no real data**.

Three things it buys, not one:

1. **The cap stops being a question.** A year of daily use by 60 people cannot approach it.
2. **A write stops rewriting the month.** Today two admins editing different days contend on
   one document; build 52's transactions make that safe but not cheap.
3. **Defect 9 becomes fixable.** Firestore rules cannot constrain a write to one person's
   entry while the whole month is one document. Per-day documents are what makes a real
   server-side rule possible — and rules are the only enforcement that does not depend on
   the page behaving.

Timing: after the Testing section and after stage 1 — it is independent of both, since stage
1 is the shift catalog rather than month documents.

## 48 · "N per month" is deferred — daily demand only, for now — 16 Aug 2026

> *"Skip monthly thing for now."*

Build 55 gives each shift a stacking list of **per-day** rules — daily, weekdays, weekends,
named weekdays, holidays — each carrying how many people that day needs. A shift owed *N
times a month with no particular dates* is **not** built.

**§21 is not reversed, only postponed.** It already ruled the shape: *"a shift owed N times
in a month is tracked as an obligation… the app suggests candidate dates and the owner
accepts or moves them. It never places one silently."* When it arrives it is a separate
field on the shift, not another row in the day-by-day list — a stacking rule cannot express
*"any two days, you pick"* without naming dates, which is the thing §21 forbids.

## 49 · Holidays — computed federal dates, editable on top — 16 Aug 2026

Offered the auction's computed federal set, a hand-kept list, both, or skipping holidays,
the owner chose **both**: the federal dates appear automatically and can be added to or
removed from.

**On lifting the auction's code.** The auction has a holiday computation, and §32's
instinct is to lift rather than approximate — but it returns **week indices**, because the
auction reasons in weeks. The schedule reasons in days. So the *definitions* and the
nth-weekday / last-weekday helpers port; the return type does not. This is a **port, not a
verbatim lift**, and it is described that way rather than claimed as identical.

**Two things stated rather than assumed:**

* The computed set is the **eleven US federal holidays**, not the auction's seven — the
  auction's list is trimmed to the ones that shape bidding. A hospital may well not care
  about all eleven, which is exactly why the list is editable.
* **The actual date is used, not the observed one.** When a holiday falls at the weekend the
  federal *observed* day shifts to the Friday or Monday; a hospital runs on the real day.
  This may be wrong for how the group treats coverage — it is a guess about their practice,
  so it is flagged here rather than buried, and the override list is how it gets corrected.

**§19 applies.** Computed dates plus overrides is two sources for one answer, which is what
that ruling warns about. It is allowed here on the same condition as §43: an override must
be **visible** — a removed federal holiday and an added local one are both shown as
deliberate changes, never as a silent difference between what the code computes and what
the calendar says.

---

## §47 — DONE, build 59. How it actually came out.

The ruling was "split the month document into a subcollection, NOW, while there is no
real data." Built. `dailysched/sched_YYYY-MM/days/{DD}`, one document per day.

Three things were decided during the build that the ruling did not cover, and they are
binding from here:

**47a — An unconverted month is READ-ONLY, not merged.** The tempting alternative was to
read both places and merge. That gives one question two sources of truth, which is what
§19 forbids, and it makes a half-and-half month possible. So: `sched_YYYY-MM.v2 === true`
means the day records are the truth (even when empty); days present without the marker
means unconverted, shown in full but locked, with a banner and a Convert button.

**47b — Converting COPIES; the old record is kept as the backup.** It is not moved and
not deleted. Deleting the old month documents is a separate decision for a later day, once
there has been real data in the new shape for a while. The copy is ONE batch — all of it
or none of it — because a half-copied month leaves the uncopied days invisible.

**47c — The lock is checked inside the write's own transaction, never from a flag.**
The on-screen "is this month converted" flag describes the month you are LOOKING at.
Request approval and swap apply both write to other months. A cached answer is wrong for
exactly the cases that matter, so `mutateCell` re-reads the month marker inside its own
transaction before writing anything.

Also settled here: **Clear Month must write the v2 marker alongside the deletions.**
Without it, clearing empties the day records, the reader falls back to the old document,
and every assignment just cleared comes back. That is a general shape worth remembering —
whenever "empty" and "look somewhere else" are both possible, something must say which.
