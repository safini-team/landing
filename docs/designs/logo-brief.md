# Safini logo brief - Pine & Sand

Status: OPEN. Palette locked 2026-09-03, mark not yet drawn.

## What we are replacing and why

The current mark is one 827 KB raster (`assets/safini-logo.png`) doing five jobs:
mascot, wordmark, favicon, nav brand, and app icon. It reads as machine-generated
for four specific reasons, and every one of them is a hard constraint below:

1. the wordmark is filled with a violet -> pink gradient
2. Fini is a 3D render - specular highlights on the beak, soft-body gloss on the
   belly, an ambient glow behind the phone screen, a bevel on the cap
3. he carries a phone prop, which is why the icon is unreadable under ~60px
4. there is no vector anywhere, so there is no monochrome cut and no icon mark

## Palette (locked - do not substitute)

| Role | Hex |
|---|---|
| Pine 600, primary | `#1A5C4A` |
| Pine 700 | `#14453A` |
| Ink | `#0C231C` |
| Sand | `#F7F5F0` |
| Coin amber - Time Coins only | `#E8A33D` |
| Bill / feet | `#E8A33D` |

Amber appears on the mark only where it means "coin". Nothing else is warm.

## Deliverables

| File | What |
|---|---|
| `logo-full.svg` | Fini + wordmark, stacked |
| `logo-horizontal.svg` | Fini + wordmark, side by side |
| `mark.svg` | Fini alone, full body |
| `icon.svg` | Fini's head only, on a solid `#1A5C4A` field, rounded square |
| `mark-mono.svg` | single-colour cut for print and dark grounds |
| `icon-1024.png` | flattened, no alpha, solid field |
| `favicon.svg` | the icon mark, simplified for 16px |
| `og-image.png` | 1200x630 |

The icon mark is the gate. Draw it first and test it at 40px before anything
else gets coloured in - if it does not read at 40px, the silhouette is wrong and
no amount of detail fixes it.

---

## Prompt A - Fini, flat (full body mark)

> Flat vector illustration of a friendly cartoon penguin mascot, front-facing,
> full body, standing, centred on a plain white background.
>
> Style: strictly 2D flat design. Uniform solid colour fills only. Clean
> geometric shapes with smooth confident curves. Simple, bold, minimal detail -
> readable as a silhouette. Modern brand mascot in the flat, geometric style of
> contemporary app iconography.
>
> Colours - use these exact values and nothing else: body and outline dark
> green-black #0C231C, belly and face patch off-white #F7F5F0, backwards
> baseball cap deep green #1A5C4A, beak and feet amber #E8A33D, round glasses
> frames amber #E8A33D.
>
> Details: round black eyes with a single small white highlight dot each,
> round glasses, a backwards baseball cap, small flippers at the sides, two
> webbed feet. Cheerful, calm expression - a small closed smile, not an open
> mouth.
>
> Absolutely no: gradients, colour ramps, gloss, specular highlights, shine,
> reflections, 3D rendering, bevels, extrusion, drop shadows, glow, ambient
> occlusion, texture, noise, outlines of varying weight, purple, pink, magenta,
> props, phones, held objects, text, background elements.

Negative prompt, if the tool takes one separately:

```
3d render, glossy, gloss, shiny, specular, highlight, bevel, extruded, plastic,
gradient, gradient fill, ombre, glow, bloom, drop shadow, soft shadow, ambient
occlusion, texture, grain, noise, purple, violet, magenta, pink, holding phone,
prop, text, letters, watermark, busy background, photorealistic, cinematic
```

## Prompt B - icon mark (head only)

> Flat vector app icon. A cartoon penguin's head only, front-facing, centred,
> filling most of the frame, on a solid deep green #1A5C4A background, rounded
> square format.
>
> Strictly 2D flat design, uniform solid fills, bold simple shapes, high
> contrast, readable at 40 pixels. Head is dark green-black #0C231C with an
> off-white #F7F5F0 face patch, round black eyes, and an amber #E8A33D beak.
> Backwards deep-green cap on top.
>
> No gradients, no gloss, no 3D, no shadows, no glow, no text, no body, no
> props, no purple or pink.

## Prompt C - wordmark

Do not generate this. Image models cannot set type - they produce letterforms
that are almost-but-not-quite a real alphabet, which is its own kind of tell.

Set "Safini" in **Bricolage Grotesque ExtraBold**, one flat fill of Ink
`#0C231C`, tracking about -2.5%, then have a designer redraw the `f` and `i`
terminals by hand. That is the whole wordmark. No gradient, ever.

---

## Reviewing what comes back

Reject on sight if any of these are present:

- any gradient anywhere, including a subtle one inside a single shape
- a white specular dot on the beak or a sheen band across the belly
- more than the six colours listed above
- a drop shadow under the character
- a phone, tablet, or any held object in the primary mark
- outline weight that varies around the shape
- the head not being readable when you scale the image to 40px

Then, regardless of how good the raster looks: **it still has to be redrawn as
real vector paths.** An image model gives you a reference, not a logo. Budget
for the trace.
