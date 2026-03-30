# Subpixel Editor

Small Bun-powered web app for editing images at the RGB subpixel level.

## Stack

- Bun
- Vite
- React
- TypeScript
- Tailwind CSS
- Canvas 2D

## Features In This Version

- Create a new black image with custom width and height
- Edit each pixel as three separate vertical RGB subpixels
- Toggle subpixels between `0` and `255`
- Import images and threshold all non-zero RGB channel values to `255`
- Export the final image as a PNG at the original pixel resolution
- Live preview of the combined output image

## Run

```bash
bun install
bun dev
```

## Build

```bash
bun run build
```

