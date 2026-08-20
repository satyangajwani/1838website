# 1838 Reserve teaser — agent instructions

Single-screen luxury invite page for the 1838 Reserve card (TOI × ICICI × Visa Infinite Privilege). Next.js 16 App Router, static prerender + mock API Route Handlers, layered-stills stage with autonomous light. The approved launch print ad in `collaterals/print-ad/` is the art-direction ground truth — match it, don't invent.

## Hard rules

- **Never run `next build` or the Playwright suite in this checkout.** Dropbox deadlocks SWC silently (0 % CPU, no error). Work here, verify there:
  ```bash
  rsync -a --exclude node_modules --exclude .next --exclude collaterals --exclude reference ./ /tmp/1838w/
  cd /tmp/1838w && CI=true pnpm install --frozen-lockfile && pnpm build && pnpm exec playwright test
  ```
  Copy changed files back afterwards. Vercel builds remotely and is unaffected.
- **Deploy previews only** (`vercel deploy --yes`). `--prod` publishes past Deployment Protection to the public alias — owner's call, never yours. `.vercelignore` must keep `collaterals/`, `reference/`, `assets/` out of uploads.
- **`collaterals/` (1.5 GB brand kit) stays out of git and deploys.** Derivatives go through `scripts/encode-assets.mjs` into `public/stage/` and get a row in `docs/asset-register.md` (`pnpm audit:assets` enforces it).
- **Font fallback arrays: single-word family names only.** A multi-word name invalidates the entire `font-family` declaration silently (this shipped once).
- **Custom properties used in `calc()` need units** — `0px`, never `0`.
- **Green tests are not a visual verdict.** Screenshot desktop 1440×900 + iPhone-13 viewport after stage/layout changes; use a recording for any motion claim. The ten-viewport collision spec in `e2e/stage.spec.ts` is the geometry safety net — never weaken it to make a layout land.
- The interest flow collects PAN/DOB into mocks. Nothing that makes the flow publicly reachable ships without the owner deciding it.

## Where things live

- Network seam: `lib/api/adapter.ts` (only file that knows endpoints). Mocks: `app/api/*` — stateless by design (Vercel functions share no memory).
- Stage: `components/stage/` + the media-query blocks at the bottom of `app/globals.css`. Light drift: `components/stage/stage-controller.ts`.
- Full context: `README.md` (state + go-live checklist), `docs/LEARNINGS.md` (the expensive lessons, read it), `docs/CHANGELOG.md`, `docs/plans/…-plan.md` (requirements/decisions/OQs — update OQs inline when they resolve).
