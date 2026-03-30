import { useRef, useState } from "react";

import { EditorCanvas } from "./components/EditorCanvas";
import { PreviewCanvas } from "./components/PreviewCanvas";
import { downloadBlob, exportImageBlob, importImageFile } from "./lib/image-io";
import {
  DEFAULT_IMAGE_SIZE,
  MAX_IMAGE_DIMENSION,
  createEmptyImage,
  normalizeDimension,
  toggleSubpixel,
} from "./lib/subpixel-image";

const primaryButtonClass =
  "inline-flex items-center justify-center rounded-full border border-white/14 bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:border-white hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-45";
const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-full border border-white/12 bg-white/6 px-4 py-2.5 text-sm font-medium text-white transition hover:border-white/24 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45";
const numberInputClass =
  "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-base text-white outline-none transition placeholder:text-white/25 focus:border-white/30 focus:bg-black/40";

function App() {
  const [image, setImage] = useState(() =>
    createEmptyImage(DEFAULT_IMAGE_SIZE, DEFAULT_IMAGE_SIZE),
  );
  const [imageName, setImageName] = useState("subpixel-16x16");
  const [widthInput, setWidthInput] = useState(String(DEFAULT_IMAGE_SIZE));
  const [heightInput, setHeightInput] = useState(String(DEFAULT_IMAGE_SIZE));
  const [status, setStatus] = useState("Created a new 16 x 16 image.");
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleCreateImage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const width = normalizeDimension(Number.parseInt(widthInput, 10));
    const height = normalizeDimension(Number.parseInt(heightInput, 10));

    setImage(createEmptyImage(width, height));
    setWidthInput(String(width));
    setHeightInput(String(height));
    setImageName(`subpixel-${width}x${height}`);
    setStatus(`Created a new ${width} x ${height} black image.`);
  }

  async function handleImport(
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsImporting(true);

    try {
      const importedImage = await importImageFile(file);
      const baseName = file.name.replace(/\.[^/.]+$/, "") || "imported-image";

      setImage(importedImage);
      setWidthInput(String(importedImage.width));
      setHeightInput(String(importedImage.height));
      setImageName(`${baseName}-subpixel`);
      setStatus(
        `Imported ${file.name} and thresholded each non-zero RGB channel to 255.`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to import that file.";
      setStatus(message);
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  }

  async function handleExport(): Promise<void> {
    setIsExporting(true);

    try {
      const blob = await exportImageBlob(image);
      downloadBlob(blob, `${imageName}.png`);
      setStatus(
        `Exported ${imageName}.png at ${image.width} x ${image.height}.`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to export this image.";
      setStatus(message);
    } finally {
      setIsExporting(false);
    }
  }

  function handleToggle(x: number, y: number, channel: 0 | 1 | 2) {
    setImage((currentImage) => toggleSubpixel(currentImage, x, y, channel));
  }

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[1480px] flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-8">
        {/* Can reintroduce header when this'd have more features */}
        {/* <header className="overflow-hidden rounded-4xl border border-(--page-edge) bg-(--panel) p-6 shadow-(--shadow) backdrop-blur-xl sm:p-8">
          <h1 className="text-4xl font-bold tracking-[-0.05em] text-white sm:text-5xl">
            Subpixel Editor
          </h1>
          <p className="mt-4 text-base leading-7 text-(--ink-soft) sm:text-lg">
            Edit Red, Green, and Blue channels separately.
          </p>
        </header> */}

        <section className="grid gap-6 md:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <section className="rounded-4xl border border-(--page-edge) bg-(--panel-strong) p-4 shadow-(--shadow) backdrop-blur-xl sm:p-5">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-[-0.04em] text-white">
                    Subpixel Editor
                  </h2>
                  <p className="text-sm leading-6 text-(--ink-soft)">
                    Click any cell to toggle that channel value between 0 and
                    255.
                  </p>
                </div>
              </div>

              <div className="overflow-auto rounded-3xl border border-white/8 bg-[#02040a] p-3 sm:p-4">
                <EditorCanvas image={image} onToggle={handleToggle} />
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-4xl border border-(--page-edge) bg-(--panel) p-5 shadow-(--shadow) backdrop-blur-xl sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold tracking-[-0.04em] text-white">
                    Live preview
                  </h2>
                </div>
                <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 font-['IBM_Plex_Mono'] text-xs text-(--ink-soft)">
                  {image.width} x {image.height}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-center">
                <PreviewCanvas image={image} />
              </div>
            </section>

            <section className="rounded-4xl border border-(--page-edge) bg-(--panel) p-5 shadow-(--shadow) backdrop-blur-xl sm:p-6">
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-white">
                Controls
              </h2>
              <div className="mt-3 flex flex-col gap-3">
                <form
                  className="flex flex-col gap-3"
                  onSubmit={handleCreateImage}
                >
                  <button className={primaryButtonClass} type="submit">
                    New black image
                  </button>
                  <label className="ml-[20%] flex items-center gap-2 text-sm text-(--ink-soft)">
                    Width
                    <input
                      className={numberInputClass}
                      inputMode="numeric"
                      max={MAX_IMAGE_DIMENSION}
                      min={1}
                      type="number"
                      value={widthInput}
                      onChange={(event) => setWidthInput(event.target.value)}
                    />
                  </label>
                  <label className="ml-[20%] flex items-center gap-2 text-sm text-(--ink-soft)">
                    Height
                    <input
                      className={numberInputClass}
                      inputMode="numeric"
                      max={MAX_IMAGE_DIMENSION}
                      min={1}
                      type="number"
                      value={heightInput}
                      onChange={(event) => setHeightInput(event.target.value)}
                    />
                  </label>
                </form>
                <button
                  className={secondaryButtonClass}
                  disabled={isImporting}
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isImporting ? "Importing..." : "Upload image"}
                </button>
                <button
                  className={secondaryButtonClass}
                  disabled={isExporting}
                  type="button"
                  onClick={handleExport}
                >
                  {isExporting ? "Exporting..." : "Download PNG"}
                </button>
              </div>
            </section>

            <section className="rounded-4xl border border-(--page-edge) bg-(--panel) p-5 shadow-(--shadow) backdrop-blur-xl sm:p-6">
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-white">
                Status
              </h2>
              <p className="mt-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm leading-6 text-(--ink-soft)">
                {status}
              </p>
            </section>
          </aside>
        </section>
      </div>

      <input
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        type="file"
        onChange={handleImport}
      />
    </div>
  );
}

export default App;
