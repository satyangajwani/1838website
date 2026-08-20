# 1838 Reserve — invite teaser rebuild

A ground-up rebuild of [1838reserve.com](https://www.1838reserve.com/) — the invite page for the 1838 Reserve credit card (The Times of India × ICICI Bank × Visa Infinite Privilege, ₹1,75,000 + GST, launching October 2026). Single locked screen, one call to action, an in-page express-interest flow against mocked backends. Built as a pitch-grade concept: the argument is won on feel, and a Times engineer can wire the real backends through one adapter file.

The approved launch print ad (`collaterals/print-ad/`) is the art-direction ground truth. The site is that ad, alive: the Krishen Khanna *Bandwallas* room, the card on its pedestal in a pool of light that drifts on its own, brand typography, and the interest flow layered over the hero so the card never leaves frame.

## Why the rebuild exists

The live site is a Times Black template with the content deleted. Every word below the `<title>` — tagline, fee, artist credit, Visa mark — is baked into one 1998×2496 palette PNG: nothing selectable, translatable, or indexable, with 1 MB of LCP spent rendering type. Its structured data still describes Times Black, publishing a **₹20,000** joining fee into search results for a ₹1.75-lakh card, and its gold Visa mark violates Visa's white-on-dark rule (a treatment the owner later chose to keep in this rebuild, knowingly). The card — whose only job is to look worth the fee — never moves.

## What this build is

- **Stage** — layered stills extracted at print resolution from the brand's own pedestal-mockup PSD (wall / pedestal / card-on-stand / specular), composited per the print ad, with the room dissolving to black around the object. A load ceremony completes inside 5 s; after it, an autonomous light path (two superimposed sine periods, 14 s/23 s) drives the room glow, specular sweep and card edge light so the page is alive with zero input. Pointer/touch steers the light and decays back. Wall and card carry near-imperceptible breath cycles. All motion is skipped under reduced motion — the owner removed the on-stage pause control and audio ambience (2026-08-20), so `prefers-reduced-motion` is the sole WCAG 2.2.2 mechanism.
- **Copy** — all real DOM text, in the brand faces (STIX Two Text display, Montserrat UI, both OFL, subset + self-hosted). Approved ad copy throughout: tagline without the period, *Card ownership by invitation only.*, footer naming **Visa Infinite Privilege · October 2026**, CTA in the brand's own verb: **Request an Introduction**. Fee and terms visible on the first screen (RBI advertising rules, effective Jan 2027, ban hidden fees).
- **Flow** — native `<dialog>` sheet over the hero: mobile (+91, first-digit validation) → OTP (one real input painted as six slots, `one-time-code` autocomplete, paste-safe) → applicant details (real labels, unticked consent, blur validation) → a confirmation that reads as an artifact (reference number, private office, no queue/referral/share).
- **Backend seam** — `lib/api/adapter.ts` is the only file that knows about the network. Mocks are stateless Route Handlers (Vercel functions share no memory) with server-side validation, a verify-token binding `submitInterest` to `verifyOtp`, reserved failure inputs, and a no-PII-in-logs rule.
- **Compliance** — Visa mark in the brand gold with clear space (owner-directed 2026-08-20, knowingly overriding Visa's white-on-dark/no-tint standard for visual unity — needs Visa sign-off before launch), ICICI named as issuer in text, single correct `FinancialProduct` JSON-LD, OG/Twitter metadata with share image, `noindex` until launch, WCAG 2.2 AA (axe-clean, keyboard/VoiceOver passes through the whole sheet).

## Repository map

| Path | What |
| --- | --- |
| `app/`, `components/`, `lib/`, `styles/` | The Next.js 16 app (App Router, static prerender + mock API routes) |
| `assets/` | Print-resolution layer extractions from the brand PSD (pedestal, no-name card) |
| `collaterals/` | The brand kit from the Times team — card open files, pedestal PSD, painting scan, logos, fonts, archives, print ad. **1.5 GB, not in git, not deployed** |
| `reference/` | Teardown of the live site (`source-audit.md`, captured HTML/JS/CSS/assets) |
| `scripts/` | Asset encoder (SVT-AV1 10-bit AVIF + sharp WebP), font subsetter, poster/OG builders, size + asset-register audits |
| `docs/asset-register.md` | Every third-party asset: source, licence, clearance flag (audited by `pnpm audit:assets`) |
| `docs/plans/` | The full implementation plan (requirements, decisions, open questions) |
| `docs/CHANGELOG.md` | Session history — what was built, in what order, and why |
| `docs/LEARNINGS.md` | Durable lessons from the build — read before touching the stage or the tests |

## Working on it

**Critical:** `next build` **deadlocks inside this Dropbox-synced checkout** (SWC vs. CloudStorage file provider — silent, 0 % CPU forever). Build and test from a copy:

```bash
rsync -a --exclude node_modules --exclude .next --exclude collaterals --exclude reference \
  ./ /tmp/1838w/
cd /tmp/1838w && CI=true pnpm install --frozen-lockfile && pnpm build
(pnpm start &) && pnpm exec playwright test   # 80 scenarios, Chromium + WebKit
```

Copy changed sources back to the checkout afterwards. Vercel deploys are unaffected (remote build).

| Gate | Command | Current |
| --- | --- | --- |
| Unit/component | `pnpm test` | 20 passing |
| Browser suite | `pnpm test:e2e` | 79 passing / 1 skipped (WebKit LCP API) |
| Bundle budget | `pnpm size` | ~266 KB gzip vs 307 KB budget |
| Licence audit | `pnpm audit:assets` | green |
| Lighthouse | `pnpm lh` | owner-run |

Deploys: `vercel deploy --yes` (protected preview) · `vercel deploy --prod --yes` (updates the public `1838website.vercel.app`). `.vercelignore` keeps the heavy folders out of uploads. Deployment Protection is ON for previews; production aliases are public by design.

## Go-live checklist

1. **Backends** — the one real blocker. The details step collects PAN/DOB/income into mocks that go nowhere. Point `lib/api/adapter.ts` at `api.timesblack.com/gw/` + JSSO (reCAPTCHA and JSSO auth UI are the two named component-level additions), or visibly mark the flow as a preview.
2. **DLT SMS template** — must carry the `@1838reserve.com #<code>` suffix or iOS/Android OTP autofill never works. Needs aggregator lead time.
3. **Private-office name** — the confirmation's reply-from is placeholder copy pending a business owner (plan OQ6).
4. **Visa brand sign-off** — the gold Visa mark is an owner decision against Visa's September 2025 standards (white-on-dark, never tinted); clear it with Visa's brand team before launch or revert `public/visa-mark.svg` to `fill="#ffffff"`.
5. Remove `robots: noindex` in `app/layout.tsx` once 1–3 clear.
6. Resolved already: Khanna rights (Times confirmed, 2026-08-20), Visa tier (Infinite Privilege, per the supplied card back), October 2026 timing (printed in the public launch ad), source artwork (full brand kit in `collaterals/`).

## Owner-run device checks

- OTP paste on a physical iPhone.
- The "alive" read on the actual pitch devices — the autonomous light drift is the page's heartbeat; judge it moving, not from stills.
