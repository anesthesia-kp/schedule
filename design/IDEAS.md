# IDEAS — what makes the Daily Schedule fully functional for ~60 busy physicians

**Requested by the owner, 17 Aug 2026:** *"a thorough list of ideas as to what changes or
updates would make the schedule site fully functional with its model and formatting based
off the vacation site. My schedule site needs to have all functionality for a group of busy
physicians. They will need to have access to the schedule from their phones, either apple
or andoird. They will need e-mail updating and alerts."*

**IDEAS ONLY. Nothing here is approved, scheduled, or built.** Items marked **ASK** need an
owner ruling before design. Effort tags: S (a build), M (a few builds), L (a stage).
The already-agreed roadmap (stages 4–8, defects) is in `anesthesia-kp.github.io/TODO.md`;
this file is what sits AROUND that roadmap to make the site genuinely usable day-to-day.

---

## 1 · PHONES — Apple and Android

The confirmed need. The cheapest strong answer is not native apps — it is the web app
working properly on a phone plus the phone's own calendar doing the daily work.

- **1a (M) · A phone-first "Me" view.** Today's staff page is a desktop grid shrunk to 9px
  (defect 17). A doctor on a phone wants one question answered in two seconds: *where am I
  today, and what's coming?* One column: today, tomorrow, this week — my shifts, my call,
  my vacation, tap for detail. This is stage 8's core and should be its first slice.
- **1b (S) · Per-doctor calendar feed (`.ics`).** Each doctor subscribes ONCE from their
  phone (works identically on iPhone and Android); their shifts then appear inside the
  calendar app they already live in, updating automatically when the schedule changes. No
  login, no app, no habit change — for a busy physician this is the single
  highest-value/lowest-effort item on this page. **ASK:** feed shows shifts only, or also
  group events? Private-link security (a per-doctor secret URL) needs a short ruling.
- **1c (S) · Add-to-home-screen.** A manifest + icon so "install" from the browser gives a
  full-screen app feel. Cheap veneer over 1a, no native code.
- **1d (S) · Touch fixes already on the defect list:** drag-and-drop fallback (18), tap
  targets, sticky name column behaviour on small screens.
- **1e · Native apps — recommend NO.** Two app stores, review cycles, signing, updates —
  for a 60-person internal tool the web + 1b covers the need. Revisit only if push
  notifications (see 2e) ever become a hard requirement.

## 2 · E-MAIL UPDATES AND ALERTS — the confirmed need, and a real constraint

**The constraint first: the schedule shares the auction's EmailJS quota.** 60 doctors ×
per-change alerts could starve the LIVE auction's results e-mails. Any design here must be
quota-shaped from day one.

- **2a (M) · Alert triggers — ASK which of these, per doctor:** schedule published/changed
  for a day you work · your request decided (with the reason — defect 16) · a swap
  involving you needs your answer · an open shift you're eligible for is posted · "you are
  on call tomorrow" reminder.
- **2b (M) · Digest by default, instant only where it matters.** One evening e-mail
  ("your week changed: …") instead of a message per edit. Instant only for
  needs-your-action items. This is the quota answer and also the busy-physician answer —
  nobody wants 15 e-mails on schedule-build day.
- **2c (S) · Per-doctor opt-in levels** (all / digest / needs-my-action only / none),
  managed on the staff page, stored per user.
- **2d · Plumbing decisions — ASK:** reuse the auction's EmailJS template (consistent look,
  shared quota) or a second EmailJS account for the schedule (isolated quota, second bill)?
  The auction's mail-queue pattern (claim, ledger, honesty about partial sends) should be
  ported either way — it is already debugged.
- **2e · Push notifications — park it.** Real push needs a service worker + permission
  prompts, and e-mail + calendar feeds cover the need. Note for the record; do not build.

## 3 · THE MODEL — what must exist before the group can rely on it

These are roadmap items; listed because "fully functional" depends on them.

- **3a (L) · Stage 4 + stage 5 — subgroups, then the rules engine (§44).** The point of
  the site. Two §53b answers still owed first.
- **3b (L) · Draft / publish + per-person change feed (stage 7).** The auction's deepest
  lesson applied here: **nothing is visible until it is deliberately published** (the
  Phase-4 round machine exists precisely so unsent results are never seen). The schedule
  needs the same: admins work on a draft; publishing is an event; the diff per person is
  recorded — and that change feed is exactly what 2a's e-mails and 1b's calendar updates
  consume. Build once, feed three features.
- **3c (M) · Request types, full build** — designed and waiting (`design/REQUEST-TYPES.md`);
  needs the "late" tag and the Limits/Balances ruling (**ASK**, §22).
- **3d (M) · Withdraw + denial reasons** (defects 15, 16) — small, but they are the
  difference between a tool doctors trust and one they phone the scheduler about.
- **3e (M) · Subcollection migration for `requests`/`swaps`/`openShifts`** (defect 8's
  remainder) — single documents will not survive 60 people daily; §47 already proved the
  migration pattern on months, and it unlocks the defect-9 security fix.
- **3f (S) · Swap atomicity** (defect 3) — a half-applied swap on a live schedule is a
  phone call from an OR. Close it before real use.

## 4 · AUCTION PARITY — discipline the auction has that the schedule lacks

The two sites are deliberately convergent; these are the auction's hard-won pieces worth
porting, roughly in value order.

- **4a (M) · Backup / cloud restore for `dailysched/*`.** The auction can snapshot and
  restore itself; the schedule cannot. Before the group relies on it, "undo the disaster"
  must exist. Port the auction's backup shape, including every-restore-lands-safe.
- **4b (S) · The `requiredBuilds` ratchet** (defect 30's residual) — the push-driven
  force-forward for stranded tabs. Small, already designed, ported once already in spirit.
- **4c (M) · A NEVER-EVENTS charter + suite for the schedule.** The auction names its
  unthinkables and a suite proves each (`test-never-events.mjs`). The schedule's list
  writes itself: a published assignment vanishing without an audit entry · two people
  silently holding the same single-capacity shift · a doctor scheduled while on approved
  vacation without an override record · an unpublished draft visible to staff · any write
  to `vacations/*` outside the sanctioned handlers.
- **4d (M) · Battery depth to auction standard** (stage 0's gap): button sweep, full
  lifecycle run-through, engine fuzz, mobile sweeps, an audit-handlers equivalent.
- **4e (S) · Dashboard "next step" guidance.** The auction's dashboard tells the admin
  what to do next; the schedule's should too once draft/publish exists (build month →
  check coverage → resolve conflicts → publish → send digests).
- **4f (S) · Visual/format parity where it is not already done:** the auction's confirm
  style, danger styling, and REPORT_CSS are ported; keep new pages to the same language so
  the two sites feel like one product.

## 5 · SMALL QUALITY ITEMS — cheap, high goodwill

- **5a (S)** Print/PDF of the day's board for the places a screen isn't welcome.
- **5b (S)** "Who's here today" — a read-only day view by site (Oakland/Richmond), the
  question charge nurses and colleagues actually ask.
- **5c (S)** Report export already matches the auction's styled Excel (build 51) — extend
  to the coverage board when stage 5 lands.
- **5d (S)** The remaining hardcodings (defects 20, 22) — admin e-mails and the site URL
  into config, per §11.

---

**A sequencing thought, not a decision:** 1b (calendar feed) and 2b (digest) both want 3b's
change feed underneath them. If the owner wants phone value BEFORE the big stages land, 1a +
1b can ship against the CURRENT model (feed = current published month, updates on edit) and
be re-pointed at draft/publish later — the doctor-visible behaviour would not change.
