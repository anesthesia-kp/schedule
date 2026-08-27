// ══════════════════════════════════════════════════════════════════════════════
// THE CALENDAR ENDPOINT.  [110 · §54 · §54a]
//
// This is deliberately the whole thing. It looks a token up and returns the text that the
// admin page already wrote. It holds no schedule logic, performs no query, and names exactly
// one document path — so there is no code here that could reach `vacations/*` even by mistake.
// That is the entire reason it is safe to put on the project that runs the live auction: not
// "the code is careful", but "there is nothing in it to get wrong".
//
// ⛔ DO NOT ADD FEATURES TO THIS FILE. The moment it starts reading the schedule, or accepts a
// second path, or takes a query parameter that selects a document, the argument above stops
// being true and this becomes a general-purpose Firestore reader with admin credentials on a
// public URL. Anything clever belongs in the admin page, where it is tested.
//
// DEPLOY:  see DEPLOY.md next to this file. Nothing here is live until somebody runs it.
// ══════════════════════════════════════════════════════════════════════════════
const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

admin.initializeApp();

// A token is 32 lowercase hex characters and nothing else is even looked up. This is not
// politeness — it is what stops a crafted path segment being used to address another document.
const TOKEN_RE = /^[0-9a-f]{32}$/;

exports.ics = onRequest({ region: 'us-central1', cors: false, maxInstances: 3 }, async (req, res) => {
  // Calendar apps issue GET, and some issue HEAD first. Nothing else is answered.
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.set('Allow', 'GET, HEAD');
    return res.status(405).send('Method not allowed');
  }

  const token = String(req.path || '').replace(/^\/+/, '').trim();
  // The SAME reply for a malformed token and for one that does not exist. A different answer
  // for "wrong shape" and "no such feed" tells someone probing which of their guesses was
  // closer, which is the only feedback that makes guessing worth doing.
  if (!TOKEN_RE.test(token)) return notFound(res);

  let snap;
  try {
    snap = await admin.firestore().doc('dailysched/feeds/items/' + token).get();
  } catch (e) {
    console.error('feed read failed', e && e.message);
    return res.status(503).send('Temporarily unavailable');
  }
  if (!snap.exists) return notFound(res);

  const ics = snap.get('ics');
  // An empty or missing body is a bug on the writing side, and serving it would empty somebody's
  // calendar. Refuse instead: a subscription that fails is visible, a silent wipe is not.
  if (typeof ics !== 'string' || ics.length < 40) {
    console.error('feed present but unusable for token ending', token.slice(-6));
    return res.status(503).send('Temporarily unavailable');
  }

  res.set('Content-Type', 'text/calendar; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=1800');   // half an hour; apps poll far slower anyway
  res.set('X-Content-Type-Options', 'nosniff');
  // Not indexed, not framed, not referred onward. It is a private document at a secret address.
  res.set('X-Robots-Tag', 'noindex, nofollow');
  res.set('Referrer-Policy', 'no-referrer');
  if (req.method === 'HEAD') return res.status(200).end();
  return res.status(200).send(ics);
});

function notFound(res) {
  res.set('Cache-Control', 'no-store');
  res.set('X-Robots-Tag', 'noindex, nofollow');
  return res.status(404).send('Not found');
}
