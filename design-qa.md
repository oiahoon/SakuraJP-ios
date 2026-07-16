# Sakura JP Website Design QA

final result: passed

## Source truth

- Current shipped app: Sakura JP `2.1.2 (184)` from the installed iPhone 17 Pro simulator build.
- App screenshots captured from that build:
  - `assets/app-screens/discovery.webp`
  - `assets/app-screens/shadowing.webp`
  - `assets/app-screens/favorites.webp`
  - `assets/app-screens/profile.webp`
- App brand assets:
  - `assets/favicon.png`
  - `assets/apple-touch-icon.png`
- Generated hero artwork:
  - `assets/sakura-ink-wash-hero.webp`
  - Art direction: warm washi paper, restrained Sakura pink wash, charcoal brush stroke, sparse petals, no embedded text or logos.

## Implementation evidence

- Desktop home hero, 1280 × 720: `.qa/home-desktop-final.png`
- Desktop learning-space section, 1280 × 720: `.qa/home-workspace-desktop.png`
- Mobile home hero, 390 × 844: `.qa/home-mobile.png`
- Mobile Shadowing page, 390 × 844: `.qa/shadowing-mobile.png`
- Full comparison input: `.qa/full-comparison.png`
- Focused app-to-site comparison input: `.qa/focused-comparison.png`

## Visual comparison

The full comparison places the generated hero art, current app Profile screen, desktop home implementation, and mobile home implementation in one image. The focused comparison places current Profile and Shadowing screens beside their website implementations.

- Typography: passed. The website uses the same compact, high-contrast system-type feel as the native app, with readable CJK line breaks and no clipped labels.
- Color and material: passed. Sakura pink, warm white, black ink, fine borders, and restrained translucent surfaces stay consistent with the current app.
- Image fidelity: passed. Device screens use exact simulator captures rather than recreated UI, placeholder boxes, or code drawings.
- Hierarchy: passed. Product promise, App Store CTA, and the four learning workspaces are clear at desktop and mobile sizes.
- Spacing and cropping: passed. Hero art fills its intended field; device screenshots retain their native aspect ratio and remain legible without stretching.
- Responsive layout: passed. Browser checks at 1280 × 720 and 390 × 844 found no horizontal overflow.

## Interaction and content checks

- Header navigation, feature-page links, App Store links, mobile menu, and Support FAQ disclosures work.
- All nine HTML pages and every local image, stylesheet, script, icon, and document link resolve.
- Support, Privacy, and Terms now describe the current local-first app, optional online AI behavior, user-owned Shadowing audio, microphone use, and export flow without the previous account or subscription claims.
- Browser console: zero warnings and zero errors on the tested home, Shadowing, and Support states.

## Comparison history

1. Initial browser capture exposed a P1 layout defect: intrinsic HTML image dimensions were overriding responsive widths and producing oversized device images and excessive page height.
2. Added a global responsive image height rule, then re-captured desktop and mobile views.
3. Tightened the desktop hero height, headline scale, and device width so the full primary CTA path fits above the fold.
4. Rechecked the combined full and focused comparison inputs. No P0, P1, or P2 visual issues remain.
