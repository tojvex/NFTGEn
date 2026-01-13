# NFT Generator

This is a local, client-only NFT layer preview tool. Upload your layers folder, set order and rules, and generate previews.

## Run locally

```bash
npm install
npm run dev
```

## Build and preview

```bash
npm run build
npm run preview
```

## Layer folder structure

```txt
Layers/
  Background/
    Blue.png
    Red#5.png
  Body/
    Alien.png
  Eyes/
    Laser#2.png
```

Supported image types: png, jpg, jpeg, gif, svg, webp.
Rarity suffix: add `#number` before the extension (example: `Laser#2.png`).

The uploader accepts both:
- `Layer/trait.png`
- `Root/Layer/trait.png`

## Notes
- Folder upload works in Chromium-based browsers (Chrome, Edge, Brave).
- Canvas size is fixed at 1000x1000, so keep layer images square for best results.
