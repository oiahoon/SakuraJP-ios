# Website QA - 2026-09-05

Source baseline: Sakura JP 2.1.17 (199); website parent application commit 0a7058c.

## Changes

Latest four-tab app screenshots, real 句解 in place of the old HTML mockup,
practice/share/voice gallery, current Discovery gestures, local audio and AI
boundaries, Favorites migration, current app icon and dated source attribution.
Paper/ink headings and restrained surfaces preserve the app's reading direction.

## Local validation

- `python3 check_site.py`: all 9 pages, local links, anchors, image dimensions/alt,
  CSS assets, canonical domain and required metadata pass.
- Playwright Chromium: 9 pages at 1440, 768, 390 and 320px (36 page/viewport checks)
  pass page identity, meaningful main content, one h1, image loading and no
  horizontal overflow. No page exceptions, console errors or local HTTP errors.
- Interactions pass: mobile menu -> grammar; Escape closes and returns focus;
  audio import FAQ opens; workspace anchor updates URL; App Store links use
  app ID 6749544407; reduced motion disables smooth scrolling.
- Browser plugin skill was not available; existing Playwright used without new
  dependencies. Evidence lives in the parent ignored output directory.
- Full-page and first-viewport desktop/mobile screenshots visually reviewed.
- An initial QA URL assertion expected `/#workspace` after navigating to
  `index.html`; corrected the harness to check the URL hash. No site workaround.

## Deployment contract

This repository owns Pages production. PRs validate only. Main deployments
first validate, then publish an allowlist of website assets. The parent repository
validates its pinned submodule instead of publishing a second website.

The user requested latest-version messaging even while Store publication catches
up. Pages describe the 2.1.17 implementation; they do not claim review approval.
Post-deployment checks are recorded in the parent project handoff.

## Limits

Rendered website checks do not rerun the iOS test suite, prove physical-device
microphone behavior, or verify delivery of the existing support mailbox.

## Interactive Hero follow-up · 2026-09-05

- Three source examples support card tap, detail, curated 句解, phrase selection,
  left/next, right/save, Favorites open/remove and real-screenshot mode.
- Finite spring-like easing replaces abrupt transitions. Scrolling remains native;
  Reduced Motion, cancellation, backgrounding and offscreen cleanup are explicit.
- Local Chromium and WebKit pass the Hero regression at 1440/768/390/320px,
  including pointer gestures, keyboard alternatives, mode/state preservation,
  missing Japanese voice, reduced motion, data failure and no-JS fallback.
- Chromium mobile touch events pass swipe/save, cancelled gesture, vertical page
  scroll, mode switching during transition and no active animations at idle.
- All 36 page/viewport checks and six existing navigation checks pass again,
  without console/page/HTTP errors. Desktop/mobile and sentence states reviewed.
- Repeatable scripts: `tests/hero-demo.cjs` and `tests/hero-touch.cjs`. WebKit's
  missing-voice test replaces the window property rather than assigning to its
  native method; this is a test-harness compatibility detail, not product logic.
- Evidence: parent `output/website-hero-demo-2026-09-05/`. Voice fallback and
  browser interactions were checked; this does not certify audible pronunciation
  on every visitor's system or physical iPhone Safari behavior.
