---
name: Select Experience — codecon.dev/select (frame layer)
source: https://codecon.dev/select (captured 2026-09-30)
---

# Frame system

Derived from the live site, not from a preset. Monochrome editorial-terminal: paper and ink, one mono
typeface, hairline construction lines, grainy grayscale photography. **No accent color.**

## Color

| token   | hex       | use                                                   |
| ------- | --------- | ----------------------------------------------------- |
| paper   | `#F0EFEE` | default canvas                                         |
| ink     | `#050707` | type on paper, dark sections, buttons                  |
| rule    | `#D4D3D1` | 1px hairlines on paper, dot grid                       |
| rule-dk | `#2A2D2D` | 1px hairlines on ink                                   |
| mute    | `#858483` | secondary copy on paper ("São poucas vagas…")         |
| steel   | `#99A0A9` | "EXPERIENCE" in the logo, captions on ink              |

## Type

Space Mono only. Display: 700, UPPERCASE, line-height 1.0 ("KEEP GETTING BETTER",
"FEITO PRA QUEM JÁ CHEGOU LONGE"). Section heads: 400/700 sentence case ("Garanta seu lugar",
"Quem vai"). Stats: 400, large, paper on ink. Labels: 400 uppercase.

## Construction

- A centered content column framed by 1px vertical hairlines; the gutters outside carry a faint dot grid.
- Horizontal hairlines cross the column; a small 4-point star ✦ sits on each intersection.
- A diagonal-hatch band separates sections.
- Square corners everywhere (radius 0). Buttons: ink block, paper Space Mono text, `→`.

## Imagery

Grayscale, high-grain, slightly crushed photos (event floor, fishbowls, headsets, mics). Speaker tiles
are square grayscale portraits with name (700) / role (mute) in mono underneath.

## Signature

The dark "select/ EXPERIENCE" logo drawn as glowing ASCII characters, followed by the stats row
300 · +25 · +20 · 1.

## Motion

Terminal-honest: typed text with a block cursor, `steps()` wipes, hairlines drawing on, 3D flip
(rotateX) text swaps like the site's buttons, hard cuts on the beat. No bounce, no glow blobs.
