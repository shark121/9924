"use client";

import { useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export default function ImageManager({
  initial,
}: {
  initial: string[];
}) {
  const [images, setImages] = useState<string[]>(initial);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function remove(i: number) {
    setImages((imgs) => imgs.filter((_, idx) => idx !== i));
  }

  function move(i: number, dir: -1 | 1) {
    setImages((imgs) => {
      const next = [...imgs];
      const j = i + dir;
      if (j < 0 || j >= next.length) return imgs;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function addUrl() {
    const u = url.trim();
    if (!u) return;
    setImages((imgs) => [...imgs, u]);
    setUrl("");
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/admin/products/upload", {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
        setImages((imgs) => [...imgs, data.url as string]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Hidden field consumed by the product server action (newline-separated). */}
      <input type="hidden" name="images" value={images.join("\n")} />

      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="group relative aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50"
            >
              {/* Plain <img> so any host works in the admin preview without
                  next/image remotePatterns config. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Image ${i + 1}`}
                className="h-full w-full object-contain mix-blend-multiply"
              />
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded bg-neutral-900/80 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-white">
                  Primary
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 transition group-hover:opacity-100">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="rounded bg-white/90 px-1.5 text-xs text-neutral-700 disabled:opacity-30"
                    title="Move left"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === images.length - 1}
                    className="rounded bg-white/90 px-1.5 text-xs text-neutral-700 disabled:opacity-30"
                    title="Move right"
                  >
                    →
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="rounded bg-red-600 p-1 text-white hover:bg-red-700"
                  title="Remove image"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-400">
          No images yet. Upload or add a URL below.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => onFiles(e.target.files)}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={busy}
          className="flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
        >
          <Plus size={15} /> {busy ? "Uploading…" : "Upload images"}
        </button>

        <div className="flex items-center gap-1">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addUrl();
              }
            }}
            placeholder="…or paste an image URL"
            className="w-56 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
          <button
            type="button"
            onClick={addUrl}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            Add
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
