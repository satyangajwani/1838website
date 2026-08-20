# Changelog — 1838 Reserve teaser rebuild

One build session, 2026-08-19 → 2026-08-20. Executed as a plan-first pipeline: Claude planned and reviewed, Codex (`exec`/Terra and `arch`/Sol profiles) implemented, every round verified by the browser suite and screenshot review before shipping. Plan of record: `docs/plans/2026-08-19-2245-feat-1838-reserve-teaser-rebuild-plan.md`.

## Phase 0 — Teardown and plan (2026-08-19)

- Captured and dissected the live site (`reference/source-audit.md`): all copy baked into one 1 MB palette PNG, Times Black's JSON-LD leaking a ₹20,000 fee into search, gold Visa mark violating Visa standards, 8-bit source art with banding baked in.
- Three research passes: luxury-web prior art (Revolut's R3F metal page, the velvet-rope pattern, Times Black as the negative control), 2026 web-tech feasibility (R3F costs the whole 307 KB JS budget; `<canvas>` is not an LCP candidate; a locked screen has no scroll to scrub — which reversed the plan toward layered stills with a WebGL upgrade tier), and collateral/licensing (Visa's September 2025 brand standards parsed in full; Khanna's copyright runs past 2086 with unassignable s.57 moral rights; RBI's dark-pattern rules effective Jan 2027).
- Plan written, multi-persona review (7 reviewers + cross-model GPT pass) surfaced 31 findings — all folded in before any code: dependency inversion (adapter before flow), stateless mocks for serverless, deployment protection as a requirement, send/submit failure states, OG metadata, and more.

## Phase 1 — First build (`074d38a`)

- Full site built by Codex from the plan: layered stage, dialog flow, adapter + mocks, fonts, structured data, asset register. Non-browser gates green.
- Browser verification (which Codex's sandbox cannot run) caught three composition failures the tests missed: a ghost card from a fake layer split, a broken plinth, copy striking through the card. Two remediation rounds (Sol) fixed composition; a third fixed E2E authoring defects (route-announcer collisions, WebKit-only LCP API).
- **U4 (real-time WebGL card) cut** after a device video showed it rendering an untextured gold slab for 12 s before falling back. Root cause: the scene had no card texture at all, and texturing it with a pre-lit render would double-light the metal. The plan had sanctioned exactly this cut.
- Deployed to Vercel behind Deployment Protection. A brief public production alias was created by mistake and removed within minutes.

## Phase 2 — Craft pass (`4cbef8f`)

- Owner verdict: stable but unremarkable — the aliveness checkpoint failed. Sol built the five-part choreography: load ceremony (darkness → bloom → card settle → specular sweep → type resolve, ≤5 s), **autonomous light drift** (14 s/23 s sine blend steering room glow + specular + card edge light; pointer/gyro steer, 2 s decay), wall and card breath cycles, and a pause control.
- **The session's biggest find:** the display typeface had *never rendered*. `next/font` emitted `--font-bodoni: "bodoni", Didot, Bodoni 72, serif` — the unquoted two-word family invalidated the whole declaration, silently collapsing all display type to the UI sans. Every screenshot until then had been judged with the typography off.
- Environmental discovery: `next build` deadlocks on Dropbox-synced `node_modules` (17-minute silent Playwright hang). All gates moved to `/tmp` copies.

## Phase 3 — Khanna rights cleared (`64fbf36`)

- Times confirmed the artwork rights. Six RED register flags cleared; the public-deploy blocker shifted from artwork clearance to the mocked backends (real PII into a flow that goes nowhere).
- Public production URL (`1838website.vercel.app`) stood up at the owner's direction.

## Phase 4 — Official brand collateral (`88d99ad`)

- The Times team delivered the full kit (2.8 GB of zips → organized 1.5 GB `collaterals/`): layered pedestal-mockup PSD, the archival Khanna painting scan (5238×7019), open card artwork, card front/back, vector logos, brand fonts, TOI 1838 masthead archives, and the approved launch print ad — now the art-direction ground truth.
- Resolved on sight: **OQ1** (source art), **OQ3** (card back reads *Visa Infinite Privilege*), OQ6's timing half (October 2026 printed in the public ad).
- True-alpha layer extractions from the PSD (`assets/`), including cutting the no-name card via the named layer's alpha mask.
- Integration: STIX Two Text + Montserrat replace the stand-ins; real pedestal/card layers; ad header lockup (TOI crest + Established in 1838, gold ICICI); ad copy (`Request an Introduction`, `Card ownership by invitation only.`, the tier line). Two remediation rounds fixed a missing wordmark, mobile collapse — and the long-lived "black slab" seam, finally traced to the card asset's soft shadow being amputated by an `overflow: hidden` clip; feathering the clip window ended it.

## Phase 5 — Owner design notes (`fc4470f`)

- Gold TOI crest (colour filter over the white source), "Established in 1838" centered beneath it, "Artwork by Krishen Khanna" restored as a nameplate under the card, invitation line moved under the CTA.
- The credit's disappearance traced to a unitless `0` in `calc(var(--object-bottom) + …)` invalidating the declaration.

## Phase 6 — Device-review spacing pass (`9833c64`)

- From the owner's iPhone screenshot: card enlarged and raised (dead middle halved into deliberate light-beam breathing room), footer centered with balanced line wrapping and safe-area padding.
- The bigger card pushed the pedestal's decorative overhang past 100 vw on portrait — caught by the ten-viewport collision suite, pinned inside.

## Phase 7 — Alpha-channel root cause and mobile lighting (2026-08-20)

- Owner's device video: card top cut off, composition reading off-center, light drift barely visible. Diagnosis found the deep cause of the whole "slab" family of bugs: **the AVIF encodes had no alpha channel** (ffmpeg's `yuv420p10le` path drops it), so every browser preferring AVIF rendered the card and pedestal layers as opaque rectangles — and the feather masks had been compensating for an opaque asset all along. The marble pedestal itself had never actually been visible.
- Encoder now routes alpha-bearing inputs through sharp for both AVIF and WebP; cutouts re-encoded (and got smaller). The card-stand's top feather mask — which was amputating the card's top edge, the "cut off" complaint — removed outright; with true alpha nothing needs hiding.
- Portrait centering trued up: pedestal box centered (`right: 2.5%` for the 95%-wide layer), card ink (49.2% of its asset) optically centered with a .8% nudge.
- Light made legible: wider autonomous drift amplitudes, stronger room-glow and specular alphas, a recurring specular pass every 17 s after the ceremony (pausable, reduced-motion-safe), gyro permission moved to `pointerup` (Safari user-activation) with stronger tilt gain.
- Desktop artwork credit re-anchored as an engraved nameplate on the gold stand bar — the print ad's own gesture.

## Phase 8 — Chrome-free stage, raised composition, mobile pedestal light (2026-08-20)

- Owner direction: the Controls button broke the UI. Removed the whole controls surface — popover, pause toggle, audio ambience (`components/audio/`, `lib/audio/`), and gyroscope steering. The stage keeps the autonomous drift plus pointer/touch steering only. `prefers-reduced-motion` is now the sole motion-suppression mechanism (a deliberate WCAG 2.2.2 trade-off, owner's call).
- Card raised on both form factors (portrait `--object-bottom` 23dvh → 27dvh, desktop 0 → 1.5rem) and the portrait wall blackout softened so the stone pedestal actually reads on a phone.

## Phase 9 — Brand-lockup parity pass (2026-08-20)

- Owner compared against the live site: logo colours and proportions were off. TOI mark rebuilt as a flat `#d8b273` gold asset (the exact fill of the supplied ICICI golden SVG — CSS filter approximation dropped), caption in the same hex, and all three marks resized to the live site's measured proportions at 1440 (TOI 8 vw, ICICI 13.9 vw, Visa 4.5 vw) and at 402 portrait (TOI 20 vw, ICICI 33 vw), with the compact blocks scaled to match.
- Visa mark deliberately stays white: Visa's Sept 2025 standards prohibit tinting and require white-on-dark — the live site's gold Visa is the violation this build fixed. Owner to overrule knowingly if visual parity outweighs the standard.

## Verification state at session end

79/80 browser scenarios green on Chromium + WebKit (1 skipped by design: WebKit lacks the LCP PerformanceObserver), 20 unit tests, ~266 KB critical JS against a 307 KB budget, axe-clean, asset register fully green. Remaining go-live items are business, not code: real backends, the DLT SMS template, and the private-office name.
