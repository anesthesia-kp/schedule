# Request types — design

**16 Aug 2026. DESIGN ONLY — nothing here is built.**
Companion preview: `design/request-types-preview.html`.
Rulings this rests on: `DECISIONS.md` §3, §4, §5, §6, §11, §20, §21, §22, §23, §25, §27, §41.

---

## What was asked for

The owner sent screenshots of the current system's **Task** dropdown and asked for it. He
confirmed the list is complete at **27 entries**:

| group | entries |
|---|---|
| **Work something** | MD Sat D · PACU MD · CVpm · DE · RCH, 8hr, MD only (R8:MD) · Admin · Admin AM · Admin PM · Req OAK Call · Req OAK Call AM · Req OAK Call PM · Req RCH Call |
| **Avoid something** | No Call · No OAK AM · No OAK PM · No Late [MAX] · No Late [HIGH] · No Late [LOW] |
| **Time off** | CV-Day Off · Day Off [MAX] · Day Off [HIGH] · Day Off [LOW] · Weekend Off · Use PTO if off · Ed Leave · Jury Duty (JD) |
| **Availability** | AVAILABLE |

Today the staff page offers **four**: `shift`, `dayoff`, `nocall`, `other`.

---

## The one thing that decides the whole design

> *"Not all shifts can be requested, that's why i want just these."* — owner, 16 Aug

Claude's first proposal was to generate the work-something entries from the 91-shift
catalog, so the list would never need maintaining. **That was wrong and was overruled**
(`DECISIONS.md` §41). Most shifts cannot be requested at all. Offering all 91 would invite
requests that can never be granted and move the refusal to the end of the process instead
of the start.

So the list is **curated by the admin**, exactly like the Overnight-call tag: the app never
works it out, a human sets it. §11 is still satisfied — the list is *data*, edited in the
admin UI, so it never needs a build.

---

## The model

Two objects. Nothing else.

### 1. A **shift list** — a named set of shifts

Already exists as of build 51: `dailysched/tags`, whose first entry is `overnightCall`
holding `Call 16`, `Call 24`, `OB PM`. Request types reuse it unchanged.

```
tags: {
  overnightCall: { label:'Overnight call', shifts:[…] },     ← shipped in 51
  oakCall:       { label:'Oakland call',   shifts:[…] },     ← new, admin-created
  oakCallAM:     { label:'Oakland call AM',shifts:[…] },
  rchCall:       { label:'Richmond call',  shifts:[…] },
  late:          { label:'Late shifts',    shifts:[…] },     ← what "No Late" points at
}
```

A list of **one** shift is still a list. `PACU MD` is a list containing PACU MD. That is
what lets every work-something and avoid-something entry use a single mechanism.

### 2. A **request type** — what the person picks

```
{
  id, label,        // "Req OAK Call" — exactly the wording they already use
  kind,             // work | avoid | off | absence | available
  targetTag,        // which shift list it points at (work / avoid only)
  strength,         // null | 'low' | 'high' | 'max'
  span,             // day | weekend | range
  usePtoIfOff,      // the "Use PTO if off" modifier, as a checkbox not an entry
  note,             // help text shown under the picker
  order, active
}
```

**Five kinds, and that is the whole vocabulary:**

| kind | means | needs a target |
|---|---|---|
| `work` | *give me this* | yes — a shift list |
| `avoid` | *don't give me this* | yes — a shift list |
| `off` | *I want the day off* | no |
| `absence` | *I am not available, and here is the reason* | no |
| `available` | *I am free and willing* | no |

Every one of the 27 entries is one of those five plus a target and a strength. Nothing in
the list needs a sixth.

---

## How the owner's 27 map onto it

| entry | kind | points at | strength |
|---|---|---|---|
| MD Sat D · PACU MD · CVpm · DE · Admin · Admin AM · Admin PM | `work` | a one-shift list each | — |
| RCH, 8hr, MD only (R8:MD) | `work` | a one-shift list | — |
| Req OAK Call | `work` | Oakland call | — |
| Req OAK Call AM / PM | `work` | Oakland call AM / PM | — |
| Req RCH Call | `work` | Richmond call | — |
| No Call | `avoid` | **Overnight call** *(the tag that shipped in 51)* | — |
| No OAK AM / No OAK PM | `avoid` | Oakland AM / Oakland PM | — |
| No Late [MAX] / [HIGH] / [LOW] | `avoid` | Late shifts | max / high / low |
| Day Off [MAX] / [HIGH] / [LOW] | `off` | — | max / high / low |
| CV-Day Off | `off` | — | — |
| Weekend Off | `off`, span = weekend | — | — |
| Use PTO if off | **not an entry — a checkbox on an `off` request** | — | — |
| Ed Leave · Jury Duty (JD) | `absence` | — | — |
| AVAILABLE | `available` | — | — |

**Two entries are not what they appear to be, and both are worth naming.**

**`Use PTO if off` is a modifier, not a request.** On its own it asks for nothing. It
answers *"and if you do give me that day off, take it from my PTO."* Modelled as an entry
it produces requests that cannot be approved or denied on their own terms. Modelled as a
checkbox on an `off` request it says exactly what it means. **The dropdown can still show
it** if the group expects to see it there — picking it would tick the box on the day-off
request rather than create a second one.

**`AVAILABLE` is the only entry that is not a constraint.** Everything else narrows what
can be given to a person. This one widens it. It matters because the coverage board and
open shifts should be able to see it, and because it should never be counted against
someone in a fairness balance.

---

## `[MAX]` / `[HIGH]` / `[LOW]` — shown as three, stored as one field

The current system lists the same request three times, once per priority. Copying that
shape exactly would mean the strength lives inside a text label, so:

* a queue can never be **sorted** by how badly someone wants it,
* a rule can never say *"grant MAX before HIGH"* without matching strings,
* every future priority-bearing type **triples** the list.

**The list on screen stays exactly as the group knows it** — `Day Off [MAX]`,
`Day Off [HIGH]`, `Day Off [LOW]`, three separate pickable entries, same wording. They are
three rows in the admin table sharing a `kind` and differing only in `strength`. Nothing
about the staff experience changes; the app simply understands the bracket.

**What strength does NOT do:** it does not decide anything by itself. Per §4 nothing is
ever blocked, and per §21 nothing is ever placed silently. Strength **sorts the admin's
queue and is printed on every request.** Whether MAX means "almost always grant this" is a
rule, and rules are stage 5.

---

## What the admin sees

> *"Also add an option in admin requests to be able to add new request types for users to
> request."* — owner, 16 Aug

**Admins create request types themselves. No build, ever, to add one.** That is the whole
point of modelling this rather than hard-coding 27 strings, and it is §11 applied.

**Where it lives, and why not simply inside the Requests page.** §20 gives each admin page
**one** master switch, and it puts the Requests page among the *daily-work* pages that
default **unlocked** — a lock on the daily job is friction every single time. Editing
request types is configuration and should default **locked**. Those two cannot both be true
on one page without a second, per-section lock, which §20 explicitly rejects.

So: **Request Types is its own page, locked by default, reached by a button at the top of
the Requests page** — `⚙ Request types →`. The owner gets to it from where he asked for it,
the queue stays friction-free, and §20 stays intact. If he would rather it sit under Setup
in the nav as well, that is a one-line change.

The page itself, behind its master lock (§20 — this is configuration).

* the 27 rows, in the order they appear to staff, each showing its kind, its target list
  and its strength in plain words: *"Req OAK Call — give me: any shift in Oakland call"*
* **Duplicate** an existing row first, then edit (§23 — the owner's stated preference, and
  these rows are near-identical in clusters)
* add / edit / reorder / deactivate; deactivating hides it from staff without deleting the
  history of requests already made with it
* a **shift-list editor** alongside, the same tick-list control the Overnight-call tag uses

Every change confirmed by name (§3), every change audited.

## What staff sees

The picker they already know: **"Type to Search…"**, the same 27 entries, grouped under the
four headings. Then a date (or a weekend, or a range), a strength if the entry carries one,
the PTO checkbox if it is an `off` request, and a note.

One addition the current system does not have, and it is the point of doing this at all:
**underneath the picker, in plain words, what the request actually means.** *"You are
asking not to be given any shift in Overnight call on Friday 4 September."* Per §3, and
because a 27-entry dropdown of abbreviations is exactly where a wrong pick hides.

## What the admin's Requests queue gains

* **sort by strength** — MAX at the top
* **filter by kind** — all the day-off requests together
* each request restated in plain words rather than as a code
* per §5, requests made before the month is published build the draft; after publication
  they are changes needing approval

---

## Honest dependencies — none of this is free

| needs | state |
|---|---|
| **Overnight-call tag** — what `No Call` points at | **shipped, build 51** |
| **A "Late" shift list** — what `No Late` points at | admin creates it; needs times, which are blank (§38) |
| **Site on shifts** — the OAK / RCH entries | **not built.** Stage 1, and Q10 still has residuals |
| **AM / PM sessions** — the AM/PM entries | not built; needs times, which are blank (§38) |
| **Assignment model as a list** — approving `work` requests | **stage 3, not built** |

**The OAK / RCH and AM / PM entries cannot be finished until stage 1 sets sites and times.**
They can exist as rows from day one — pointing at an empty shift list, which the admin
fills in as the data arrives — but a request pointing at an empty list must say so rather
than silently match nothing. That is the failure mode to design against.

## What this makes worse until stage 6

**Defect 1: approving a request writes an assignment with no eligibility, capacity,
vacation or collision check.** The hand-editing path checks; the queue path does not. Going
from 4 request types to 27 multiplies the ways into that gap. This is not a reason to
delay — it is a reason stage 6 must not be skipped, and a reason `work` requests should
carry a warning at the point of approval even before stage 6 lands.

## Open — deliberately not invented

The screenshots show **Limits** and **Balances** tabs along the bottom: the current system
caps how many of each request type a person may make per period, and tracks what they have
left. **Nothing about that has been specified**, so nothing about it is designed here.
Per §22 it is left empty rather than filled in with something plausible.

Also unanswered: whether a denied request should carry a reason (defect 16), and whether a
person may withdraw one (defect 15). Both become more visible with 27 types than with 4.
