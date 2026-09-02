# Flashbox

Landing page and operating playbook for an unattended, portable photobooth business —
a booth that gets delivered to a wedding or party, takes its own payments, prints, resets
itself, and goes home. No attendant on site.

## What's here

```
index.html          the landing page
assets/styles.css   design system + all page styles (no framework, no build step)
assets/app.js       scroll reveals, the live booth demo in the hero, enquiry form
docs/playbook.md    how to actually build and run the business
```

## Run it

No build step, no dependencies. Open `index.html`, or serve it:

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

## Design notes

One deliberate visual world: a dark room lit by a flash. Ink-violet ground, safelight
amber and flash-gel magenta as the two accents, print-paper cream for anything that
represents a physical strip. Syne for display, Instrument Sans for body, DM Mono for
labels and the printed-strip captions.

Sections are separated by sprocket-hole perforations rather than plain rules, and the hero
runs the actual booth loop — attract screen, countdown, flash, strip ejecting into the
tray. Numbering appears only in "How it works", where the order is real information.

Everything is painted from CSS custom properties in `:root`; there is no second theme by
design, so every colour is explicit and the page holds up on any host background. Motion
is fully disabled under `prefers-reduced-motion`.

## Before it goes public

`docs/playbook.md` §9 lists every placeholder. The short version: real email, real phone,
real prices, and **replace the three testimonials with real ones** — they are written as
illustrative copy, not as claims.

## Deploying

Any static host. GitHub Pages: Settings → Pages → deploy from `main` / root.
Cloudflare Pages or Netlify: point at the repo, no build command, output directory `/`.
