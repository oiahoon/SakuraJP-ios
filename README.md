# 樱语 Sakura JP Website

Official multi-page website for Sakura JP, a native iOS Japanese-learning app
for Chinese-speaking learners.

## Live site

- Domain: <https://sakura.miaowu.org/>
- Hosting: GitHub Pages
- Deployment: `.github/workflows/deploy.yml` on pushes to `main`

## Current product baseline

The July 2026 website refresh is aligned to Sakura JP `2.1.2 (184)` and uses
fresh simulator captures from the shipping app design:

- Discovery / Today Study
- Shadowing / Listening Practice
- Favorites / Knowledge Shelf
- Profile / Progress & Settings
- Reviewed grammar relations and read-only sentence analysis
- Support, privacy, and terms pages aligned to current local-first behavior

## Site structure

- `index.html`: product overview and learning loop
- `discovery.html`: Today Study
- `shadowing.html`: audio import and shadowing practice
- `favorites.html`: Knowledge Shelf
- `progress.html`: history, statistics, and settings
- `grammar.html`: grammar relations and sentence analysis
- `support.html`, `privacy.html`, `terms.html`: support and policy content
- `assets/asset-manifest.md`: visual provenance and export notes

The site is intentionally static HTML, CSS, and minimal JavaScript for fast,
durable GitHub Pages hosting.
