# Site audit — 2026-09-03

Visual and code review of the landing page. Method: headless Chrome screenshots at
1440px, plus a true 390px viewport (headless Chrome will not size a window below
500px wide, so the page was framed in a 390px iframe). Contrast ratios are computed,
not eyeballed.

Nothing in this list has been fixed yet.

## Layout bugs

1. **Mobile: the printed strip lands on top of the headline.** `.strip-stack` hangs
   `bottom:-42px` off the booth (`assets/styles.css:190`), and at <=900px
   `.hero-booth{order:-1}` (`assets/styles.css:131`) puts the booth above the copy with
   only a ~32px gap. The strip drops through the eyebrow label and the words
   "photobooth / that shows". Confirmed at 390px.
   *Fix:* reserve space for the strip in the mobile hero, or move the stack inside the
   booth below 900px.

2. **"from $350" renders at 3rem display weight.** `index.html:197` — "from" sits inside
   `.plan-price`, inherits 48px/800, and wraps to its own line. The Venue Residency price
   block becomes two lines tall, pushing its divider rule and feature list out of
   alignment with the other two cards.
   *Fix:* wrap "from" in a small span.

3. **The bento grid has a dead third column.** Five tiles at spans 2+1, 1+1, 2 = 7 cells
   in a 3-column grid (`index.html:99-137`), so rows 2 and 3 leave the right third empty.
   *Fix:* widen the Prints tile to span 2, or reorder.

4. **No `scroll-margin-top` anywhere.** The nav is sticky (`assets/styles.css:95`), so
   every anchor link (`#how`, `#packages`, `#faq`) drops the section's eyebrow label
   underneath it.
   *Fix:* `[id]{scroll-margin-top:5rem}`.

5. **Nav links vanish under 860px with no replacement** (`assets/styles.css:109`). Mobile
   gets brand + one button; the footer links are the only fallback.

## Contrast (measured, WCAG AA)

| Element | Ratio | Needs |
|---|---|---|
| Marquee text, `--ink-500` on `--ink-900` (`styles.css:216-220`) | 1.6:1 | 3:1 |
| `.form-note` (`styles.css:355`) | 3.3:1 | 4.5:1 |
| `.foot-fine` (`styles.css:369`) | 3.5:1 | 4.5:1 |
| Input placeholders (`styles.css:353`) | 3.5:1 | 4.5:1 |
| `#fff` on magenta, primary CTA (`styles.css:77`) | 3.5:1 | 4.5:1 |

The marquee is the priority — it is the only place the event types are listed and it is
near-invisible. The CTA is fixable without touching the pink: `--ink-900` text on magenta
gives 5.7:1.

## Typography

- `h1` at `line-height:1.02` (`styles.css:57`) is tight enough that descenders nearly
  touch the next cap line at 5.1rem. 1.05-1.08 breathes without losing the display feel.
- `.section-head{max-width:56ch}` (`styles.css:227`) sizes `ch` against the body font
  while constraining a Syne heading, so the intended measure does not apply. "Four things
  happen. You're involved in one of them." breaks to four short lines against 1180px of
  content below it.
- `h3` is fixed at 1.2rem (`styles.css:60`) while `h2` scales to 3.1rem — the gap looks
  large above 1440px.
- `.strip-foot` at `.42rem` (~6.7px, `styles.css:205`) is below reliable rendering size.
  Decorative, low priority.
- Font weights are clean: Syne 700/800 and Instrument Sans 400/500/600 are each loaded,
  nothing is synthesised.

## Missing / risky

- **No favicon, no `og:image`, no canonical URL** (`index.html:6-13`). For a vendor whose
  link gets pasted into WhatsApp and Facebook, the imageless preview is the one that costs
  bookings.
- `overflow-x:hidden` on `body` (`styles.css:53`) masks overflow instead of preventing it,
  and can break sticky positioning in Safari. `overflow-x:clip` is the safer form.
- The native date-picker icon is dark-on-dark in the booking form; needs `filter:invert(1)`.

## Content

- Locale is mixed: "colours", "13A socket" and "PAT tested" (`index.html:248`, `:292`) are
  British, but prices are in `$` and copy says "40 miles". Pick one.
- Still open from playbook section 9: three invented testimonials attributed to named
  people (`index.html:219-233`), and placeholder email/phone (`index.html:261`,
  `assets/app.js:146`).
