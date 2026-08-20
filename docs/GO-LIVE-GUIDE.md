# 1838 Reserve teaser — production integration guide

Handoff for the Times engineering team. This site is a complete, tested front end for
[1838reserve.com](https://www.1838reserve.com/) currently running against **mock backends**.
Everything user-visible is final unless noted; the work described here is wiring, sign-offs
and cutover. Concept build is live at **https://1838website.vercel.app**.

**The one rule:** every network call already passes through a single module,
`lib/api/adapter.ts`. Swapping mocks for real endpoints is a transport-level change inside
that file. No component knows about endpoints, tickets or tokens — keep it that way.

---

## 1 · What you are inheriting

- Next.js 16 (App Router), static prerendered page + three mock API Route Handlers.
  React 19, Tailwind v4, self-hosted subset fonts (STIX Two Text + Montserrat, both OFL).
- One locked screen: layered stage (wall / pedestal / card) built from the brand's own
  mockup PSD, autonomous light drift, pointer/touch steering. No audio, no gyro, no
  on-stage controls (owner decision; `prefers-reduced-motion` disables all motion).
- Express-interest flow in a native `<dialog>`: mobile → OTP (six-slot single input,
  `one-time-code` autofill) → applicant details (PAN/DOB/income, unticked consent) →
  confirmation with reference number.
- Gates that must stay green: `pnpm test` (18 unit), `pnpm test:e2e` (80 browser scenarios,
  Chromium + WebKit, includes a ten-viewport collision suite), `pnpm size` (~266 KB gzip vs
  307 KB budget), `pnpm audit:assets` (licence register), axe-clean.
- Fresh clones build normally. (The original working copy lived in Dropbox, which deadlocks
  SWC — irrelevant to you unless you also work out of a cloud-synced folder.)

## 2 · The backend swap — `lib/api/adapter.ts`

Three functions, currently pointed at local mocks. Point them at `api.timesblack.com/gw/`
(origin: `origin-api.timesblack.com/gw/`) and attach the JSSO ticket **in this module only**.
The captured call shapes from the current site are in `reference/source-site/` for mapping.

### Contracts the UI depends on

| Call | Request | Success response | Failure the UI handles |
| --- | --- | --- | --- |
| `sendOtp` | `{ phone }` — 10-digit Indian mobile, `/^[6-9]\d{9}$/` | `{ message: string }` | `OTP_SEND_FAILED` (503) |
| `verifyOtp` | `{ phone, code }` — six digits | `{ verificationToken: string }` (min 16 chars) | `OTP_INVALID` (401) |
| `submitInterest` | Full applicant object (schema: `lib/api/types.ts` → `applicantSchema`), **including `verificationToken`** | `{ referenceNumber: string }` | `SUBMISSION_FAILED` (503), `VALIDATION_ERROR` (400) |

- Errors must arrive as `{ error: { code, message } }` with a non-2xx status; `code` is one of
  `OTP_SEND_FAILED · OTP_INVALID · SUBMISSION_FAILED · NETWORK_ERROR · VALIDATION_ERROR`
  (`lib/api/types.ts`). The `message` is shown to the user verbatim — write it accordingly.
- **The verification token binds the submission to the verified phone.** The real backend
  must issue it at OTP verification and reject `submitInterest` without a valid one. The UI
  passes it through opaquely.
- Mock behaviours to be aware of (and not replicate): phone `9000000000` forces
  `OTP_SEND_FAILED`; OTP `183838` is the only accepted code; email `fail@example.com`
  forces `SUBMISSION_FAILED`. These exist so the e2e suite can exercise failure states —
  after the swap, point the e2e config at a staging backend that provides equivalent
  test hooks, or keep the mock routes for CI only.
- Backend-owned concerns the mocks do **not** implement: OTP rate limiting and resend
  throttling, brute-force lockout, token expiry, dedupe of repeat submissions, storage.
  The front end caps request bodies at 8 KB and never logs PII — hold that line server-side.

### The two sanctioned component-level additions (plan R14)

1. **reCAPTCHA** — the current site runs v3 with v2 fallback (site key in
    `reference/source-audit.md`). Gate `sendOtp`/`submitInterest` server-side; if v2
    fallback UI is required, mount it inside the sheet step components.
2. **JSSO auth-state UI** — if a signed-in state should short-circuit the phone step,
    that touches `components/interest/step-mobile.tsx`. Ticket validation endpoint:
    `jsso.indiatimes.com/sso/crossdomain/v1validateTicket`.

Everything else is adapter-only. If a change seems to need component edits, re-read the
adapter first.

## 3 · SMS: the DLT template (long lead time — start first)

iOS/Android OTP autofill only works if the SMS ends with the origin-bound suffix:

```
... your code is 482913
@1838reserve.com #482913
```

The `@domain #code` suffix must be registered in the DLT template with your SMS
aggregator. This has aggregator lead time and is unfixable client-side — start it before
any other integration work. The input is already `autocomplete="one-time-code"` and
paste-safe; without the template, users type six digits by hand.

## 4 · Analytics and pixels

The current site loads GrowthRx (`gece9783c`), Google Ads (`AW-16603907119`,
`AW-17872227161`), Meta and LinkedIn. Nothing is wired in this build — deliberate, so the
concept ships clean. When adding them: load post-LCP (the 307 KB critical-JS budget is
enforced by `pnpm size` and has ~41 KB headroom), and remember consent starts unticked —
if legal wants pixel consent coupled to it, wire that at the same time.

## 5 · Sign-offs before the switch

| Item | Status | Action |
| --- | --- | --- |
| Krishen Khanna artwork rights | ✅ Confirmed by Times, 2026-08-20 | none |
| Visa mark colour | ⚠️ AMBER — owner chose brand gold `#d8b273`, which knowingly conflicts with Visa's Sept 2025 white-on-dark / no-tint standard | Get Visa brand sign-off, or revert `public/visa-mark.svg` to `fill="#ffffff"` (one line + one e2e assertion) |
| Fee disclosure | ✅ Fee + terms on first screen (RBI advertising amendment, effective 2027-01-01) | keep it there |
| Consent | ✅ Unticked checkbox, consent modal | legal copy review |
| PII handling (PAN/DOB/income) | ⚠️ This is **the** public-launch blocker while backends are mocks | Real storage with DPDP-compliant processing, or visibly mark the flow as a preview |
| Private-office name | ⏳ plan OQ6 | Business owner supplies the confirmation step's reply-from identity (`components/interest/step-confirmed.tsx`) |

## 6 · Domain, environment, cutover

1. **Env:** set `NEXT_PUBLIC_SITE_URL=https://www.1838reserve.com` in the production
   environment (drives `metadataBase`, OG/Twitter URLs, JSON-LD).
2. **Domain:** point `1838reserve.com` / `www` at the chosen host (currently Vercel
   project `1838website`; `vercel domains add` + DNS, or move to Times infra — the app is
   a standard Next build, `pnpm build && pnpm start`).
3. **noindex:** remove `robots: noindex` in `app/layout.tsx` **only after** §2 and §5 clear.
4. **Verify after cutover:** OG card renders on WhatsApp/X/LinkedIn; `FinancialProduct`
   JSON-LD carries the ₹1,75,000 + GST fee (the old site leaked Times Black's ₹20,000 —
   don't recreate that); OTP autofill fires on a real iPhone (proves the DLT template).
5. **Rollback:** Vercel keeps every deployment immutable — `vercel rollback` or re-alias
   the previous deployment. Test it once before launch day.

## 7 · House rules for future changes

- `collaterals/` (1.5 GB brand kit) never enters git or deploys (`.gitignore` + `.vercelignore`).
  New imagery goes through `scripts/encode-assets.mjs` — it preserves the alpha channel for
  cutouts (ffmpeg's AVIF path silently drops it; this cost us dearly once) — and gets a row
  in `docs/asset-register.md` (`pnpm audit:assets` enforces this).
- Green tests are not a visual verdict: screenshot 1440×900 and a phone viewport after any
  stage change, and check dark-region luminance numerically — phone panels crush detail
  below ~25/255 that a Mac display happily shows.
- The ten-viewport collision spec in `e2e/stage.spec.ts` is the geometry safety net; never
  weaken it to make a layout land (the pedestal's off-frame bottom crop is the one
  sanctioned exception).
- Full context: `README.md` (state + checklist), `docs/LEARNINGS.md` (26 lessons, read
  before touching the stage), `docs/CHANGELOG.md` (how it got here),
  `docs/plans/2026-08-19-…-plan.md` (requirements and decisions, updated inline).

## 8 · Suggested order of work

1. Kick off the DLT template registration (longest lead time).
2. Stand up staging: real `gw/` endpoints behind the adapter, JSSO ticket attach,
   reCAPTCHA server-side. Point the e2e suite at staging failure hooks.
3. Run the full gate set + a real-device pass (iPhone: OTP paste, autofill, the light
   drift over ~20 s).
4. Close the sign-off table (§5) — Visa colour decision and private-office name in writing.
5. Analytics/pixels post-LCP, consent-coupled.
6. Domain + env cutover, remove noindex, verify §6.4, hold rollback ready.
