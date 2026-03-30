import { fromThresholdedRgba, toImageData, type SubpixelImageDocument } from './subpixel-image'

export async function importImageFile(file: File): Promise<SubpixelImageDocument> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height

  const context = canvas.getContext('2d')

  if (!context) {
    bitmap.close()
    throw new Error('Canvas rendering is not available in this browser.')
  }

  context.drawImage(bitmap, 0, 0)
  bitmap.close()

  const source = context.getImageData(0, 0, canvas.width, canvas.height)

  return fromThresholdedRgba(source.width, source.height, source.data)
}

export async function exportImageBlob(
  image: SubpixelImageDocument,
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height

  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvas rendering is not available in this browser.')
  }

  context.putImageData(toImageData(image), 0, 0)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Unable to export the image.'))
        return
      }

      resolve(blob)
    }, 'image/png')
  })
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = fileName
  link.click()
  URL.revokeObjectURL(objectUrl)
}
