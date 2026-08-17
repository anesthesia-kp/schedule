> ⚠️ **STATUS, 17 Aug 2026: LARGELY BUILT.** This document is the DESIGN as written before
> building. What shipped and when is in `BUILD-LOG.md`; what is outstanding is in
> `anesthesia-kp.github.io/TODO.md`. Statements below like "nothing here is built" are
> HISTORICAL. Design reasoning remains valid; status claims do not.

> Specifically: the ruling this file says is missing NOW EXISTS — DECISIONS §53/§53a/§53b.
> Two statements below are OVERRULED by it: groups are NOT free-floating (§53b: subgroups
> are within-category, MD or CRNA), and per-person monthly caps ARE wanted (§46 reversed
> §21's deferral). Read §53b before this file.

# Stage 5 — rules and the conflict report

**16 Aug 2026. DESIGN ONLY — nothing here is built.**
Companion preview: `design/rules-preview.html`.
Rests on `DECISIONS.md` §4, §7, §8, §10, §11, §18, §19, §21, §25, §26, §29, §35.
**Depends on stage 3** (`design/ASSIGNMENT-MODEL.md`) and on a slice of stage 4 that does
not exist yet — see *The blocker* below.

---

## The blocker, first, because it decides the shape

§10 says a rule targets **everyone · a role · a group · a combination · named individuals**.

**There are no roles and no groups on people.** A person's record holds name, username,
login e-mail, KP e-mail and FTE, and nothing else — verified against the live admin page on
16 Aug. `role` exists, but it is on **shifts**, and defect 23 records that it is decorative:
stored, shown, filtered in the catalog, and never once compared to a person.

So stage 5 cannot be built without a slice of stage 4, and **that slice needs a ruling
rather than a guess** (§22). What is proposed below is a proposal, not a settled design.

### The minimum slice

Two things on a person, no more:

```
dailysched/people:  { AR: { role: 'MD' } }              ← one primary role, single choice
dailysched/groups:  { pedi: { label:'Pediatric', members:['AR','CL'], fairness:true } }
```

* **Role is single-choice, and there are two of them: MD or CRNA.** Owner, 16 Aug (§42):
  *"MDs are always different users from CRNAs."* Nobody is both.
* **`Both` belongs on the SHIFT, not the person** — it means either an MD or a CRNA may
  cover that shift. This makes the shift's `role` field mean something for the first time:
  defect 23 records that it is currently decorative, stored and filtered but **never
  compared to a person**. With people carrying a role it becomes a real eligibility
  constraint — you may only be given a shift marked for your role or marked *Both* — and
  defect 23 closes by *using* the field rather than deleting it. Defect 21 resolves the same
  way: `MD / CRNA / Both` is correct on a shift; it is the list of **person** roles that
  must be data rather than baked in (§11).
* **Groups are named sets of people, and a person may be in any number** — pediatric,
  obstetric, admin, call/non-call, per diem, locums, *"and probably more"*. Admin-created,
  not a fixed list in code, not a tree.
* **This is the same control as shift lists**, which are named sets of shifts. One tick-list
  pattern, used for tags (shipped in 51), for request targets, and now for people.
* **`fairness` on the group is where §26 lands** — per diem and locums are excluded from the
  balancing maths, *"set on the group, not hard-coded"*. **The group sets it and a person may
  override** (§43). Claude argued against the override on §19 grounds — two places that can
  answer the same question is exactly the shape that ruling warns about — and was overruled.

  **The override is accepted on one condition, which is part of the ruling and not optional:
  it must be visible everywhere it matters.** On the person (*"In Per diem, which does not
  count toward averages — individually overridden to count"*), on the group (listing members
  whose individual setting disagrees with it), and **inside the report**, where §29 already
  requires the method and the exclusions to be printed. One answer with visible exceptions,
  not two answers that quietly disagree. The per-person switch that shipped in build 51
  becomes the override; the group becomes the source.

**Both questions this section previously left open are now answered** — §42 and §43.

---

## Rule types are code; rule instances are data

The owner drew this line himself (§11):

> *"Minimum hours between shifts is built once; after that the owner creates as many
> instances as wanted, for anyone, with any numbers, without a build. A genuinely new kind
> of constraint is a build."*

So the design is a **small, fixed vocabulary of rule types**, each with parameters, and an
unlimited number of instances the admin creates.

### The proposed first set

| type | parameters | what it catches |
|---|---|---|
| **Minimum rest** | N hours | back-to-back shifts with too little gap |
| **Post-tag cooldown** | after tag **X**, for N days, avoid tag **Y** (or require off) | post-call days |
| **Not more than** | N of tag **X** per week / month | too much call in a stretch |
| **Not together** | shift **A** with shift **B** | the approved-pairs list (§7) |
| **Not on vacation** | — | a shift landing on approved vacation |
| **One site per day** | — | §18, and it is universal rather than an instance |
| **Fairness balance** | tag **X**, across a population, tolerance ± | uneven call |

**Everything points at a tag, never at `kind`.** §25 retired `kind: 'day' | 'call'`; the
first tag, **Overnight call**, shipped in build 51 with the owner's own three shifts in it.
`Eye Call` is the reason this matters — a shift can be called "call", run 07:30–15:30, and
belong to no overnight-call tag at all (§27).

**Fairness reuses build 51's maths, unchanged.** A rate per 1.0 FTE across a pool, times
each person's own FTE, per diem and locums outside the pool (§29). Two implementations of
that arithmetic would eventually disagree, and the report is the one people will trust.

---

## Nothing is ever blocked. Ever.

> *"Safety checks warn and let you override. Nothing is hard-blocked."* — §4

Every rule produces a **warning**, never a refusal, and **every override is recorded with
who, when, and which rule.** The owner's stated reason stands: real scheduling breaks its
own rules, and a tool that fights you at 6am gets worked around.

What a rule *may* carry is a **severity** — for sorting the report and for deciding how loud
the confirmation is — but severity never becomes a veto:

| severity | in the report | at the moment of the change |
|---|---|---|
| **Serious** | top, red | a confirmation that names the rule and requires a deliberate yes |
| **Warn** | middle, amber | named in the ordinary confirmation |
| **Note** | bottom, grey | listed, not raised |

---

## The conflict report

One page, one month, every violation currently standing:

* grouped by severity, then by date
* each row: **who · when · which rule · what specifically** — *"Dr. Reyes has 8 hours
  between Call 24 ending Friday 07:30 and D10 starting Friday 07:30 — the rule asks for 10"*
* a click goes to that day cell
* a second section: **overrides accepted** — warnings someone deliberately went past, with
  who and when. Not a list of failures; a record of decisions.
* **it never fixes anything by itself.** §21's principle generalises: the app suggests, a
  person accepts. Nothing is placed, moved or removed silently.

**It is a report, not a gate.** Publishing a month with conflicts standing is allowed, and
the publish confirmation names how many are outstanding.

---

## Order of work, and why stage 5 is not first

Stage 6 (the safety check and uniform confirmations) was originally going to be built
first. It moved back because a safety check has nothing correct to check against until the
shifts, the assignment model and the rules exist — the owner's 15 Aug input (two day shifts
per person, per-shift demand, a rules section) is what made that clear. **Do not move it
forward again.**

Stage 5 has the same dependency running the other way:

| needs | state |
|---|---|
| **Times on shifts** | blank everywhere by §38 — *minimum rest* and *not together* can be authored, but match nothing until times are entered |
| **Sites on shifts** | stage 1, Q10 residual — *one site per day* is unenforceable without it |
| **Tags** | **Overnight call shipped in build 51.** Others are admin-created |
| **The assignment model as a list** | **stage 3** — a rule reasons over "the shifts this person holds that day", which is a list |
| **Roles and groups** | **does not exist.** The slice above, and it needs a ruling |

**A rule that cannot match anything must say so**, on the rule itself and in the report —
*"this rule is not checking anything: no shift in Late shifts has a time set."* A quiet
zero-violations report on a rule that never ran is worse than no rule at all, and it is the
same failure the Reports section was designed against in build 51.

## Deliberately not designed

**Per-person monthly caps.** §21: *"Per-person monthly caps are NOT wanted yet — shift
demand only, revisit once the Rules section exists."* The Rules section now exists on paper,
so this is the moment it was deferred to — but it is the owner's call, not an assumption.
The *Not more than* type above is the natural home for it if he wants it.

**Request limits.** The current system's Limits and Balances tabs cap how many of each
request type a person may make. Unspecified, so not invented (§22). If wanted, it is a rule
type pointing at request types rather than at shifts.
