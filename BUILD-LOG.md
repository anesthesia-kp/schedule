# BUILD LOG — Daily Schedule

**Why this file exists.** On 16 Aug the owner asked: *"do i really have all the commit
summaries?"* The answer was **no**. Several commits carry a test file's opening lines
instead of the summary written for them, and one auction commit says only "hosuekeeping".

Nothing substantive was lost — `DECISIONS.md` holds every ruling and `HANDOFF.md` holds the
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
| **61** | —  not pushed yet | 16 Aug 2026 | Defect 1 — ONE definition of "is this assignment a problem?". Request and swap approval now run the same eligibility / capacity / vacation / collision checks the cell editor runs; warns and records an override, never blocks (§51). Eligibility checked on every path for the first time, closing half of defect 4. |
| **60** | —  not pushed yet | 16 Aug 2026 | The config locks open by default (§50) — Shift Catalog, Report settings, Simulator. The Users page and the unconverted-month guard deliberately stay closed (§50a), and both refusals are asserted so a later session cannot "finish the job". |
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

The summary for the build you are about to push is written to **`.claude-commit-msg.txt`**
in each repo. That is the file to copy from — not the source file, and not the test file.
It is gitignored, so it never shows up in GitHub Desktop's changed-files list; open it from
Finder or a text editor and paste the whole thing into the commit box.
