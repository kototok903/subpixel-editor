import { useEffect, useRef } from "react";

import { toImageData, type SubpixelImageDocument } from "../lib/subpixel-image";

interface PreviewCanvasProps {
  image: SubpixelImageDocument;
}

export function PreviewCanvas({ image }: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewScale = Math.min(
    16,
    Math.max(4, Math.floor(240 / Math.max(image.width, image.height))),
  );

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    canvas.width = image.width;
    canvas.height = image.height;
    context.clearRect(0, 0, image.width, image.height);
    context.putImageData(toImageData(image), 0, 0);
  }, [image]);

  return (
    <canvas
      ref={canvasRef}
      aria-label="Live image preview"
      className="border border-white/12 bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
      style={{
        width: `${image.width * previewScale}px`,
        height: `${image.height * previewScale}px`,
        imageRendering: "pixelated",
      }}
    />
  );
}
