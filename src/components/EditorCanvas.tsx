import { useEffect, useRef } from "react";

import {
  getEditorMetrics,
  hitTestEditorPoint,
  renderEditorCanvas,
} from "../lib/canvas-renderer";
import type {
  ChannelIndex,
  SubpixelImageDocument,
} from "../lib/subpixel-image";

interface EditorCanvasProps {
  image: SubpixelImageDocument;
  onToggle: (x: number, y: number, channel: ChannelIndex) => void;
}

export function EditorCanvas({ image, onToggle }: EditorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const metrics = getEditorMetrics(image);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const nextMetrics = getEditorMetrics(image);
    const devicePixelRatio = window.devicePixelRatio || 1;
    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    canvas.width = Math.floor(nextMetrics.width * devicePixelRatio);
    canvas.height = Math.floor(nextMetrics.height * devicePixelRatio);
    canvas.style.width = `${nextMetrics.width}px`;
    canvas.style.height = `${nextMetrics.height}px`;

    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    context.imageSmoothingEnabled = false;

    renderEditorCanvas(context, image, nextMetrics);
  }, [image]);

  function handleClick(event: React.MouseEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * metrics.width;
    const y = ((event.clientY - rect.top) / rect.height) * metrics.height;
    const hit = hitTestEditorPoint(image, metrics, x, y);

    if (!hit) {
      return;
    }

    onToggle(hit.x, hit.y, hit.channel);
  }

  return (
    <canvas
      ref={canvasRef}
      aria-label="Subpixel editor grid"
      className="block cursor-crosshair shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
      onClick={handleClick}
    />
  );
}
