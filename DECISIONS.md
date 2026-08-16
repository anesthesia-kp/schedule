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
