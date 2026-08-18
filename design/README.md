# design/ — mockups, not the app

Interactive previews used to settle a design with the owner **before** writing code.
None of them touch Firebase. None of them contain real schedule data.

| file | what it shows | status |
|---|---|---|
| `elig-grid-preview.html` | Shift Eligibility rebuild — family bands, vertical labels, pinned header, counts, filters | **shipped in admin 49** |
| `shift-editor-preview.html` | Stage 1 — times (24h), sites, stacking demand rules with a live 60-day preview, compatibility, per-page master locks, group edit | **built across 54–56** except compatibility + group edit (§13) |
| `reports-preview.html` | Reports — one report per person and per shift, reusing the auction's `REPORT_CSS` verbatim | **shipped in admin 51** |
| `UX-PLAN.md` | The 18 Aug overnight review: per-section visual diagnosis + fixes, industry patterns, missing-feature gaps, code-organization verdict, proposed build sequence, the 13 morning questions | plan, awaiting owner answers |
| `IDEAS.md` | The full-functionality ideas list (phones, e-mail, parity with the auction) — owner-requested 17 Aug | ideas only, nothing approved |
| `shift-times.xlsx` | Proposed times for all 91 shifts (92 since §39) | **owner is editing this** |

## shift-times.xlsx

The input for the bulk paste-a-list importer when stage 1 lands.

- **Green** rows — times the owner stated himself.
- **Amber** — Claude's estimate, with the reasoning in the last column. Four are marked
  SUSPECT: they were guessed on the assumption that a call-family shift runs
  evening/overnight, which `Eye Call` (07:30–15:30) disproved.
- **Red** — the shift *label* itself is unverified, transcribed from an unclear photo.
- **Site** is pre-filled from the owner's rule: Richmond if the label starts with RCH or R,
  Oakland otherwise. Two rows are marked CHECK ME where the rule did not decide cleanly.
- Hours and Overnight are formulas. Do not type over them.

**Do not regenerate this file** — the owner edits it in place.

## A caution

Every demand rule and headcount you see in a preview is invented, and each is labelled as
such at the point it appears. See `DECISIONS.md` §22 for why that rule exists.
