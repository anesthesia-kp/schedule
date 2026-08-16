# DOC MERGE — the first task of the next session. Read this before anything else.

**Owner ruling, 16 Aug 2026:** *"I need a perfect solution so that all future sessions know
exactly what to do from my single next chat prompt and from my handoff summary… a single
handoff summary stored in the right location that explains what's happening in both vacation
and scheduling… I don't want any drift or confusion."*

**⚠️ THE OWNER HAS WORK PLANNED ON BOTH SITES IN THE SESSION THAT READS THIS.** Do this merge
FIRST — it is what makes working across both sites in one chat safe — then ask what they want
to build. Do not let the merge consume the whole session; it is a few hours of careful
editing, not a rebuild.

---

## 1. WHY. The problem, measured — not an opinion

Five rules currently exist in FOUR copies each, across the two handoffs and the two start
prompts:

| rule | copies |
|---|---|
| FILE HYGIENE / archiving | 4 |
| COMMIT SUMMARIES | 4 |
| `git --no-optional-locks` safety | 4 |
| `COMMIT-MESSAGE.txt` | 4 |
| `_archive/` | 4 |

And it demonstrably drifts: the CONTEXT ROT rule, written 16 Aug, landed in **1 of the 4**
within the same session. The cardinal rule is in the two SCHEDULE docs and **neither**
vacation doc — so a both-sites session started from the vacation prompt never reads the rule
that protects the auction.

The two start prompts also disagree about authority: the vacation one declares it supersedes
`handoff.md`; the schedule one makes no such claim. With both pasted, "which wins" has no
answer.

**The fix is not fewer files. It is ONE HOME PER FACT.**

---

## 2. WHERE IT GOES — `anesthesia-kp.github.io`

Put the two new documents in the **`anesthesia-kp.github.io`** repo.

Reason: a document governing BOTH sites must not live inside EITHER site's repo. That repo is
already the org-level umbrella both apps sit under, it currently holds only a landing page,
and it is neutral by construction. No new repo needed.

Then put a **three-line pointer** named `START-HERE.md` in each of `schedule/`,
`vacation-kp.github.io/` and `tests/`, so the answer to *"where do I look?"* is **anywhere —
they all point to the same place.** That is what actually ends the confusion.

---

## 3. THE TARGET — exactly two documents, plus unchanged reference files

### `anesthesia-kp.github.io/START-HERE.md`  — THE ONLY THING THE OWNER EVER PASTES
Target ≤ 150 lines. If it grows past that, something belongs in HANDOFF instead.

    1. THE TWO SITES, AND HOW THEY INTERCONNECT
       - Vacation Auction (LIVE, anesthesia-kp.github.io/vacation/) and Daily Schedule.
       - ONE Firebase project. Auction data in vacations/*, schedule data in dailysched/*.
       - WHAT THEY GENUINELY SHARE — write this out explicitly, it is the thing that makes
         them one system: vacations/userList, usernames, emails, loginEmails, emailToUser.
         The schedule READS approved vacations. FTE is SEPARATE per site — same person,
         two numbers, never synced.
       - The ONE sanctioned exception: the schedule's Users page writes the shared roster.
    2. ⛔ THE CARDINAL RULE — verbatim from schedule/HANDOFF.md:14. Never abbreviate it.
    3. BINDING WORKING RULES, ONE COPY EACH
       commit summaries · file hygiene · context rot · git safety over the bridge ·
       the file-transfer method when staging is blocked · smallest-change discipline ·
       never deploy, never write production Firebase, owner does every push.
    4. WHERE THINGS STAND — 4–6 lines per site. Build numbers and what is next. Nothing else.
    5. THE MAP — what to read for what:
         HANDOFF.md ............ current state, per-site detail, traps
         DECISIONS.md .......... every ruling (§1–§53), schedule
         TODO.md ............... open questions and known defects
         BUILD-LOG.md .......... one row per build, what shipped
         tests/sched/ .......... schedule battery      tests/ ....... auction battery

### `anesthesia-kp.github.io/HANDOFF.md` — ONE handoff, both sites

    A. SHARED — what is true of both (architecture, deploy flow, the bridge, batteries)
    B. VACATION AUCTION — its current state, backlog, traps
    C. DAILY SCHEDULE — its current state, next actions, traps
    D. THE RULING INDEX — pointer to DECISIONS.md, not a copy of it

### Unchanged, stay where they are
`schedule/DECISIONS.md`, `schedule/TODO.md`, `schedule/BUILD-LOG.md`,
`vacation-kp.github.io/TODO.md`. These are READ FROM DISK, never pasted.

---

## 4. HOW — order of operations

1. **Read all eight documents from disk first.** Do not merge from memory. Inventory as of
   16 Aug 2026 (verify these are still current before starting):

       schedule/HANDOFF.md                    656 lines
       schedule/NEXT-CHAT-START-PROMPT.md     317
       schedule/DECISIONS.md                  959   (unchanged by this merge)
       schedule/TODO.md                       382   (unchanged)
       schedule/BUILD-LOG.md                   59   (unchanged)
       vacation-kp.github.io/handoff.md       420
       vacation-kp.github.io/NEXT-CHAT-START-PROMPT.md  119
       vacation-kp.github.io/TODO.md          109   (unchanged)

2. **Build the extraction checklist BEFORE writing anything** (see §5). You cannot verify
   nothing was lost unless you listed it first.

3. **Write `START-HERE.md` FROM SCRATCH.** Do not paste-and-trim. Both current start prompts
   are grown-over documents; copying them forward carries the sprawl into the new file.

4. **Write `HANDOFF.md` by MOVING sections**, not rewriting them. Where both handoffs carry
   the same rule, keep ONE copy and delete the other — the surviving copy goes in START-HERE
   if it is shared, in HANDOFF's per-site section if it is not.

5. **Delete the stale build sections.** These are all pushed and live as of 16 Aug and are now
   historical noise in a "current state" document — `BUILD-LOG.md` is their proper home:
       schedule/HANDOFF.md: "Build 52 / 27 — FILED, NOT PUSHED", "Build 51 — pushed and
       live", "Build 59 / 28 — FILED, NOT PUSHED", "Build 60 — FILED, NOT PUSHED".
   Also: `schedule/HANDOFF.md` has **TWO** sections literally titled "Next actions, in order"
   (lines 425 and 612). Keep the later one; it is current.
   `vacation-kp.github.io/handoff.md` §1 is headed "CURRENT STATE (3 Aug 2026)" and the
   auction is now at admin 269 — re-derive from `versions.json`, do not trust that heading.

6. **Replace the old entry points with pointers.** `schedule/NEXT-CHAT-START-PROMPT.md` and
   `vacation-kp.github.io/NEXT-CHAT-START-PROMPT.md` become three lines each pointing at
   `anesthesia-kp.github.io/START-HERE.md`. Archive the originals to
   `_archive/<repo>/superseded-docs/` per the FILE HYGIENE rule — do not delete them.

7. **Commit summary per repo, short** — four repos are touched. Deliver them with
   `SendUserFile` to the outputs column AND write `COMMIT-MESSAGE.txt` in each.

---

## 5. PROVING NOTHING WAS LOST — do this, do not eyeball it

**A. Every ruling still resolves.** `DECISIONS.md` is not being edited, but the handoffs
reference rulings by number. As of 16 Aug there are **37 distinct** §-numbers in play:

    §1 §2 §4 §10 §11 §12 §13 §17 §19 §20 §21 §22 §23 §25 §26 §27 §29 §32 §34 §35 §38
    §42 §43 §44 §47 §47a §49 §49a §50 §50a §50b §50c §51 §51a §51b §52 §53

Extract every `§NN` mentioned in the OLD handoffs and assert each still appears in the NEW
documents or in DECISIONS.md. A ruling referenced by a handoff that no longer names it is a
silent loss.

**B. Every `##` heading is accounted for.** List the headings of both old handoffs (19 + 12
as of 16 Aug). For each, record one of: MOVED to START-HERE / MOVED to HANDOFF section A, B
or C / DELETED as stale (name which build made it stale) / MERGED with a named duplicate.
**No heading may be unaccounted for.** Put this table in the commit message.

**C. Every binding rule survives exactly once.** Grep the NEW documents for each of: cardinal
rule, file hygiene, commit summaries, context rot, `no-optional-locks`, `COMMIT-MESSAGE.txt`,
`_archive`. Each must appear in **exactly one** of the two new files. More than one is the
original disease.

**D. The load-bearing specifics that are easy to lose.** Confirm each is still written down:
  - the four traps a fresh session falls into (HANDOFF.md:381) — especially trap 1, module
    scope being invisible to inline `onclick=` and to `page.evaluate`
  - the git lock-file incident and why the bridge must never mutate a git index
  - the file-transfer method when `device_stage_files` is blocked (diff → gzip → base64 in
    ~12 KB chunks, md5 at every step; a single large blob LOSES BYTES)
  - how to run either battery from a cloud session, and the baseline trap: a suite reads the
    CURRENT build from the repo and the PREVIOUS build from `/mnt/user-data/uploads/...`;
    stage the current build to both and every honesty check compares a build to itself
  - the two commits whose message names the wrong build (`cbd4a5b` = 52, `427cab8` = 55)

---

## 6. THE RULE THAT STOPS IT REGROWING — add this to START-HERE.md

> **A fact has ONE home.** Anything true of BOTH sites lives in `START-HERE.md` and is
> referenced, never restated, everywhere else. Anything true of ONE site lives in that site's
> section of `HANDOFF.md`. Before adding a rule to any document, grep for it in the others; if
> it is already somewhere, point at it instead of repeating it. Duplicating a rule is how the
> pre-merge documents drifted, and the drift was measurable within a single session.

---

## 7. WHAT "DONE" LOOKS LIKE

- The owner pastes ONE document and a fresh session can work on either site, or both.
- Every one of the five duplicated rules exists exactly once.
- The §5 checks A–D all pass, and the heading table is in the commit message.
- `git status` in all four repos shows only intended changes.
- The originals are in `_archive/`, not deleted.
