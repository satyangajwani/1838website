# 1838 Reserve teaser

## Current implementation notes

- **U4 (real-time WebGL card tier) is CUT.** The plan sanctioned this cut. As built, the scene rendered an untextured `RoundedBox` with a flat gold colour and no card artwork, chip, engraving or normal map, and `.stage:has(.card-scene) .stage-object { opacity: 0 }` hid the poster behind it — so on a real device the page showed the correct card, swapped to a featureless gold slab, then reverted when `PerformanceMonitor` hit its fallback. It was a straight regression against the poster tier.
- **Why it was cut rather than textured:** the only card imagery available is a finished product *render* with lighting already baked in. Using it as an albedo map on a PBR metal double-lights the surface and reads worse than the render itself. A genuine real-time upgrade needs the original 3D source (OQ1), which the client has not supplied. Revisit U4 only when OQ1 resolves; the poster tier already carries the live pointer/tilt light response and parallax.
- Removed with the cut: `components/stage/card-scene.tsx`, `card-scene-loader.tsx`, `lib/tier/`, `e2e/tier.spec.ts`, `public/benchmarks/`, `public/env/`, and the `three` / `@react-three/*` / `@pmndrs/detect-gpu` dependencies.
- **Plinth removal decision (U3/KTD1 deviation):** the plan listed a plinth layer, but its source crop produced visibly broken, occluded geometry at practical desktop and mobile sizes. For visual integrity, the poster and WebGL tiers now omit the plinth entirely. A clean card crop stands in a connected gold CSS stand with an elliptical contact shadow and a softly fading reflection over the wall; this avoids falsely reconstructing the source pedestal while preserving the layered parallax composition.
- The poster tier now uses two source derivatives: `1838bg.png` for the wall and a clean card alpha crop that ends at y=905. The plaque, proposition, fee, gold Visa, and every pedestal region of `cardPedestalText.png` are outside stage derivatives; the gold stand, contact shadow, and reflection are CSS light layers rather than cropped geometry.
- The responsive asset encoder uses SVT-AV1 10-bit AVIF as required. This machine's ffmpeg does not include `libwebp`, so its WebP fallback uses `sharp`; this is recorded in the asset register.
- Vercel headers and image settings are in place. The owner must configure Vercel Deployment Protection and issue protected share links; this run intentionally performed no Vercel login or deployment.

## Owner-owned checkpoints

- After U3: compare the poster tier with the live site on the pitch devices, including a mid-tier Android, and record the alive-read go/no-go. If it fails, assess KTD1's video-loop fallback.
- Verify OTP paste and audio interruption recovery on physical iPhone. (Thermal tier fallback no longer applies — U4 is cut.)

## Go-live blockers and handoff

- **OQ2 / RED:** identify the Khanna artwork and secure marketing rights before any public deployment. This private-preview build must remain access-protected until then.
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

## Plinth-removal verification (2026-08-20)

- `pnpm build:poster`, `pnpm test`, `pnpm audit:assets`, `pnpm build`, and `pnpm size` passed. The current critical-path JavaScript measurement is 266,739 gzip bytes; the stage E2E suite is typechecked and includes assertions for the absence of plinth assets/layers plus grounding elements at every supported viewport.
- Browser execution remains blocked in this managed macOS sandbox because Chromium cannot register its Mach port (`bootstrap_check_in … Permission denied`). The updated stage suite should be run in a normal local browser-capable environment for its 320/768/1440/1920 portrait and landscape rendering pass.

## Stage craft-pass verification (2026-08-20)

- The stage images remain rendered from first paint so either remains a valid LCP candidate. The dark-to-lit ceremony now animates a separate room treatment above them; it fades from `.9` to `.18` opacity while the shared RAF light path drives the room glow and specular response. The 40-second wall breath and 9-second card breath remain independently pausable through one compact, keyboard-operable stage-controls popover. Reduced motion skips the ceremony transforms and never starts the RAF or either breath animation.
- The redundant CSS card silhouette is removed, leaving the artwork’s own outline as the single card edge. New 320px portrait and landscape adjustments reserve space for the proposition, card, terms and CTA without introducing scrolling or controls/masthead collisions.
- `pnpm test` passed 19 tests in 11 files; `pnpm build` passed with `/` statically prerendered; `pnpm size` measured 265,696 gzip bytes across seven critical-path chunks; and `pnpm audit:assets` passed. All gates ran from `/tmp/1838fix` because Dropbox can deadlock native build reads.
- `scripts/font-glyphs.txt` and the visible proposition use U+2019 (`For those who script India’s future.`). `scripts/subset-fonts.mjs` now explicitly includes `U+2019`, and the regenerated Bodoni subset is 19,092 bytes. Browser rendering was not run in this non-browser gate pass; the owner must run the existing Playwright suite locally, including the stage LCP and 320px layout assertions.
