# Building an unattended photobooth business

Everything below is the operational half of Flashbox: what to buy, what to run on it,
how it takes money without you there, and whether the numbers work.

The single hard problem is this: **an unattended booth has to do every job an attendant
does.** Take money, print, recover from its own errors, and shout for help before a guest
notices anything is wrong. Solve those four and the business model works, because staffing
is the biggest line item in every competitor's price.

---

## 1. Two build paths — pick one before you spend anything

| | **Tablet booth** | **Camera booth** |
|---|---|---|
| Capture | iPad Pro / iPad 11" front camera | Mirrorless body (Canon R50, Sony a6400) tethered |
| Brain | The iPad itself | Mini PC (Windows 11) — Beelink / Intel NUC |
| Software | Breeze Booth for iPad, Simple Booth HALO, Snappic | dslrBooth, Darkroom Booth, Breeze Booth for Windows |
| Build cost | ~$2,000–2,800 | ~$4,000–6,000 |
| Image quality | Good; obviously a tablet in low light | Genuinely good; sells weddings |
| Failure modes | Very few moving parts | More parts, more to go wrong unattended |
| Verdict | **Start here.** Ship, learn, earn. | Second unit, once you know what breaks. |

Start with the tablet booth. It is the same business with a third of the capital at risk,
and an unattended tablet booth is far easier to make reliable than an unattended DSLR rig.

---

## 2. Bill of materials

**Printer (this is the part that matters most).** Dye-sublimation only — never inkjet.
Prints come out dry, and one media roll runs unattended for hours.

- DNP DS-RX1HS — 700 × 4×6, i.e. **1,400 × 2×6 strips per roll**. The industry default.
- DNP DS620A — better quality, does 6×8, slightly slower.
- Citizen CX-02 / HiTi P525L — cheaper alternatives, thinner spare-parts market.

Budget $900–1,400 for the printer and ~$100–130 per media kit. Buy **two printers before
you buy a second booth** — a spare printer is the cheapest insurance you will ever buy.

**The rest**

- Compute: iPad Pro, or a mini PC with 16GB RAM (Windows 11 Pro — you need Pro for kiosk lockdown).
- Screen: 24" touchscreen for the camera build; guests need prompts they can read from 4ft.
- Light: a 18–21" bi-colour LED ring or a soft panel. Flat, even, forgiving. This is the
  difference between "nice photo" and "why does everyone look grey".
- Card reader: see §4.
- Enclosure: an aluminium photobooth shell from an established manufacturer, or a road case
  build. Whatever you choose it must roll through a service door, up a ramp, and into a
  passenger lift, and be assembled by two people in 15 minutes.
- Connectivity: a 4G router (Teltonika RUT241, GL.iNet) with its own data SIM. **Never
  depend on venue wifi.** Venue wifi is a captive portal that logs you out at 11pm.
- Power: a small UPS (500VA) so a tripped socket doesn't corrupt a print job mid-roll.
- Consumables kit that lives in the case: spare media, spare ribbon, cleaning kit, gaffer
  tape, cable ties, a printed one-page "if something looks wrong, text this number" card.

---

## 3. Making it run itself — the software layer

This is where most of the engineering time goes. Booth software handles capture, layout
and printing out of the box; you are building everything around it.

**Lockdown**
- Windows 11 Pro: auto-login → **Assigned Access / Shell Launcher** so the booth app *is*
  the shell. No desktop, no task manager, no Alt-Tab.
- iPad: **Guided Access** or Single App Mode via an MDM (Apple Business Manager + Mosyle/Jamf).
- Disable Windows Update reboots during event hours. A booth that reboots for updates at
  9:40pm on a Saturday is a refund.

**Self-recovery**
- A watchdog service that restarts the booth app if it exits or stops heartbeating.
- Session timeout: any screen that isn't the attract loop returns to the attract loop after
  60 seconds of no touch. This one rule prevents most "the booth is stuck" calls.
- Print queue: retry twice, then **stop selling sessions** and auto-refund the affected
  charge rather than take money for a print you can't deliver.
- Offline queue: capture and print work with no network; uploads and receipts sync later.

**Remote control**
- Tailscale on the booth machine (zero config, works behind any venue NAT) plus
  RustDesk or Splashtop for screen takeover. You want to be able to fix it from a pub.

**Telemetry — build this yourself, it's a weekend**
A ~150-line agent on the booth posting a heartbeat every 60s to a small server or an
uptime service:

```
{ boothId, timestamp, appAlive, printerStatus, printsRemaining,
  ribbonPct, sessionsThisHour, lastError, paymentsOnline, batteryOnAC }
```

Alerting rules that actually earn their keep:
- No heartbeat for 3 minutes → SMS you (Twilio) and text the host's contact.
- `printsRemaining < 40` → SMS you, and the booth switches to "digital only" mode instead
  of failing at the tray.
- Any print error → SMS immediately, not on a schedule.

**Custom software?** Only after your third booth. If you do: Electron + React kiosk app,
`gphoto2` or the Canon EDSDK for capture, CUPS for printing, Stripe Terminal SDK for
payments. The upside is control of the whole UX and no per-booth licence; the downside is
you now maintain printer drivers on a Saturday night. Licensed software first.

---

## 4. Taking money with nobody there

Three models — support at least the first two.

1. **Prepaid / unlimited (most weddings).** The host pays you up front, the booth runs in
   unlimited mode, no reader involved. Simplest, and it is what wedding clients want.
2. **Pay per strip on a card reader.** This is the mode that unlocks venue residencies.
   - **Stripe Terminal** — WisePOS E (~$349). Ask Stripe to enable the **unattended /
     kiosk** configuration; a normal reader expects an operator.
   - **Square Terminal** — simpler to start, less programmable.
   - **Nayax / DEX / Payter** — telemetry-first readers built for *vending*, i.e. designed
     from day one to be bolted to a machine nobody staffs. Worth a look at scale.
   - **Tap to Pay on iPhone/Android** — cheapest to start; the phone must stay awake,
     charged and mounted, which is more fragile than it sounds.
3. **QR fallback.** A Stripe Payment Link QR on the shell. Costs nothing, works when the
   reader sulks, and it is the single best 20-minute reliability investment you can make.

Two rules: **never charge before the strip prints successfully** (authorise, capture on
print), and **auto-refund** anything that fails. Chargebacks from an unattended machine are
a nightmare you should design out rather than argue about later.

PCI scope stays with the reader vendor — card data never touches your machine. Keep it
that way.

---

## 5. Delivery and turnaround

- Case on wheels, one van, two people, 15 minutes to set up. Time yourself; if it takes
  more than 20, redesign the case, not the schedule.
- Deliver in the afternoon, collect the next morning. Overnight collection is what lets one
  unit cover a Friday and a Saturday, and it is much cheaper than a courier.
- Leave behind: a laminated card with a support number and a QR to a one-page "how to
  reload" guide, and the venue coordinator's phone number in your own phone.
- Photograph the booth set up and lit, and text it to the client before you leave. This
  ends 90% of "did it arrive?" anxiety.
- Third-party couriers: only for residencies, and only in a hard case with insurance.
  A courier will not straighten a backdrop.

---

## 6. Do the numbers work

Assume a Drop & Go event at $549:

| Line | Per event |
|---|---|
| Media (~130 strips at ~$0.11 for 2×6) | $15 |
| Travel, fuel, van share | $45 |
| Payment fees (if card) | ~2% |
| Depreciation (build ÷ 200 events) | $15 |
| Insurance, storage, software, SIM (per event at 4/mo) | $40 |
| **Gross margin** | **~$430 (78%)** |

Two useful thresholds:
- **Payback:** a $2,400 tablet build pays for itself in ~6 events.
- **Break-even on a residency:** at $5/strip and ~$0.30 all-in cost, a bar doing 12 strips
  a night clears ~$1,700/month gross before the venue's revenue share.

The whole thesis in one line: competitors charge $700–1,200 with an attendant standing in
the corner all night. You charge $549, keep a better margin, and can run two events at once
because neither one needs a person.

---

## 7. What will actually go wrong

| Risk | What you do about it |
|---|---|
| Ribbon/media runs out mid-event | Telemetry alert at 40 prints left; spare roll in the case; digital-only fallback mode |
| Printer jam | Auto-retry, then stop selling; SMS alert; backup printer on premium bookings |
| Network drops | Own 4G, offline queue, printing never depends on connectivity |
| Guest breaks the flow (drinks, kids, curiosity) | Kiosk lockdown, 60s timeout, nothing removable, cables inside the shell |
| Someone walks off with it | Bolt/cable lock to a fixed point, insurance, AirTag inside the shell |
| Power cut / tripped socket | UPS, auto-login, auto-start, resume mid-roll |
| Abusive or explicit photos | On-screen conduct notice, host-visible moderation queue, delete on request |
| Photos of children / consent | Plain-language consent screen before frame one, no marketing use without opt-in, gallery links expire, delete on request |

Also non-negotiable before your first paid job: **public liability insurance** (venues will
ask for the certificate), equipment insurance, electrical safety testing where required,
and written terms covering deposit, cancellation and damage.

---

## 8. Order of work

1. **Validate before automating.** Buy the tablet build, run five events *attended*, for
   cheap or free. You will learn more in five nights than in a month of planning, and you
   will find out exactly which moments a guest gets stuck on.
2. **Automate payment and reset.** Card reader, kiosk lockdown, session timeout. Now leave
   the room at the event and see what breaks.
3. **Automate the reporting.** Heartbeat agent, SMS alerts, print counts. Now leave the
   *venue*.
4. **Sell the difference.** The website leads with "no attendant" because that is the
   product, not a cost saving you're hiding.
5. **Second unit, then residencies.** Residencies are the compounding part of this
   business: the booth earns on nights you didn't sell.

---

## 9. Site placeholders to replace

`index.html` ships with obvious stand-ins. Search and replace before launch:

- `hello@flashbox.example` — real inbox (also in `assets/app.js`)
- `(000) 000-0000` / `tel:+10000000000` — real number
- `Flashbox` — if you want a different name, it is one find-and-replace
- Prices in the Packages section, and the service radius in the footer
- The three testimonials — **replace with real ones before the site goes public**
