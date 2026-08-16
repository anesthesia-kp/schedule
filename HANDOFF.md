# HANDOFF — Daily Schedule site

**As of 16 Aug 2026.** Companion to `NEXT-CHAT-START-PROMPT.md` (read that first),
`DECISIONS.md` (34 owner rulings) and `TODO.md` (open questions + 30 defects).

---

## ⛔ THE VACATION AUCTION COMES FIRST. ALWAYS.

The owner is building the schedule site **in parallel** with a **live, running** Vacation
Auction that serves ~60 anesthesiologists and continues **all year**.

> **No schedule work may degrade the auction. Not by a little, not temporarily, not
> "just while testing".** If a change to the schedule site carries any risk to the
> auction, it does not ship — regardless of how good it is or how much work went into it.

If the auction needs attention — a phase opening or closing, a results send, a live
incident — **schedule work stops** until it is settled. The auction is production. The
schedule is a prototype being built alongside it.

**What the two share, and therefore what to be careful with:**

| shared surface | why it matters |
|---|---|
| **One Firebase project** | Same database. The schedule uses `dailysched`; the auction uses `vacations`. |
| **`firestore.rules`** | Lives in the **auction repo**, and contains the `dailysched` block. A schedule rules change means editing an auction-repo file and publishing in the Firebase console — which is an auction deploy. Treat it as one. |
| **The roster** | `vacations/userList`, `usernames`, `loginEmails`, `emails`, `emailToUser` are written by the schedule's Users panel (owner ruling, `DECISIONS.md` §1). |
| **`vacations/emailToUser`** | The auction's bid-security map. The schedule rebuilds it on a login-e-mail save. Getting it wrong stops real people bidding. |
| **EmailJS quota** | Shared. The schedule sends nothing today; if notifications are ever built, they draw on the same allowance. |

**The guard:** `tests/sched/isolation-test.mjs` fails if the schedule gains a write
path to a `vacations/*` document outside the sanctioned Users-panel handlers
(`addSchedUser`, `saveSchedUser`, `saveSchedField`, `saveAllSchedUsers`, `removeSchedUser`,
`syncEmailToUserFromLogin`) — the rule the owner actually gave in §1, not the stricter
"zero writes" Claude first proposed and the owner rejected. Firestore rules
**cannot** enforce this — same project, same signed-in person — so the code plus that test
is the entire guarantee. Run it before filing anything.

---

## Where things stand

| | live | working tree |
|---|---|---|
| schedule admin | 49 — live | **50 filed, green, awaiting push** |
| schedule staff | 25 — live | **26 filed, green, awaiting push** |
| auction admin | 269 | clean |
| auction staff / mobile | 139 / 17 | clean |

**Build 49 / 25 (LIVE):** Shift Eligibility readability rebuild + demo banner
removed from both pages. No rules change → no Firebase console step.
Gates: `sched/elig-test.mjs` 33/33 executed in a browser · honesty `--pre` vs the build-48
fixture fails 9, none vacuous · isolation test 9 failures on 48 and 9 on 49 = **zero new
auction writes** · FTE-independence 5/5.

**Build 50 / 26 — GREEN and FILED, awaiting the owner's push.** Six small independent
fixes the owner approved (`DECISIONS.md` §33):

| # | fix | why it mattered |
|---|---|---|
| 1 | **Stale-build gate**, ported from auction 268 | the old reload was not cache-busted, so a CDN edge could re-serve the stale page — and the once-per-version guard then stranded that tab on the old build permanently. Now `?v=<latest>` + `location.replace()`, plus a re-check on tab refocus throttled to once a minute. |
| 2 | **Quick View month boundary** | the next-7-days strip read only the browsed month, so any day past the 1st showed blank. Now subscribes to every month the window touches. |
| 3 | **Staff error surface** | the staff page had **no way at all** to report a failure — 25 silent `catch` blocks. Added a toast, plain-language messages per Firestore error code, and a handled-rejection guard. |
| 4 | **Users-page lock** (`DECISIONS.md` §20, §30) | the agreed mitigation for roster writes reaching the live auction. Opens locked on every load, in-memory so it re-locks on reload, unlock behind a confirm that names the auction consequences, and a refusal guard at the top of all 8 mutating handlers — not just on the buttons. |
| 5 | **Missing audit entries** | `postOpen`, `removeOpen` and all four per-user field saves (name, login e-mail, KP e-mail, FTE) wrote with no trace. The unlock itself is audited too. |
| 6 | **Sticky name column** on the Schedule Grid | scroll right and you lost track of whose row you were on. |

It also carries the correction to the false `// vacations — READ-ONLY` comment, which the
isolation test now checks for.

**Gates, all executed on 16 Aug:**

* `tests/sched/build50-test.mjs` — **37/37**, three consecutive runs.
* Honesty `--pre` against 49/25 — **11 pass, 26 fail.** It must fail there or it proves nothing.
* `tests/sched/elig-test.mjs` — **33/33** against the build-50 bytes, and 33/33 against 49 as a control.
* `tests/sched/isolation-test.mjs` — **27/27** on the device against the filed bytes. **Zero new auction write paths.**
* Auction battery `tests/run-all.mjs` — **14 suites, 1074 assertions, green**, same numbers as before the change.

**One thing the auction battery caught, and it is worth remembering:** `test-audit-fixes.mjs`
is an *auction* suite that reaches into the *schedule* admin page — it extracts
`saveSchedField` and executes it. Build 50 put `usersLockedRefuse()` at the top of that
handler, and the extracted copy had no such function in scope, so the suite crashed and the
**auction battery went red on a schedule-only change**. Fixed by supplying
`usersLockedRefuse: () => false` in that suite's context (unlocked, which is the state its
duplicate-login test means to exercise; the lock itself is proved in `sched/build50-test.mjs`).
Nothing in production was affected — but it is a live example of the two sites touching, and
the reason the auction battery is run after **every** schedule change, not just the ones
that look shared.

---

---

## EVERY RULING ON THE RECORD — the index

`DECISIONS.md` is the authority; this is the map so a fresh session knows what exists
before it proposes something already settled. **Do not re-litigate any of these.**
The ones marked ⟵ **overruled Claude** — Claude recommended the opposite and was told no.

**The cardinal rule** — no schedule work may degrade the live Vacation Auction. Outranks
everything below it.

### Isolation and the shared surface
| § | ruling |
|---|---|
| 1 | The schedule's Users panel **keeps full write access** to the auction roster. ⟵ **overruled Claude twice** — Claude proposed severing those writes; the owner refused, and a phase gate is also ruled out because the auction runs all year. |
| 2 | **FTE is the schedule's own** (`dailysched/fteMap`) and must stay independent of the auction. |
| 30 | The mitigation for §1 is the **per-page lock**, not a gate and not a severance. |

### How the site behaves
| § | ruling |
|---|---|
| 3 | **Confirm every change** — uniform confirmation style, matching the auction. |
| 4 | **Nothing is ever blocked.** Warn, never refuse. |
| 5 | Requests made **before** a month is published are part of the draft; after publication they are changes needing approval. |
| 6 | The change feed is **personal** — a user sees only changes involving them. |
| 7 | Compatibility = **times AND an explicit approved-pairs list.** Times alone are not enough. |
| 8 | A person **can hold two day shifts.** A second shift must never silently replace the first. |
| 18 | **One site per day, never both.** Oakland and Richmond are the only sites. |
| 21 | "N per month" is a **debt the month owes** — track it and suggest dates. |

### Configuration — all of it admin-editable
| § | ruling |
|---|---|
| 9 | Shift demand supports **every imaginable frequency** — daily, weekly on given days, N per week, N per month, weekdays, weekends, holidays, and combinations. |
| 10 | **Groups**: MD vs CRNA is primary; each subdivides into pediatric, obstetric, admin, call/non-call, per diem, locums, and more. |
| 11 | **Everything admin-editable.** "When something changes, I don't have to go into code." |
| 12 | Lock / unlock for rarely-changed config. |
| 13 | **Group editing** of times and days. |
| 17 | Times and the clock: **24-hour always.** D = 07:30 + 8h · D10 = 10h · AP = 12h · all PM shifts start 15:30 · admin never runs past 17:30 · AM 07:30–11:30 · PM 13:30–17:30 · DPM 11:30–15:30 · CVPM 13:30–17:30 · Ev 15:30–23:30 · Pedi PM 13:30–17:30 · Eye Call 07:30–15:30. |
| 19 | **Group rules drive the eligibility grid** — including add and remove. |
| 20 | Locks are **one master switch per page**, not per field. |
| 23 | Bulk entry: **duplicate an existing shift first**, then edit. |
| 24 | The catalog is **91 shifts** (corrected — 104 was the highest `order` value, not a count). |

### Tracking, fairness and reports
| § | ruling |
|---|---|
| 25 | `kind: 'day' \| 'call'` is **retired.** Counting is universal; **admin-defined tags** are what rules, fairness and reports point at. |
| 26 | **Per diem and locums are OUT** of the fairness pools. |
| 27 | **Overnight call is a list the admin sets** — starting exactly `Call 16`, `Call 24`, `OB PM`. **Never derive it:** crossing midnight wrongly catches `RCH-ICU B`; the call family wrongly catches `Eye Call` (07:30–15:30) and `Call 12 AM`. |
| 28 | Reports, first set: **admin only**, per doctor, for a chosen day / month / quarter / year / range — how many of each shift, **calls at the top**, a **dated list of every overnight call**, and a comparison to the group. ⟵ **overruled Claude** — Claude's own suggested report contents were rejected as not useful. |
| 29 | Every comparison is **FTE-adjusted**, per diem and locums excluded, and **the method is printed inside the report.** |
| 32 | Report styling matches the auction — `REPORT_CSS` lifted **verbatim**, not approximated. |

### Process
| § | ruling |
|---|---|
| 14 | The demo banner is **removed** (shipped in 49/25). |
| 15 | Working discipline is **inherited from the Vacation Auction** — see the binding list below. |
| 16 | A full test battery to auction standard, plus **periodic adversarial audits** of new builds. |
| 22 | **Never present invented data as the owner's.** This exists because Claude did exactly that on 15 Aug and was caught. Label every placeholder, every time. |
| 31 | Fix the **Quick View bug now**; phone view and notifications later. |
| 33 | Build order: the **small independent fixes first** — which is build 50/26. |
| 34 | **One chat for both sites.** ⟵ **overruled Claude** — Claude recommended separate chats from general principle; a full day of evidence pointed the other way and the recommendation was withdrawn. |


## Sessions: ONE chat for both sites is working — keep it that way for now

Owner decision, 16 Aug, after a full day of working across both:

> *"It seems to be working for us to move back and forth like this."*

Claude had initially recommended separate chats, reasoning from general principles
(context budget, mis-filing risk). **The evidence from that day pointed the other way**
and the recommendation was withdrawn:

* The best of the schedule work came *from* having the auction in context — `REPORT_CSS`
  lifted verbatim rather than approximated, the stale-build gate ported from auction 268,
  the holiday calendar reusing the auction's federal-holiday computation, the
  rulings/handoff discipline mirrored because it was in view.
* **The cardinal rule was enforced better, not worse.** The 25 schedule→auction write
  paths were found in the first hour precisely because both systems were held at once.
* A stale claim in the records was caught in passing: the old handoff said the vacation
  battery carried 8 documented reds; run on 16 Aug it was **14 suites, 1074 assertions,
  all green**.
* The predicted mis-filing never happened. The one collision — an overwritten
  `.claude-commit-msg.txt` — was a per-commit scratch file, harmless either way.

The deeper reason: **the two sites are deliberately convergent.** Same visual language,
same confirmation style, same test discipline, same paperwork. Splitting the sessions
works against the goal.

**What makes it safe:** the repos hold the memory, not the chat. `DECISIONS.md`,
`TODO.md` and this file are kept current as work happens, so a fresh session picks up
cold regardless.

**Revisit only when** the schedule reaches the auction's scale — its own era fixtures, a
full battery, real users. Not before.

**Unchanged either way:** a Firestore rules change is an **auction deploy**. `firestore.rules`
lives in the auction repo and contains the `dailysched` block; publishing it in the
Firebase console affects the live auction. Gate it with the auction's discipline no matter
which site the change is for.

## SWITCHING SITES — do this every time, before anything else

The owner works **both sites from one chat**, a day or a session at a time: today the
schedule, tomorrow possibly the auction. That works, but it has one failure mode worth
naming — **not** confusing the two sites, which is easy to keep straight, but **answering
from stale in-context memory instead of from disk.**

A real example from 16 Aug: the previous handoff stated the vacation battery carried
"8 documented honesty-baseline reds". Run that day, it was **14 suites, 1074 assertions,
all green.** Quoting the document instead of running the suite would have meant being
confidently wrong about the health of a live system's safety net.

**So on every switch, re-ground from disk first — one turn, before any work:**

1. Read that site's `NEXT-CHAT-START-PROMPT.md` and its `TODO.md`.
2. Verify the live build: fetch `versions.json` **cache-busted**. Do not assume the last
   thing this chat said about it is still true — the owner pushes between sessions.
3. `git --no-optional-locks status --short --branch` on that repo, and on the other one
   too if anything might have crossed over.
4. Report the state in a few lines. Then work.

Cheap, and it has already caught two things: build 269 being live when the notes said it
was awaiting push, and the stale battery claim above.

**And when in doubt during the day: run it, don't recall it.** Both batteries run on the
owner's machine — `node run-all.mjs` (auction) and `node sched/run-all.mjs` (schedule).

## Working discipline — binding

* **The owner does every git push.** Claude files to the working tree and byte-verifies
  (md5 device vs cloud); the owner commits and pushes in GitHub Desktop.
* Never deploy. Never write to production Firebase.
* Smallest change → explicit "go" → only that change.
* Every fix ships with tests that **execute** real extracted code, plus an honesty check
  proving they fail on the previous build.
* Bump `var BUILD` **and** `versions.json` together.
* **Never present invented data as the owner's** (`DECISIONS.md` §22).
* **No reassurance without an executed reproduction.**
* This repo is **PUBLIC** — describe defects by shape, never by reproduction.
* Plain language. The owner is not a coder. Push back on bad ideas.

## Two traps a fresh session will fall into

1. **Module scope.** Both pages are one `<script type="module">`. A plain `function foo`
   is invisible to inline `onclick=`/`oninput=` handlers **and** to `page.evaluate` in
   tests. This has already caused one shipped-quality bug (`renderElig`, caught by the
   harness) and two false test failures. Expose with `window.foo=foo`, and assert through
   the DOM rather than by poking internals.
2. **The fake Firestore must fail like the real one.** `mergeFields()` catches an
   `updateDoc` rejection and retries with `setDoc`, so a one-shot denial is absorbed
   silently — `window.__denyPath` is sticky for that reason. And `tx.set` is synchronous
   in the real SDK; an earlier version of the fake dropped the rejected promise and
   reported denied writes as successful, which would have hidden exactly the bug class
   these tests exist to catch.

## Next actions, in order

1. ~~Push 49 / 25 + the docs~~ — **done, live 16 Aug.**
2. ~~Finish the build 50 harness~~ — **done. 50/26 is green and filed, awaiting the owner's push.**
3. **After the push:** verify `versions.json` live and cache-busted — it must read
   `{"index":26,"admin":50}`. Do not take this file's word for it.
4. Answer the open questions at the top of `TODO.md` — several are one-liners that unblock
   real work; the four SUSPECT call times are the most valuable.
5. Then **stage 1** (the shift editor) or **stage 9** (reports — needs only the
   Overnight-call tag, so it lands sooner).
