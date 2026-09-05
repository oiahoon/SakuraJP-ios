# Hero preview source and boundaries

Baseline: Sakura JP 2.1.17 (199), parent application source `0a7058c`.
Updated 2026-09-05. The Hero is a small HTML interaction model, explicitly labeled
网页轻体验; App 实拍 switches to the unmodified versioned Simulator screenshot.

## Content provenance

`content.json` contains three learning points and their first selected examples,
exported read-only from the bundled generated SQLite database. The stored title,
reading, translation and grammar analysis are preserved. No learner data is used.

| Learning point ID | Example ID |
| --- | --- |
| grammar_hanabira_n5_0050_verb-naide-kudasai | 18959 |
| grammar_hanabira_n4_0096_temo-ii | 22845 |
| grammar_hanabira_n4_0007_noun-noun-shika-nai | 19507 |

The first example's three phrase buttons mirror the app's confirmed local
segmentation (ここで / 写真を / 撮らないでください。). Phrase labels and two
short explanations are curated presentation text, not a new arbitrary-sentence
analysis engine. Other examples show their stored grammar analysis and formula.
When updating the source, inspect the matching native service/tests and database.

`washi-dawn.webp` is an optimized 720px, quality-82 export of existing approved
app art at `ios-native/SakuraJP/Resources/Assets.xcassets/SakuraDayProgressDawn.imageset/SakuraDayProgressDawn@2x.jpg`
in the parent repository. Its art provenance is in `design-assets/daily-progress-art/README.md`.
It is decorative, not an app screenshot or a new third-party asset.

## Behavior contract

- Left swipe or next skips; right swipe or save stores the card in a page-local
  Set and advances. Arrow keys and visible buttons offer alternatives to dragging.
- Tap opens detail, then 句解; Favorites can reopen and remove saved cards.
- Refresh resets this preview. It writes no localStorage, account, learning
  history, native Favorites or review queue. Only three static examples are loaded.
- Audio is requested only after a click, using an available Japanese Web Speech
  voice. Missing voices are disclosed. Navigation, screenshot mode, leaving the
  viewport, backgrounding and page exit cancel active preview speech.
- 跟读 and 我的 link to feature pages. There is no microphone, audio import,
  free-text AI analysis, or hidden imitation of an unavailable native operation.
- Motion is finite: pointer updates use requestAnimationFrame; card transitions
  use compositor transforms. Reduced Motion disables transitions, vertical
  gestures allow ordinary page scrolling, and idle content has no animation loop.
- Failed content loading and disabled JavaScript preserve the real app screenshot.

The Pages staging step must include `hero-demo.js` as well as `script.js`.
Browser regression scripts live in `tests/`; they are not staged for publication.
