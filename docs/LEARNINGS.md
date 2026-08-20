# Learnings — 1838 Reserve teaser build

Durable lessons from the 2026-08-19/20 build session. Read before modifying the stage, the tests, or the pipeline. Ordered roughly by how expensive each was to learn.

## Environment

1. **`next build` deadlocks on Dropbox CloudStorage.** SWC/Turbopack's parallel reads against Dropbox's file provider hang silently — 0 % CPU forever, no error, indistinguishable from a slow compile. It ate a 17-minute Playwright run (its `webServer` build froze) before diagnosis. **Rule: build and run browser suites from an `rsync` copy in `/tmp`; copy sources back.** Vercel is unaffected (remote build). Playwright's `reuseExistingServer: !process.env.CI` lets a manually started server bypass the fragile path.
2. **Vercel uploads the whole directory, not the git tree.** The 1.5 GB `collaterals/` folder broke a deploy at 1.8 GB uploaded; `.gitignore` does not apply — `.vercelignore` does.
3. **Vercel Deployment Protection covers previews, not production aliases.** `vercel deploy --prod` created a *publicly reachable* URL for a PAN/DOB-collecting form with uncleared artwork — live for ~2 minutes before the alias was removed. When protection is the fence, deploy previews only, and treat `--prod` as a deliberate publication act.

## Silent front-end failures (all shipped past green tests)

4. **An unquoted multi-word font fallback disables the typeface.** `next/font` emitted `--font-bodoni: "bodoni", Didot, Bodoni 72, serif`; `72` is not a CSS identifier, the whole `font-family` declaration is invalid, and every element silently inherits the body font. The display typeface never rendered through multiple reviewed rounds — no error anywhere. **Rule: single-word fallback families only** (and quoting them breaks `next/font`'s codegen, so multi-word names simply can't go in the array).
5. **A unitless `0` inside `calc()` invalidates the expression.** `bottom: calc(var(--object-bottom) + 2rem)` with `--object-bottom: 0` silently drops the declaration; the element falls into grid flow at the top of the page. Custom properties used in `calc()` must carry units: `0px`.
6. **A soft shadow amputated by `overflow: hidden` reads as a hard-edged slab.** The card asset's baked drop shadow, clipped at its container's box, produced a "black rectangle pasted on the wall" that survived three remediation attempts aimed at the wrong layers. Feathering the clip window (`mask-image` gradients on the clipping element) is the fix. Diagnose paint attribution empirically — hide layers and measure pixel brightness; `elementsFromPoint` skips `pointer-events: none` layers and misleads.
7. **`<canvas>` is not an LCP candidate** — a WebGL hero silently hands LCP to whatever's next largest, and starting stage images at `opacity: 0` for a ceremony disqualifies them too. Animate a darkening scrim *above* the image instead of the image's own opacity.

## Working with Codex as the executor

8. **Codex writes tests it cannot run, and they fail.** Its sandbox blocks browser launch, so every E2E spec it authored was unexecuted on delivery — and each batch contained both app bugs its own specs caught *and* spec-authoring bugs (bare `getByRole('alert')` colliding with Next's route announcer, Chromium-only APIs asserted on WebKit, substring name collisions). **Rule: whoever can run the suite runs it before anything ships; budget a remediation round per Codex delivery.**
9. **Tests green ≠ page right.** The untextured WebGL slab, the ghost card, the copy striking through the card, the dead mobile void — all passed the suite. Screenshot review at real viewports (and a screen *recording* for motion claims) is a first-class gate, not a courtesy. The user's phone found what 79 green tests didn't.
10. **Headless `codex exec` stops to ask for approval.** Sol repeatedly ended runs with "may I proceed?" — unanswerable over stdin-closed exec. Bake `APPROVED — proceed, do not ask` plus the accepted proposal verbatim into a relaunch prompt.
11. **Tell Codex about environment hazards up front** (Dropbox copy pattern, no-browser sandbox, no commits). Every omission became a wasted round or a self-reported workaround discovered late.

## Design & compliance facts worth keeping

12. **Visa brand standards are concrete and enforceable:** white mark on dark (the live site's gold mark violates this), 1× clear space, never blurred/cropped/tinted, ≥1 s still hold in any animation, and if the mark isn't visible on the card image the full product name must appear in text. The card's tier lockup lives on the **back** (Visa Infinite Privilege) — the approved front carries no Visa mark at all.
13. **Krishen Khanna is alive; copyright runs past 2086, no collecting society exists, and s.57 moral rights are unassignable** — crop/tint/perspective treatments need artist-visible approval even after a reproduction licence. A licence for the physical card does not automatically cover marketing use; the photograph of a painting is a separate copyright from the painting.
14. **RBI's advertising amendment (effective 2027-01-01) bans hidden fees and false urgency** — the fee belongs on the first screen from day one, consent starts unticked, and queue/referral/scarcity mechanics are legal exposure in India, not just taste violations.
15. **OTP UX has a settled shape:** one real input painted as N slots (`autocomplete="one-time-code"`, `inputmode="numeric"`, never `opacity: 0` — iOS won't paste into invisible inputs), and Indian SMS autofill dies without the `@domain #code` suffix registered in the DLT template — aggregator lead time, unfixable client-side.
16. **The aliveness of a touch-device page must be autonomous.** Pointer-driven effects don't exist on phones; gyro hides behind an iOS permission tap. The fix that mattered was the self-running light drift — input *steers* it rather than being its only source.
17. **Pre-lit renders can't become PBR textures.** Painting a finished product render onto real-time metal double-lights it; a genuine 3D card needs the unlit source. Cutting the WebGL tier beat shipping a worse version of the poster.
18. **PSD groups composite to true alpha with `psd-tools`** — and a personalization layer can be removed from a flattened variant by masking it with the *named* variant's alpha. That one technique turned the brand's mockup into clean stage layers.

## Process

19. **Plan-first paid off.** The pre-build review (7 personas + cross-model) moved dependency order, stateless mocks, deployment protection and failure states into the plan before any code existed — every one of those would have been a mid-build refactor otherwise.
20. **The approved print ad beat every generated direction.** Once real collateral existed, "match the ad" replaced pages of art-direction reasoning. Get the brand's ground truth early; ask for source files on day one (OQ1 was the plan's first question, and its arrival changed everything).
21. **Fold review verdicts into the plan file itself** (OQ resolutions dated inline, KTDs superseded with context preserved). The plan stayed the single source of truth across six commits and three executors.
