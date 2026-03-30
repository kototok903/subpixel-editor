export type ChannelIndex = 0 | 1 | 2

export interface SubpixelImageDocument {
  width: number
  height: number
  data: Uint8ClampedArray
}

export interface ImageStats {
  totalActive: number
  activePixels: number
  channelCounts: [number, number, number]
}

export const MAX_IMAGE_DIMENSION = 128
export const DEFAULT_IMAGE_SIZE = 16

export const CHANNEL_META = [
  { label: 'R', name: 'Red', color: '#ff5449' },
  { label: 'G', name: 'Green', color: '#45ff66' },
  { label: 'B', name: 'Blue', color: '#3f72ff' },
] as const

export function normalizeDimension(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_IMAGE_SIZE
  }

  return Math.min(
    MAX_IMAGE_DIMENSION,
    Math.max(1, Math.round(Math.abs(value))),
  )
}

export function createEmptyImage(
  width: number,
  height: number,
): SubpixelImageDocument {
  const normalizedWidth = normalizeDimension(width)
  const normalizedHeight = normalizeDimension(height)

  return {
    width: normalizedWidth,
    height: normalizedHeight,
    data: new Uint8ClampedArray(normalizedWidth * normalizedHeight * 3),
  }
}

export function toggleSubpixel(
  image: SubpixelImageDocument,
  x: number,
  y: number,
  channel: ChannelIndex,
): SubpixelImageDocument {
  if (x < 0 || y < 0 || x >= image.width || y >= image.height) {
    return image
  }

  const nextData = image.data.slice()
  const index = (y * image.width + x) * 3 + channel

  nextData[index] = nextData[index] === 0 ? 255 : 0

  return {
    ...image,
    data: nextData,
  }
}

export function fromThresholdedRgba(
  width: number,
  height: number,
  rgba: Uint8ClampedArray,
): SubpixelImageDocument {
  const data = new Uint8ClampedArray(width * height * 3)

  for (let sourceIndex = 0, targetIndex = 0; sourceIndex < rgba.length; sourceIndex += 4, targetIndex += 3) {
    const alpha = rgba[sourceIndex + 3]

    if (alpha === 0) {
      data[targetIndex] = 0
      data[targetIndex + 1] = 0
      data[targetIndex + 2] = 0
      continue
    }

    data[targetIndex] = rgba[sourceIndex] === 0 ? 0 : 255
    data[targetIndex + 1] = rgba[sourceIndex + 1] === 0 ? 0 : 255
    data[targetIndex + 2] = rgba[sourceIndex + 2] === 0 ? 0 : 255
  }

  return {
    width,
    height,
    data,
  }
}

export function toImageData(image: SubpixelImageDocument): ImageData {
  const rgba = new Uint8ClampedArray(image.width * image.height * 4)

  for (let sourceIndex = 0, targetIndex = 0; sourceIndex < image.data.length; sourceIndex += 3, targetIndex += 4) {
    rgba[targetIndex] = image.data[sourceIndex]
    rgba[targetIndex + 1] = image.data[sourceIndex + 1]
    rgba[targetIndex + 2] = image.data[sourceIndex + 2]
    rgba[targetIndex + 3] = 255
  }

  return new ImageData(rgba, image.width, image.height)
}

export function getImageStats(image: SubpixelImageDocument): ImageStats {
  const channelCounts: [number, number, number] = [0, 0, 0]
  let totalActive = 0
  let activePixels = 0

  for (let index = 0; index < image.data.length; index += 3) {
    let pixelActive = false

    for (let channel = 0; channel < 3; channel += 1) {
      if (image.data[index + channel] === 255) {
        channelCounts[channel] += 1
        totalActive += 1
        pixelActive = true
      }
    }

    if (pixelActive) {
      activePixels += 1
    }
  }

  return {
    totalActive,
    activePixels,
    channelCounts,
  }
}
