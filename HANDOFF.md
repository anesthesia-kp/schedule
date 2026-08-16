# HANDOFF — Daily Schedule site

**As of 16 Aug 2026.** Companion to `NEXT-CHAT-START-PROMPT.md` (read that first),
`DECISIONS.md` (29 owner rulings) and `TODO.md` (open questions + 30 defects).

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

**The guard:** `tests/tests-schedule-isolation.mjs` fails if the schedule gains a write
path to a `vacations/*` document outside the sanctioned Users-panel set. Firestore rules
**cannot** enforce this — same project, same signed-in person — so the code plus that test
is the entire guarantee. Run it before filing anything.

---

## Where things stand

| | live | working tree |
|---|---|---|
| schedule admin | 48 | **49 — filed, awaiting push** |
| schedule staff | 24 | **25 — filed, awaiting push** |
| auction admin | 269 | clean |
| auction staff / mobile | 139 / 17 | clean |

**Build 49 / 25 (ready to push):** Shift Eligibility readability rebuild + demo banner
removed from both pages. No rules change → no Firebase console step.
Gates: `sched/elig-test.mjs` 33/33 executed in a browser · honesty `--pre` vs the build-48
fixture fails 9, none vacuous · isolation test 9 failures on 48 and 9 on 49 = **zero new
auction writes** · FTE-independence 5/5.

**Build 50 / 26 — WRITTEN, NOT GREEN, NOT FILED.** Lives only in the working session, not
in the repo. Six small independent fixes the owner approved: stale-build gate ported from
auction 268, Quick View month-boundary bug, a staff error surface (the page had none at
all), the Users-page lock, the missing audit entries, and a sticky name column. The suite
`sched-harness/build50-test.mjs` exists and most of it passes; the staff sign-in step is
flaky under test (it works standalone — whoami resolves — so this is a harness timing
problem, not a page bug). **Finish the harness before filing any of it.**

---

## Sessions: keep the two sites in SEPARATE chats

Recommended, and the reason matters.

- **Context.** Each site has a large body of rulings and defects. One session carrying
  both spends its context on the wrong half and starts forgetting.
- **The cardinal rule is easier to hold** when a session's own start prompt says *"the
  auction is live, you are not working on it."* Mixing them invites a session to treat
  both as equally in-play.
- **Mis-filing risk.** Two repos with similar file layouts, one agent, one working tree
  each — the failure mode is filing an edit into the wrong repo, and it is silent.

**The one real coupling:** a schedule change that needs a Firestore rules edit has to
touch the **auction repo** and be published from the Firebase console. When that happens,
do it from the **auction** session, not the schedule one, and treat it as an auction
deploy with the auction's gates.

Each start prompt should name the other site and say plainly which one it does not govern.

---

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

1. Owner pushes **49 / 25 + the docs** (3 modified, 6 new in `schedule`; 2 new in `tests`).
2. Finish the **build 50** harness, then file and push it.
3. Answer the open questions at the top of `TODO.md` — several are one-liners that unblock
   real work; the four SUSPECT call times are the most valuable.
4. Then **stage 1** (the shift editor) or **stage 9** (reports — needs only the
   Overnight-call tag, so it lands sooner).
