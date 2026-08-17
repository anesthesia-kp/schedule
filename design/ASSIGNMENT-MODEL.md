> ⚠️ **STATUS, 17 Aug 2026: LARGELY BUILT.** This document is the DESIGN as written before
> building. What shipped and when is in `BUILD-LOG.md`; what is outstanding is in
> `anesthesia-kp.github.io/TODO.md`. Statements below like "nothing here is built" are
> HISTORICAL. Design reasoning remains valid; status claims do not.

> Specifically: SHIPPED as build 52. Defect 1 closed in build 61 (§51), NOT by stage 6 as
> written below. Months became a subcollection in build 59 (§47), retiring the defect-8
> paragraph. Defect 3 (swap atomicity) is still real.

# Stage 3 — the assignment model

**16 Aug 2026. DESIGN ONLY — nothing here is built.**
Companion preview: `design/assignment-model-preview.html`.
Rests on `DECISIONS.md` §3, §4, §8, §11, §18, §21, §25. Closes defect **2**, and is what
requests, rules, the coverage board and the change feed all sit on.

---

## The ruling this exists to satisfy

> *"People can definitely have 2 daytime shifts. No shift can ever just be replaced. Good
> to have the warning, but some day shifts are compatible together."* — owner, 15 Aug (§8)

## What is there now

One document per month, `dailysched/sched_YYYY-MM`:

```
days: { "04": { AR: { day:'D10', call:null, off:false } } }
```

**Two slots and a flag.** A person holds at most one day shift and at most one call shift.
That is not a storage detail — it is a rule about the world, baked into the shape, and it
is the wrong rule.

**Defect 2 in the actual code.** Approving a shift request does this:

```
patch = { ...cur, day:null, call:null, off:false, [kind]: r.shiftId }
```

It clears **both** slots and sets one. If the person already held a day shift, it is gone —
no warning, no record, nothing in the audit log naming what was removed. The same shape
appears in the swap apply and in auto-populate. A person cannot hold two day shifts because
the second one deletes the first.

**Roughly twenty places** across the two pages read or write `{day, call, off}` — the grid,
both Stats modes, `windowShiftCounts`, auto-populate, the conflict checker, request and
swap approval, open-shift claims, the staff Quick View and personal calendar, and the
Reports collector added in build 51.

---

## The shape it becomes

```
days: { "04": { AR: {
  a: [                                   // ← the assignments, in the order they were added
    { s:'D10',    by:'someone@…', at:1756…, via:'manual'  },
    { s:'CALL24', by:'someone@…', at:1756…, via:'request' }
  ],
  off: false,
  note: ''
} } }
```

**`a` is a list, and a list has no opinion about how many day shifts a person may hold.**
Whether two particular shifts may be held together is a *rule* (§7 — times and an approved
pairs list), checked at the moment of the change and **warned about, never blocked** (§4).
It is not a question the storage should be answering.

**`off` stays a separate flag**, because being off is not a shift. Assigning a shift to
someone marked off warns; it does not silently clear the flag, and clearing the flag does
not silently happen as a side effect of anything.

**Per-assignment provenance — `by`, `at`, `via`.** Not decoration. `via` is one of
`manual · auto · request · swap · open`, and it is what makes the per-person change feed
(§6, stage 7) possible without reconstructing history from the audit log. It also answers
the question that gets asked in real life: *"who put me on that?"*

---

## Migration: there isn't one

**No mass rewrite, no one-shot self-marking migration, no moment where the app is half
converted.** Defect 24 is the standing warning here — the v2 catalog seeding marked itself
done, and editing the source constants afterwards has no effect on an already-seeded
database. That pattern is not repeated.

Instead, **one normaliser, used by every reader**:

```
shiftsOf(cell)  →  if cell.a exists, it is the truth.
                   otherwise, build it from [cell.day, cell.call], skipping blanks.
```

* Old months keep working, for ever, unread and unrewritten.
* New writes produce `a`.
* **A cell converts the first time it is changed**, in the same write that changes it: read
  the old pair, build the list, apply the change, write `a`, and delete `day` and `call`.
  One atomic write per cell, only for cells someone actually touches.
* The rule is absolute and must be stated in code: **if `a` is present, `day` and `call` are
  ignored.** Never merged, never used as a fallback. Two sources for one answer is how the
  eligibility grid nearly went wrong (§19).

The whole conversion is therefore: add `shiftsOf`, route ~20 read sites through it, replace
every whole-cell write with the three writers below. No data migration is executed at all.

---

## Writing: three operations, and none of them is "replace"

Every mutation today is a whole-cell overwrite — `{...cur, day:null, call:null, [k]:id}` —
which is exactly how a shift vanishes without anyone deciding it should. Replaced by:

| operation | what it does |
|---|---|
| `addShift(date, user, shiftId, via)` | appends. Never removes anything. |
| `removeShift(date, user, shiftId)` | removes **that named shift** and nothing else. |
| `setOff(date, user, bool)` | sets the flag. Touches no shifts. |

**"Replace" becomes remove-then-add, explicitly, named in one confirmation** — *"Take D10
off Dr. Reyes and put Call 24 on"* — rather than an implicit consequence of a dropdown
changing value (§3, §8).

All three run inside a transaction on the fresh cell, the way `txUpdateList` already does
for requests and swaps, so two admins working the same day cannot lose each other's change.
The current whole-cell `mergeFields` write has exactly that lost-update hole.

**Every one is audited by name**, including what was removed — `removeOpen` in build 50
already had to learn to capture what it was removing *before* the transaction, and this is
the same lesson.

---

## What the admin sees

The day cell stops being *"Day shift ▾ / Call shift ▾"* and becomes a **list with an Add
button**:

```
Dr. Alan Reyes — Friday 4 September
  D10        07:30–15:30   added by you, manually        [Remove]
  Call 24    07:30–07:30   added from a request          [Remove]
  + Add a shift
  ☐ Off this day
```

* **Add** offers the shifts this person is eligible for, and says why each ineligible one is
  missing rather than hiding it.
* Adding something that conflicts **warns and lets you do it anyway** (§4), and the override
  is recorded with who, when, and which rule — *"Warning: Call 24 overlaps D10 by 30 minutes.
  Add anyway?"*
* **Site conflicts are different and worth naming.** §18 makes site a property of the whole
  day: one site per person per day, never both. So Oakland + Richmond on one day is not a
  timing question and no amount of gap makes it work. It still warns rather than blocks —
  §4 has no exceptions — but the warning says *"these are at different sites"*, not
  *"these overlap"*.
* Nothing is ever removed as a side effect of adding.

## What it unblocks

| | |
|---|---|
| **Stage 2 — coverage** | `filled / needed` needs to count how many people hold a shift on a day. Countable today, but only up to one-per-slot. |
| **Request types** | approving *Req OAK Call* must **add** a call without disturbing a day shift already there. Impossible in the current shape. |
| **Stage 5 — rules** | a rule reasons over "the shifts this person holds that day". That is a list. |
| **Stage 7 — change feed** | `via` and `by` are what a personal feed is built from. |
| **Reports (built, 51)** | counts become complete. Today they are honest about what was *saved*, and the report says so — but what was saved is lossy wherever defect 2 bit. |

## What this does NOT fix

**Defect 1 stays open.** Request and swap approval will still write assignments without
checking eligibility, capacity, vacation or collision — the checks live in the hand-editing
path (`cmConflicts`) and the queue path does not call them. Stage 3 makes the *write* safe
(nothing is silently destroyed); it does not make the *decision* checked. **Stage 6 is what
closes that**, and stage 3 is a prerequisite for it, not a substitute.

**Defect 3 stays open** — swap apply is not atomic with swap status, self-declared in the
code. Worth folding into this build since the swap writes are being rewritten anyway.

**Defect 8 gets closer to mattering.** Each month is one document and Firestore caps a
document at 1 MB; a list per person per day with provenance on each entry is bigger than two
strings. Still nowhere near the cap at 60 people, but the subcollection migration is cheap
now and expensive later, and this build is the natural moment to reconsider it.

## The honesty gate this build has to pass

A test that proves the *old* shape can no longer silently destroy an assignment:

1. seed a person holding `D10`
2. approve a shift request for `Call 24`
3. assert they hold **both**, and that the audit log names the addition

Run against build 51 that must **fail** — today the approval clears `day` and the person
ends the test holding only `Call 24`. If it passes on the pre-fix bytes it is proving
nothing, which is the standing rule.
