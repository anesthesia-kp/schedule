# The calendar endpoint — how it gets deployed, and what to check first

**Nothing here is live.** This folder is source only. Until somebody runs the deploy below, the
subscribe addresses on the admin's **Calendar Feeds** page do not answer, and the page says so.

---

## Before you deploy: two things that are NOT optional

### 1 · The link list must be locked down in `firestore.rules` first

`dailysched/feedTokens` holds the secret that stands in for signing in. Under the current
`dailysched` catch-all **any signed-in user can read it** — which means any doctor can read any
other doctor's calendar. It must be added to `isSchedAdminOnlyDoc()`.

`firestore.rules` lives in the **auction** repo and is closed by DECISIONS §92 without a specific
decision. **This is a rules change, so it is an auction deploy** — gate it with auction
discipline, publish it in the console, and publish it BEFORE the endpoint goes up, not after.

`dailysched/feeds/items/{token}` should be **admin-write, and not client-readable at all** — only
the endpoint reads it, and the endpoint uses admin credentials which bypass rules entirely.

### 2 · The command-line developer tools are still missing on the Mac

`xcode-select --install`, then `xcode-select -p` must print `/Library/Developer/CommandLineTools`.
Recorded in `START-HERE.md` §6 as an open item; the Firebase CLI needs working Node tooling.

---

## The deploy

```
npm install -g firebase-tools          # once
firebase login                         # once
cd ~/Documents/GitHub/schedule/functions
npm install
firebase deploy --only functions:ics --project vacation-25e8e
```

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
