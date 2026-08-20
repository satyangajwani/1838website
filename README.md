# 1838 Reserve teaser

## Current implementation notes

- **U4 (real-time WebGL card tier) is CUT.** The plan sanctioned this cut. As built, the scene rendered an untextured `RoundedBox` with a flat gold colour and no card artwork, chip, engraving or normal map, and `.stage:has(.card-scene) .stage-object { opacity: 0 }` hid the poster behind it — so on a real device the page showed the correct card, swapped to a featureless gold slab, then reverted when `PerformanceMonitor` hit its fallback. It was a straight regression against the poster tier.
- **Why it was cut rather than textured:** the only card imagery available is a finished product *render* with lighting already baked in. Using it as an albedo map on a PBR metal double-lights the surface and reads worse than the render itself. A genuine real-time upgrade needs the original 3D source (OQ1), which the client has not supplied. Revisit U4 only when OQ1 resolves; the poster tier already carries the live pointer/tilt light response and parallax.
- Removed with the cut: `components/stage/card-scene.tsx`, `card-scene-loader.tsx`, `lib/tier/`, `e2e/tier.spec.ts`, `public/benchmarks/`, `public/env/`, and the `three` / `@react-three/*` / `@pmndrs/detect-gpu` dependencies.
- **Current stage composition:** the poster tier layers the supplied no-name card-on-stand and the supplied pedestal as real image assets over the wall. It does not use CSS-built stand, contact-shadow, or reflection effects.
- The stage uses responsive AVIF/WebP derivatives for the card and pedestal. Header, tagline, footer, CTA, and marks remain live DOM content; no product copy is baked into the layered scene assets.
- The responsive asset encoder uses SVT-AV1 10-bit AVIF as required. This machine's ffmpeg does not include `libwebp`, so its WebP fallback uses `sharp`; this is recorded in the asset register.
- Vercel headers and image settings are in place. The owner must configure Vercel Deployment Protection and issue protected share links; this run intentionally performed no Vercel login or deployment.

## Owner-owned checkpoints

- After U3: compare the poster tier with the live site on the pitch devices, including a mid-tier Android, and record the alive-read go/no-go. If it fails, assess KTD1's video-loop fallback.
- Verify OTP paste and audio interruption recovery on physical iPhone. (Thermal tier fallback no longer applies — U4 is cut.)

## Go-live blockers and handoff

- **OQ2: RESOLVED (2026-08-20).** Times confirmed the Khanna rights are in order; the asset register is cleared. The preview stays access-protected for a different reason — see below.
- **Mocked backends are now the public-deploy blocker.** The details step collects PAN, DOB and income and the Route Handlers answer with synthetic data that goes nowhere. Do not expose this build publicly until the adapter points at real Times endpoints, or the flow is visibly marked as a demo.
- **OQ3:** confirm the Visa tier/card-face lockup before final card art.
- **OQ4:** secure a DLT SMS template for production OTP autofill.
- **OQ6:** replace the placeholder private-office name and confirm the October 2026 statement.

## Integration seams

- There is no runtime render tier: every device gets the poster stage (layered stills, pointer/tilt light response, parallax). `prefers-reduced-motion` still disables the parallax and light movement.
- `lib/api/adapter.ts` is the only UI network seam. A Times engineer replaces its three relative-route mappings with `api.timesblack.com/gw/` mappings and attaches the JSSO ticket there; reCAPTCHA/JSSO state UI remain the named production exceptions.
- Remove `noindex` only after Deployment Protection, OQ2 clearance, Visa tier confirmation, DLT template approval, and OQ6 copy sign-off are complete.
- `VERCEL_URL` supplies the deployment host for social metadata automatically. Set `NEXT_PUBLIC_SITE_URL` only when it must override that host, such as for a protected custom preview URL.

## Verification record (2026-08-19)

- Fresh after the composition/dialog repair: `pnpm test` passed 13 tests in 10 files; `pnpm exec tsc --noEmit --incremental false` and `pnpm build` passed, with `/` statically prerendered; `pnpm size` measured 266,493 gzip bytes against the 314,368-byte budget; and `pnpm audit:assets` passed the updated Khanna-derived asset register.
- `pnpm exec playwright test --list` typechecked and listed 84 Chromium/WebKit scenarios in six files, including the new `stage`, `tier`, `interest-auth`, and `interest-details` suites. Browser execution was intentionally not attempted because Chromium and WebKit are denied macOS process-registration permissions by this managed sandbox. `pnpm test:e2e`, `pnpm test:a11y`, and `pnpm lh` remain owner-run gates on a normal local machine or protected preview.
- The stage LCP check accepts either server-rendered stage image: the wall remains a candidate, but the visually larger card/stand crop can correctly become LCP. Largest Contentful Paint entries are Chromium-only, so that assertion is skipped on WebKit.
- The owner should run the Playwright suite and visually recheck 1440×900 plus the iPhone 13 viewport before sign-off; this sandbox record does not claim browser-rendered visual verification.
- Deployment, Deployment Protection verification, protected-preview cache-header verification, physical iPhone OTP/audio checks, and physical Android thermal checks are owner-owned and pending.

## Print-ad composition update (2026-08-20)

- The approved print-ad treatment now uses the supplied `assets/pedestal-only.png` and `assets/card-on-stand-noname.png` as separate, responsive AVIF/WebP scene layers. The old CSS stand, contact shadow, and reflection are no longer part of the stage.
- The top lockup is the supplied white TOI crest/wordmark with “Established in 1838” at left and the supplied gold ICICI SVG at right. The footer names “The 1838 Reserve Credit Card · Visa Infinite Privilege · October 2026”, carries “Card ownership by invitation only.”, and retains the page-level white Visa mark.
- Type is self-hosted subset STIX Two Text and Montserrat. Their declarations use only the single-word fallbacks `Georgia` and `Arial`.
- The CTA is “Request an Introduction”; its dialog, focus restoration, validation, OTP, consent, and confirmation behaviour are unchanged. On compact viewports the stage controls sit beneath the TOI lockup.
- Browser execution remains owner-run. The revised stage suite covers 320/768/1440/1920 portrait and landscape, including the compact control placement and no-overlap assertions.
- Verification in `/tmp/1838i`: `CI=true pnpm install --frozen-lockfile`, `pnpm build`, `pnpm test` (19 tests in 11 files), `pnpm size` (265,830 gzip bytes across seven critical-path chunks), and `pnpm audit:assets` (17 rows) passed. Playwright was intentionally not run.

## Stage craft-pass verification (2026-08-20)

- The stage images remain rendered from first paint so either remains a valid LCP candidate. The dark-to-lit ceremony now animates a separate room treatment above them; it fades from `.9` to `.18` opacity while the shared RAF light path drives the room glow and specular response. The 40-second wall breath and 9-second card breath remain independently pausable through one compact, keyboard-operable stage-controls popover. Reduced motion skips the ceremony transforms and never starts the RAF or either breath animation.
- The redundant CSS card silhouette is removed, leaving the artwork’s own outline as the single card edge. New 320px portrait and landscape adjustments reserve space for the proposition, card, terms and CTA without introducing scrolling or controls/masthead collisions.
- `pnpm test` passed 19 tests in 11 files; `pnpm build` passed with `/` statically prerendered; `pnpm size` measured 265,696 gzip bytes across seven critical-path chunks; and `pnpm audit:assets` passed. All gates ran from `/tmp/1838fix` because Dropbox can deadlock native build reads.
- `scripts/font-glyphs.txt` and the visible proposition use U+2019 (`For those who script India’s future`). `scripts/subset-fonts.mjs` explicitly includes U+2019 and generates the STIX Two Text and Montserrat subsets. Browser rendering was not run in this non-browser gate pass; the owner must run the existing Playwright suite locally, including the stage LCP and 320px layout assertions.
