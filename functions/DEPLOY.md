# The calendar endpoint — how it gets deployed, and what to check first

**Nothing here is live.** This folder is source only. Until somebody runs the deploy below, the
subscribe addresses on the admin's **Calendar Feeds** page do not answer, and the page says so.

---

## Before you deploy: two things that are NOT optional

### 1 · The link list must be locked down in `firestore.rules` first — DONE in the file, 30 Aug 2026 (§136)

`dailysched/feedTokens` holds the secret that stands in for signing in. The Stage 5 rules (§129,
published 30 Aug) made it and `dailysched/feeds/items/*` admin-only to WRITE; §136 closes the READ
side: the token list is readable by the schedule admin alone, and a rendered calendar by no client
at all — only the endpoint reads it, with admin credentials that bypass rules entirely.

`firestore.rules` lives in the **auction** repo and is closed by DECISIONS §92 without a specific
decision (§136 is that decision). **A rules change is an auction deploy** — `RA-2.command` first,
then publish it in the console, and publish it BEFORE the endpoint goes up, not after.

### 2 · Node on the Mac

The Firebase CLI is plain JavaScript: Node (which `RA-2.command` already uses) is all it needs.
If `npm install -g firebase-tools` fails, `xcode-select --install` is the likely fix, not a
prerequisite.

---

## The deploy

```
cd ~/Documents/GitHub/schedule/functions
npm install
npx --yes firebase-tools login                                              # once
npx --yes firebase-tools deploy --only functions:ics --project vacation-25e8e
```

(`npx` runs the CLI from a per-user cache — no `sudo`, no system-wide install. A global
`npm install -g` on a stock Mac fails with `EACCES` on `/usr/local/lib`; hit 30 Aug 2026.)
`firebase.json` beside this file tells the CLI the function's source is this folder and
its runtime is Node 22 (Node 20 is retired by Google on 30 Oct 2026 — the first deploy, 30 Aug, went
out on 20 and was redeployed on 22 the same day); `node_modules/` here is git-ignored and
`package-lock.json` is committed.

The CLI prints the live URL. It will look like:

```
https://us-central1-vacation-25e8e.cloudfunctions.net/ics
```

**If it differs, one line in `admin/index.html` changes:** `FEED_URL_BASE`. Nothing else on the
page knows the address.

---

## Checking it without involving a doctor

The release gate (§54) is shut, so nobody is told. To satisfy yourself it works, take one link
from the Calendar Feeds page and open it in a browser: you should get a plain-text file starting
`BEGIN:VCALENDAR`. Then check the three failure modes, which matter more than the success:

| try | should give |
|---|---|
| the real link | the calendar text |
| the link with one character changed | `404 Not found` |
| a made-up short token, e.g. `/abc` | `404 Not found` — the **same** answer, not a different error |

That last row is the point: a different reply for "wrong shape" and "no such feed" would tell
somebody probing which guess was closer.

---

## What this costs

Reads are **$0.03 per 100,000, with 50,000 free every day**. Each poll is **one** document read,
because the calendar is already rendered and stored. Even with every doctor subscribed and their
phones polling hourly, that is a few hundred reads a day — inside the free tier, indefinitely.

The shape that would have cost money is the obvious one: a function that reads the schedule and
builds the calendar per request, at ~120 reads a poll. It is not built that way, and it should
not be changed to be.
