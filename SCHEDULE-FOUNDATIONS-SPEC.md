# Daily Schedule — the three foundations

**Draft for the owner, 15 Aug 2026.** Written after the rulings in that day's session.
Nothing here is built. This is for you to read, argue with, and mark up.

Everything in this document exists because of one finding: **the current data model
cannot represent what you told me your schedule actually does.** Two day shifts on one
person is not "unsupported," it is unrepresentable. A shift cannot say when it runs. A
person has no attributes to hang a rule on. Until those three things change, every
feature built on top inherits the same ceiling.

So this document covers only the foundations — shifts, people, rules — and the
assignment model that sits under them. The visible features you've asked for
(confirmations, uncovered-shift tracking, draft/publish, the change feed, the phone
view) all get easier once these are right, and several become nearly free.

---

## 1 · What a shift is

### Today

```
{ label, kind: 'day'|'call', color, family, role, order, capacity }
```

`capacity` means "how many people, if it runs." Nothing says *whether* it runs. Every
part of the app therefore assumes every shift runs every day — which is why
Auto-Populate tries to fill all 91 shifts on a Sunday, and why the dashboard coverage
figure is meaningless (its denominator is every shift × capacity × every day).

`role` (MD/CRNA/Both) is stored and shown, but never compared to a person — it only
filters the catalog list.

### Proposed

```
{ label, family, colour, order,
  tags:      ['overnight-call', …], // NEW — see the note below; REPLACES kind
  starts:    '07:00',               // NEW
  ends:      '15:00',               // NEW — may cross midnight
  location:  'oakland' | 'richmond',       // NEW — those two only (owner, 15 Aug)
  demand:    [ …rules… ],           // NEW — see below
  notes:     '' }
```

**Times** are the important addition. They are what let the app answer "can this person
hold both of these?" without anyone maintaining a table, and they are the prerequisite
for every rest-and-recovery rule you will want in §3 — minimum hours between shifts,
post-call, no night-then-day. Your own labels already carry the information: `Admin AM`
/ `Admin PM`, `Pedi AM` / `Pedi PM`, `4 to 8`, `6 to 8`, `11-7:30`, `Call 12 AM` /
`Call 12 PM`, `D10`, `D6`, `Call 16`, `Call 24`.

**Location** covers the cases times can't: two shifts that don't overlap but still can't
both be worked, because they're at different sites. Your catalog already implies this —
`RCH-ICU A`, `Oak ICU Swing`, `SMOB Uro`.

> **Migration note, updated 15 Aug.** The owner dictated times covering 22 shifts and
> asked Claude to estimate the rest — see `shift-times.xlsx`, which carries a
> CONFIRMED / ESTIMATED flag per row. An estimated time must stay visibly provisional in
> the admin UI until accepted; there are no default times in code, and a blank shift is
> treated as "unknown — warn on any pairing" rather than "compatible." Five labels are
> flagged `photo unclear — verify` (`NICU9+`, `RC0+`, `R9/5`, `R11+`, `CV8+`) — the label
> itself may be wrong, not just the time, and the seeding migration is one-shot, so they
> can only be fixed through the Shift Catalog UI.

### Demand — how a shift says when it runs

You said: *daily, weekly on certain days, certain days per week or month, weekdays,
weekends, holidays, every combination of the above, and more.*

No single setting holds that. So each shift carries a **list** of demand rules, and they
stack. Each rule is:

| field | meaning |
|---|---|
| **when** | `every day` · `weekdays` · `weekends` · `specific weekdays` · `nth weekday of month` · `specific dates` · `holidays` |
| **how many** | people needed on a matching day |
| **from / until** | optional date range, so a rule can start or stop without deleting it |
| **holidays** | `include` · `exclude` · `only` |

Rules are evaluated in order; the last one that matches a given day wins. That ordering
is what gives you "every combination" without inventing new syntax.

> **The four examples below are INVENTED by Claude to show the rule shape.** The shift
> names are real; the frequencies and headcounts are not — the owner has never stated a
> demand figure for any shift. Corrected 15 Aug after the owner rightly asked
> *"who said pedi cardiac is twice/month?"*

**`Call 24`** — *(invented example)* someone every single day, including holidays.
```
1. every day · 1 person · holidays: include
```

**`Admin AM`** — *(invented example)* weekdays only, two people, never on a holiday.
```
1. weekdays · 2 people · holidays: exclude
```

**`Pedi Cardiac`** — *(invented example)* twice a month, you choose which days.
```
1. 2 per month · 1 person · placement: admin chooses
```

**`OB PM`** — *(invented example)* one on weekdays, two at weekends, none on holidays.
```
1. weekdays · 1 person
2. weekends · 2 people
3. holidays · 0 people
```

**`Learner`** — no demand at all; exists in the catalog, appears only when you place it,
never counts as uncovered.
```
(no rules)
```

**The preview is not optional.** A rule set this expressive is easy to get subtly wrong,
and the failure is silent — a shift quietly demanded zero times, or seven times a week.
So the editor shows, live, *the next 60 days this shift is wanted and how many people*,
as a strip of dates, before you save. You should be able to see a mistake rather than
discover it in September.

**Holidays** need a real calendar. The vacation site already computes the five federal
holidays from the year with no admin input — MLK, Presidents', Memorial, July 4, Labor —
and that logic carries straight across, which also keeps the two sites consistent about
what a holiday *is*. You'll want to add your own group holidays on top (the day after
Thanksgiving, Christmas Eve, and so on).

---

## 2 · Compatibility — which shifts can be held together

**Your ruling: times, plus an explicit approved-pairs list.** Both, not either.

Taken literally that's 4,095 pairs (91 shifts). Nobody maintains that. So the two halves do different
jobs:

1. **Times and location filter automatically.** If two shifts overlap in time, or sit at
   different locations, they can never be combined. No approval can override it. This
   removes the overwhelming majority of pairs without anyone touching anything.
2. **What survives, you approve.** The Compatibility panel lists only the pairs that
   *could* work — non-overlapping, same site — and you tick the ones that genuinely
   may be held together.

   For instance `Admin AM + Admin PM` — yes. `4 to 8 + Call 24` — don't tick it.

**Owner ruling 15 Aug: one site per day, never both.** A site mismatch is therefore
impossible regardless of the hours — it is not a timing question at all. This makes the
site column near-mandatory data, and only 3 of the 91 shifts currently have one.

An unticked pair isn't forbidden, it's **unapproved** — and per your ruling that nothing
ever blocks, assigning one raises a warning you can override. The difference between
unapproved and impossible stays visible in the wording:

> ⚠️ `Pedi AM` and `Call 24` overlap 07:00–15:00. Dr. Okafor would be in two places.
> ⚠️ `4 to 8` and `Admin PM` don't overlap, but this pairing isn't on the approved list.

New shifts arrive unapproved against everything, which is the safe default, and the panel
shows a count of un-reviewed candidate pairs so the backlog is visible.

---

## 3 · People, groups, and the Rules section

### People today

Two attributes on this whole site: an FTE number, and a row in the eligibility grid.
That's it. No role, no group, no subspecialty. Which is why "a rule that applies to one
person or a group" currently has nothing to attach to.

### Proposed

Each person gets:

- **one primary role** — MD or CRNA
- **any number of groups** — peds, OB, admin, call-taking, non-call, per diem, locums,
  and whatever you add later

Groups are yours to create, not a fixed list I bake in — a Groups panel that works
exactly like Shift Families already does (create, name, colour, drag people in). A person
can be in several at once: an MD who is peds *and* call-taking *and* locums. Overlapping
tags, not a tree.

### What a rule looks like

A rule is a sentence with three parts — **who**, **what**, **how hard**:

| who | what | how hard |
|---|---|---|
| everyone · a role · a group · a combination · named people | the constraint | warn (overridable) |

Per your ruling, **everything is overridable**; every override is logged with who, when,
and against which rule.

Constraints worth having, roughly in the order I'd build them:

- **Rest** — at least N hours between the end of one shift and the start of the next
- **Post-call** — no clinical assignment the day after a shift tagged as call
- **Consecutive days** — no more than N worked days in a row
- **Weekly / monthly load** — no more than N shifts, or N call shifts, per week or month
- **Weekend fairness** — no more than N weekends in a row; even distribution
- **Only this group** — e.g. only the peds group may hold `Pedi Cardiac`
- **Never this pairing** — the explicit exception list from §2
- **FTE-proportional load** — a 0.5 FTE carries roughly half the shifts of a 1.0.
  Settled for reporting already (`DECISIONS.md` §29): the comparison pool excludes per
  diem and locums, a rate is taken **per 1.0 FTE** across the pool, and each person's
  expectation is that rate × their own FTE. The same maths should drive fairness.
- **Personal** — "Dr. Ferreira takes no call on Wednesdays"

Two things I want to flag rather than bury. The **eligibility grid and the rules will
overlap** — "only peds may hold Pedi Cardiac" can be said in either place, and if both
exist and disagree, you have a bug that's hard to see. My recommendation: the eligibility
grid stays the per-person truth, and group rules *drive* it (applying a group rule ticks
the grid) rather than sitting alongside as a second opinion. Worth deciding before either
is built.

And rules need a **conflict report** — a page that says "these two rules can never both
be satisfied" and "this rule is currently violated by 4 existing assignments." Otherwise
they accumulate silently until Auto-Populate can't fill anything and nobody knows why.

---

## 4 · The assignment model

**Your ruling: people can hold two day shifts, and no shift is ever silently replaced.**

Today a person's day is `{day, call, off}` — one slot each. Assigning a second day shift
writes over the first, silently, with no record that anything was lost. Five code paths
do this: the cell editor, Auto-Populate (month and year), request approval, and both swap
paths.

Proposed:

```
days.<dd>.<person> = {
  shifts: [ 'D10', 'ADMIN_PM' ],    // a list; order is not meaningful
  off:    false,
  note:   ''
}
```

Adding is adding. Removing is an explicit act with its own confirmation. There is no
operation that replaces a shift as a side effect — if a change would remove something,
the dialog names it:

> Assigning `Admin PM` to Dr. Reyes on 14 Sept.
> He already holds `D10` that day. `D10` and `Admin PM` are an approved pairing — he'll
> hold both.

versus

> ⚠️ He already holds `Call 24` (07:00–07:00). That overlaps `Admin PM`.
> **[Add anyway — he'll hold both]  [Replace Call 24]  [Cancel]**

**`kind: 'day' | 'call'` is RETIRED** (owner ruling 16 Aug, `DECISIONS.md` §25 and §27).
It did two unrelated jobs badly and `Eye Call` broke it — labelled call, runs 07:30–15:30,
not tracked as overnight call. In its place:

* **Tracking is universal** — every shift is counted per person per period, always, with
  no configuration.
* **Tags are what rules, fairness and reports point at** — admin-defined named sets of
  shifts, managed like Shift Families. The first is **Overnight call**, and the owner has
  set its starting membership to exactly `Call 16`, `Call 24`, `OB PM`. Nothing is
  derived: crossing midnight would wrongly include `RCH-ICU B`, and the call family would
  wrongly include `Eye Call` and `Call 12 AM`.

A shift can therefore be called "call", run daytime hours, and belong to no overnight-call
tag at all. `windowShiftCounts` — today the only real fairness input, and it counts day
shifts too despite every label calling it call fairness — gets rewritten to count a named
tag.

This change touches every reader as well as every writer: the admin grid, the staff grid,
Quick View, Stats, `windowShiftCounts` (call fairness), coverage, backup and restore. It
is the single largest item in this document and the one most in need of the test battery
being in place first.

---

## 5 · Uncovered shifts

Once §1 exists this is nearly free, and it's the thing you said you need "in case
something falls out."

A **Coverage board**: for a chosen range, every day × every demanded shift, showing
`filled / needed`. Anything short is flagged; anything at zero is flagged loudly. Filters
for "next 14 days," "this month," "call only," "unfilled only." From each gap you can jump
straight to the cell, or post it as an open shift in one click.

This also fixes the dashboard number. Coverage becomes *filled ÷ actually demanded*, which
is a figure that means something, instead of dividing by the whole catalog.

Worth adding, since you mentioned things falling out: a gap that appears **inside the next
7 days** is the one that matters at 6am. That deserves to be louder than a gap in
November — a count on the Dashboard, and eventually a notification.

---

## 6 · Order of work

Each stage is shippable on its own and leaves the site working.

| # | stage | why here | size |
|---|---|---|---|
| 0 | **Test battery for the schedule** | Nothing below is safe without it. Browser harness exists; it needs breadth. | medium |
| 1 | **Shift definition** — times, location, demand rules, preview, holiday calendar | Everything else reads this | large |
| 2 | **Coverage board** | Falls out of 1; immediate visible value | small |
| 3 | **Assignment model** — list, explicit add/remove | Unblocks two day shifts; touches everything | large |
| 4 | **People: roles + groups** | Nothing to hang a rule on until this exists | small |
| 5 | **Rules section** + conflict report | Needs 1, 3 and 4 | large |
| 6 | **Safety check + uniform confirmations** | The consumer of 1–5. Was going to be first; can't be — it would have nothing correct to check | medium |
| 7 | **Draft / publish + per-person change feed** | Now that assignments are rich, publishing has something worth diffing | large |
| 8 | **Staff phone view, notifications, Quick View fix** | Independent of all the above; can be pulled earlier if you want visible progress sooner | medium |
| 9 | **Reports (admin only)** — per-doctor shift counts with overnight call first, a dated call list, FTE-adjusted comparison | Needs only the Overnight-call tag, which is a thin slice of stage 1 — so this can come early | medium |

Stage 8 is deliberately movable. If the group starts using the site before the foundations
land, pull it forward — none of it depends on the rest.

Every stage: small changes, executed tests that fail on the previous build, adversarial
audit for anything that decides who works, and you push.

---

## 7 · Open questions

1. **Do shift times exist somewhere already** — a QGenda export, a spreadsheet? Typing 104
   start/end times by hand is the single biggest chunk of setup work here, and if the data
   exists in any form I can import it instead.
2. **Locations** — what's the real list, and is a person tied to one site on a given day?
3. **Eligibility vs. group rules** — do group rules *drive* the eligibility grid (my
   recommendation), or sit beside it?
4. **Per diem and locums** — are these scheduling groups, or do they also change how
   fairness counts? A locum probably shouldn't be in the same call-equity pool.
5. **"Certain days per week"** — is "2 call shifts per week, admin picks which" a *demand*
   on the shift, or a *limit* on the person? It reads like both, and they behave
   differently when unmet.
