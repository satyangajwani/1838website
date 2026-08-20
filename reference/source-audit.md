# 1838reserve.com — teardown of the live page

Captured 2026-08-19 from `https://www.1838reserve.com/`. Raw HTML, JS chunks and CSS are in
`reference/source-site/`; images and the Times Black film are in `reference/assets/`.

## What the page actually is

One locked screen. No scroll. Total visible copy, verbatim:

- `1838 Reserve Credit Card - For those who script India's future` (title)
- `Skip to content`
- `Express Interest`

Everything else a visitor reads — the tagline, the "Artwork by Krishen Khanna" plaque, the
`Joining Fee ₹1,75,000 + GST` line, the Visa mark — is **baked into a single 1998×2496 PNG**
(`cardPedestalText.png`, 1.03 MB). It is not text. It is not selectable, translatable,
resizable, or indexable, and it cannot respond to viewport, motion, or interaction.

That one fact is most of the brief.

## Stack and integrations

| Concern | What's there |
| --- | --- |
| Framework | Next.js App Router, Tailwind, CSS Modules |
| Routes | `/` (teaser), `/user` (interest flow), `/tnc`, `/privacy-policy`, 404 |
| Auth / OTP | Times JSSO — `jssocdn.indiatimes.com/crosswalk_sdk/...`, validates at `jsso.indiatimes.com/sso/crossdomain/v1validateTicket` |
| Backend | `api.timesblack.com/gw/` (origin: `origin-api.timesblack.com/gw/`) |
| Bot defence | reCAPTCHA v3 + v2 fallback, site key `6LcoOYItAAAAACgpczRotXLUqfqHMFymMKhpAv5p` |
| Analytics | GrowthRx (`gece9783c`), Google Ads conversions (`AW-16603907119`, `AW-17872227161`), Meta, LinkedIn |
| Other | Lottie (loaded, 5.7.3), react-toastify, Redux Toolkit |

Shared bundle with Times Black — the chunks still carry Times Black's benefit copy, reward
calculator and app-download strings that the 1838 page never renders.

## The interest flow, as built

`Express Interest` → `/user`. Field set recovered from the bundle:

1. **Mobile** — 10 digits, must start 6–9. Labelled "Aadhar Linked Number".
2. **OTP** — 6 boxes. `A 6 digit code has been sent to your mobile number`, resend timer,
   `The OTP entered is incorrect. Please enter the correct OTP`.
3. **Applicant Details** — first name, last name, email, alternate mobile, city, pincode, PAN,
   DOB, employment status (self-employed prompt), income range, and
   `Do you have an existing relationship with ICICI Bank? (savings/ current account, credit card, etc)`.
   Consent checkbox opens a modal of TIL data-sharing terms.
4. **Thank you** — `Thank you for showing your interest` /
   `Thank you for your request, we will review your application. You will receive an update from us in 48 hours.`

## Design system in use

Type — all three are free Google Fonts:

- `--font-bodoni` → **Bodoni Moda** (fallback Didot) — the "1838" wordmark
- `--font-stix` → **STIX Two Text** (fallback Georgia, Times New Roman)
- **Raleway** — every UI label, button and error message

Palette, by frequency in the CSS:

| Hex | Role |
| --- | --- |
| `#ffe4ab` | primary champagne gold |
| `#ebd5b3` `#e9c693` `#c5a265` `#aa7d4b` | gold ramp |
| `#1c0e0b` `#1d0c08` | warm near-black (404 background) |
| `#010101` `#0e0e0e` `#161616` `#1c1c1c` | neutral blacks |
| `#cdcdcd` `#5f5f5f` `#2b2b2b` | UI greys |
| `#dd5e5e` | error |

## The artwork

`1838bg.png` is a **Krishen Khanna *Bandwallas* painting** — brass-band musicians in red
tunics with trumpet and trombone, in his signature red/ochre/black palette. The gold crop on
the card face is a detail from the same work, signed lower-right. So the card is not merely
*decorated* by Khanna; the room it stands in **is** the painting. The current page throws that
away by flattening it to a dim, heavily-vignetted backdrop at 959×703 — smaller than a
retina phone screen.

## Defects worth naming

1. **All copy is a bitmap.** Zero selectable text below the title. Fails translation and
   screen readers, blurs on large displays, and forces a 1 MB PNG on the critical path.
2. **Stale structured data.** The JSON-LD on the 1838 page describes *Times Black* — wrong
   product name, and a `₹20,000` joining fee against a card that costs `₹1,75,000`. Same for
   the Organization, WebSite, FinancialProduct, PaymentCard and the entire FAQ block.
3. **`orientation.png` (1904×878, 223 KB)** ships a "please rotate your device" overlay —
   the page asks the user to accommodate it.
4. **Typo in shipped copy:** "polished to a brilliant mirror **fininsh**".
5. **Dead weight.** Times Black's reward calculator, benefits grid and app-download strings
   are in the bundle but unreachable from this page.
6. **The card never moves.** No parallax, no light response, no depth. On a page whose entire
   job is to make a metal object feel desirable.

## Assets on hand

`reference/assets/` — `cardPedestalText.png` (card + pedestal + all baked copy),
`1838bg.png` (Khanna wall), `reserve-og-img.jpg` (full composition, 1442×757),
`1838-reserve-logo.png`, `1838timeslogo3x@3x.png`, `icici-logo.png`, `cta-arrow.svg`,
`orientation.png`, and `witnesscreation.mp4` (67 MB, 55s, the Times Black "Where Legacy Meets
Luxury" film).
