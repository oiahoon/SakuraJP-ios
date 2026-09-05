# 樱语 Sakura JP Website

Official multi-page website for Sakura JP, a native iOS Japanese-learning app
for Chinese-speaking learners.

## Live site

- Domain: <https://sakura.miaowu.org/>
- Hosting: GitHub Pages
- Deployment: `.github/workflows/deploy.yml` on pushes to `main`

## Current product baseline

The September 2026 refresh describes source baseline `2.1.17 (199)`. Five
major screenshots were freshly captured from that installed Simulator build;
three unchanged sheets reuse same-day accepted 2.1.16 evidence. Per the user's direction, public pages present the latest 2.1.17 baseline.
Dated Store-state evidence stays in the parent development handoff.

Current capabilities:

- Discovery / Today Study
- Shadowing / Listening Practice
- Favorites / Knowledge Shelf
- Profile / Progress & Settings
- Local-first 句解 with reviewed grammar patterns and optional validated online enhancement
- Card-level practice, shared preview/export rendering, voice settings and Favorites transfer
- Support, privacy, and terms pages aligned to current local-first behavior

## Site structure

- `index.html`: product overview and interactive learning preview
- `hero-demo.js`, `assets/demo/`: bounded preview state, source examples and art
- `discovery.html`: Today Study
- `shadowing.html`: audio import and shadowing practice
- `favorites.html`: Knowledge Shelf
- `progress.html`: history, statistics, and settings
- `grammar.html`: grammar relations and sentence analysis
- `support.html`, `privacy.html`, `terms.html`: support and policy content
- `assets/asset-manifest.md`: visual provenance and export notes

The site is intentionally static HTML, CSS, and minimal JavaScript for fast,
durable GitHub Pages hosting. The Hero adds three real learning examples with
card gestures, detail/句解 and in-memory Favorites. This is a labeled web preview,
not the native runtime; the real screenshot is always available. See
[demo provenance and constraints](assets/demo/README.md).

## Validation and deployment

```bash
python3 check_site.py
python3 -m http.server 4173 --bind 127.0.0.1
```

Check all nine routes on desktop and mobile; exercise the menu, Escape focus,
FAQ disclosure, workspace anchor and App Store links. Current SHA and live
validation are recorded in `design-qa.md` and the parent project's handoff.

The browser regression scripts require Playwright (Chromium and WebKit). Use an
existing installation with `PLAYWRIGHT_MODULE=/absolute/path/to/playwright`, or
resolve it from your development environment; no browser library is shipped.

```bash
node tests/hero-demo.cjs http://127.0.0.1:4173 chromium
node tests/hero-demo.cjs http://127.0.0.1:4173 webkit
node tests/hero-touch.cjs http://127.0.0.1:4173
```

Screenshots/reports go to the system temporary directory, or `SAKURA_QA_OUTPUT`.
Repeat against the public URL after deployment. Cover no-JS/data failure,
reduced motion, touch cancellation, vertical page scroll and presentation toggles.

The workflow validates links/assets/metadata, stages only public HTML/CSS/JS,
CNAME, robots/sitemap and assets, then deploys main pushes to Pages. Pull requests
validate without production deployment. This is the sole production workflow;
the parent app repository only checks its pinned submodule snapshot.
