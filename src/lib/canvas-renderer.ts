import { CHANNEL_META, type ChannelIndex, type SubpixelImageDocument } from './subpixel-image'

export interface EditorMetrics {
  width: number
  height: number
  subpixelWidth: number
  cellHeight: number
}

const MIN_SUBPIXEL_WIDTH = 12
const MAX_SUBPIXEL_WIDTH = 24
const MIN_CELL_HEIGHT = 20
const MAX_CELL_HEIGHT = 56

export function getEditorMetrics(image: SubpixelImageDocument): EditorMetrics {
  const subpixelWidth = clamp(
    Math.floor(960 / Math.max(image.width * 3, 1)),
    MIN_SUBPIXEL_WIDTH,
    MAX_SUBPIXEL_WIDTH,
  )
  const cellHeight = clamp(
    Math.floor(720 / Math.max(image.height, 1)),
    MIN_CELL_HEIGHT,
    MAX_CELL_HEIGHT,
  )

  return {
    width: image.width * 3 * subpixelWidth,
    height: image.height * cellHeight,
    subpixelWidth,
    cellHeight,
  }
}

export function renderEditorCanvas(
  context: CanvasRenderingContext2D,
  image: SubpixelImageDocument,
  metrics: EditorMetrics,
): void {
  context.clearRect(0, 0, metrics.width, metrics.height)
  context.fillStyle = '#03060d'
  context.fillRect(0, 0, metrics.width, metrics.height)

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const pixelIndex = (y * image.width + x) * 3

      for (let channel = 0; channel < 3; channel += 1) {
        const value = image.data[pixelIndex + channel]
        const column = x * 3 + channel

        context.fillStyle = value === 255 ? CHANNEL_META[channel].color : '#070c18'
        context.fillRect(
          column * metrics.subpixelWidth,
          y * metrics.cellHeight,
          metrics.subpixelWidth,
          metrics.cellHeight,
        )
      }
    }
  }

  for (let row = 0; row <= image.height; row += 1) {
    const y = row * metrics.cellHeight + 0.5
    context.beginPath()
    context.strokeStyle = 'rgba(255, 255, 255, 0.18)'
    context.lineWidth = row === 0 || row === image.height ? 2 : 1
    context.moveTo(0, y)
    context.lineTo(metrics.width, y)
    context.stroke()
  }

  for (let column = 0; column <= image.width * 3; column += 1) {
    const isPixelBoundary = column % 3 === 0
    const x = column * metrics.subpixelWidth + (isPixelBoundary ? 0 : 0.5)
    context.beginPath()
    context.strokeStyle = isPixelBoundary
      ? 'rgba(255, 255, 255, 0.34)'
      : 'rgba(255, 255, 255, 0.12)'
    context.lineWidth = isPixelBoundary ? 2 : 1
    context.moveTo(x, 0)
    context.lineTo(x, metrics.height)
    context.stroke()
  }
}

export function hitTestEditorPoint(
  image: SubpixelImageDocument,
  metrics: EditorMetrics,
  x: number,
  y: number,
): { x: number; y: number; channel: ChannelIndex } | null {
  if (x < 0 || y < 0 || x >= metrics.width || y >= metrics.height) {
    return null
  }

  const row = Math.floor(y / metrics.cellHeight)
  const subpixelColumn = Math.floor(x / metrics.subpixelWidth)
  const pixelColumn = Math.floor(subpixelColumn / 3)
  const channel = (subpixelColumn % 3) as ChannelIndex

  if (row >= image.height || pixelColumn >= image.width) {
    return null
  }

  return {
    x: pixelColumn,
    y: row,
    channel,
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
}
