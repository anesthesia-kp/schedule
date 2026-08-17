# BUILD LOG — Daily Schedule

**Why this file exists.** On 16 Aug the owner asked: *"do i really have all the commit
summaries?"* The answer was **no**. Several commits carry a test file's opening lines
instead of the summary written for them, and one auction commit says only "hosuekeeping".

Nothing substantive was lost — `DECISIONS.md` holds every ruling and `anesthesia-kp.github.io/HANDOFF.md` holds the
per-build detail, and both are committed — but the *commit history on its own* no longer
tells the story. So the story lives here too, in a file that is committed and cannot be
lost to a mis-paste.

**Every build gets a row here, written at the same time as the code.** A poor commit
message then costs nothing.

The build number below is authoritative: it was read out of `var BUILD` in that commit's
own bytes, NOT taken from the commit's subject line — two subjects are wrong, and they are
flagged. Where the full prose survives it is in the named commit, or in
`~/Documents/GitHub/_archive/schedule/commit-messages/`.

| build | commit | date | what shipped |
|---|---|---|---|
| **staff 29** | —  in working tree, awaiting owner push (with 64) | 17 Aug 2026 | §55 — USERS CANNOT REQUEST INELIGIBLE SHIFTS (defect 4's staff half, closing defect 4 entirely). The staff page had subscribed to the eligibility grid forever and never read it. Now: the request dropdown offers only the signed-in user's eligible shifts; the submit handler refuses an ineligible shift even against a manipulated page; late-arriving eligibility refreshes the list; a no-ticks user gets an honest empty state. Hard block by owner ruling — a deliberate exception to §51, which still governs admin overrides. Stored request shape unchanged. Gates: staff29-test 19/19 ×3 · honesty --pre vs 28 = 7 pass/12 fail on exactly the defect · isolation 27/27 · elig 33/33 · build64 re-run green · auction battery RAN GREEN in-session 17 Aug (14 suites / 1,074, honesty skipped). |
| **64** | —  in working tree, awaiting owner push | 17 Aug 2026 | Defect 12 — TYPING SURVIVES. renderAll() rebuilt the Users grid and the baseline grid on every snapshot, replacing every input mid-edit; unsaved typing died. Build 55's catalog guard (whose comment named defect 12 as the same shape) now covers both grids: rows are left alone while focus is inside; one rebuild with fresh data on focus-leave (250ms settle). Same accepted trade as [55]. Gates: build64-test 19/19 ×3 · honesty --pre vs 63 = 9 pass/10 fail on exactly the defect · isolation 27/27 · elig 33/33 · auction battery RAN GREEN in-session 17 Aug (14 suites / 1,074 assertions, honesty blocks skipped — old baselines unavailable in-cloud). |
| **63** | `c0021e4` — pushed, live | 16 Aug 2026 | The AUDIT LOG stops forgetting. It was never a size problem — it trimmed itself at 400 entries and kept 300, silently discarding the rest, including build 61's override records. Now one document per entry in `auditLog/entries`, never trimmed, read newest-300 with a real query. Pre-63 entries still shown, merged, with no conversion step (append-only, so unlike §47 it cannot split-brain). Also fixes `isolation-test`, which had stopped completing at all — `startsRegex()` re-scanned the whole emitted buffer per `/`, which went quadratic on a 318 KB page and hung the CARDINAL-RULE suite with no output. |
| **62** | `b2e0458` — pushed, live. ⚠️ carries builds 61 AND 62 in one commit, and its subject describes the TEST SUITES, not the build | 16 Aug 2026 | §49a — BOTH the real holiday and the federal observed day count, for all holidays (Independence Day 2026 = Sat 04 Jul AND Fri 03 Jul), including the cross-year case where 1 Jan on a Saturday is observed 31 Dec of the year before. Plus §52 — the Shift Catalog grouped by family with headings, and sortable by family / catalog order / A–Z. |
| **61** | inside `b2e0458` (with 62) — pushed, live; no commit of its own | 16 Aug 2026 | Defect 1 — ONE definition of "is this assignment a problem?". Request and swap approval now run the same eligibility / capacity / vacation / collision checks the cell editor runs; warns and records an override, never blocks (§51). Eligibility checked on every path for the first time, closing half of defect 4. |
| **60** | `15822e3` — pushed, live | 16 Aug 2026 | The config locks open by default (§50) — Shift Catalog, Report settings, Simulator. The Users page and the unconverted-month guard deliberately stay closed (§50a), and both refusals are asserted so a later session cannot "finish the job". |
| **59** | `b7dd372` | 16 Aug 2026 12:48 | §47 — a month became one document PER DAY (`sched_YYYY-MM/days/{DD}`). Unconverted months are shown in full but read-only behind a banner; converting copies in one atomic batch and keeps the old record as a backup. Plus the repo housekeeping and the `_archive/` folder. ⚠️ **commit message lost** — a test file was pasted instead. |
| **58** | `9f8a8b1` | 16 Aug 2026 11:25 | Stage 2 — COVERAGE against demand, closing defect 6. "Nothing has been asked for" and "nothing has been filled" are reported as different states. |
| **57** | `1e4e39c` | 16 Aug 2026 11:02 | Renaming a shift: the label changes, the internal id never does. |
| **56** | `3e2b6cc` | 16 Aug 2026 10:53 | Stage 1 — BULK ENTRY: duplicate-an-existing, and paste-a-list with a preview. |
| **55** | `427cab8` | 16 Aug 2026 10:39 | Stage 1 — DEMAND rules (stacking, last match wins), the holiday calendar, and tab-through time entry. ⚠️ **its commit message says "Build 54"** — the code is build 55. |
| **54** | `8763e18` | 16 Aug 2026 08:01 | Stage 1 — shift TIMES and SITES in the Shift Catalog, with the 24-hour parser and midnight-aware durations. |
| **53** | `e3cfef3` | 16 Aug 2026 07:46 | The Testing section — auto-populate and Clear Month moved behind rehearsal mode (§45). |
| **52** | `cbd4a5b` | 16 Aug 2026 07:20 | THE ASSIGNMENT MODEL — a list per person per day, closing defect 2 (the silent overwrite). ⚠️ **its commit message says "Build 51"** — the code is build 52. |
| **51** | `0027a5e` | 16 Aug 2026 07:12 | Reports — per-doctor shift counts, dated comparisons, FTE-adjusted fairness, and the overnight-call tag. |
| **50** | `ebf7a27` | 16 Aug 2026 | Small-fix batch — stale-build gate, Quick View month boundary, staff error surface, Users lock, audit log, sticky name column. Closes defects 11, 14, 19, 30. |
| **49** | `9dbbd9b` | 15 Aug 2026 | Eligibility rebuild; demo banner on both pages. |

## Two commits whose message names the wrong build

Recorded here rather than rewritten. Rewriting pushed history to correct a message is a far
bigger risk than an inaccurate label, and the CODE in both commits is correct.

- `cbd4a5b` contains **build 52**; its message says "Build 51".
- `427cab8` contains **build 55**; its message says "Build 54".

## The tests repo

Seven of its recent commits carry a test file's contents as the message
(`6cee6a6`, `c097b38`, `0a88e0a`, `f8d6565`, `60c9942`, `0c208b9`, `8ba3348`). Each one is
the battery for the schedule build of the same era, and the schedule row above describes
what it covers. Nothing is missing from the test files themselves — every suite opens with
a header comment stating what it proves and what its honesty check is.

## How to not lose another one

The summary for the build you are about to push is written to **`COMMIT-MESSAGE.txt`** in
each repo — deliberately NOT a dotfile (the old `.claude-commit-msg.txt` was invisible in
Finder because of the leading dot, which is exactly how messages got lost). It is
gitignored but visible; open it and paste the whole thing into the commit box. It is also
delivered to the chat outputs column every build. Copy from either — never from a source or
test file.
