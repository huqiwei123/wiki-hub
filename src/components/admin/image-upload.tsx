"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

export function ImageUpload({ name, defaultValue }: { name: string; defaultValue?: string }) {
  const [preview, setPreview] = useState<string | null>(defaultValue ?? null);
  const [url, setUrl] = useState(defaultValue ?? "");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError("");
    setUploading(true);
    const fd = new FormData();
    fd.set("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }
      setUrl(data.url);
      setPreview(data.url);
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={url} />
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        className="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 p-6 transition-colors hover:border-muted-foreground/30 hover:bg-muted"
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Uploading...</span>
          </div>
        ) : preview ? (
          <div className="relative w-full">
            <img src={preview} alt="Cover preview" className="mx-auto max-h-48 rounded-lg object-contain" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setPreview(null); setUrl(""); }}
              className="absolute -right-1 -top-1 grid size-6 cursor-pointer place-items-center rounded-full bg-foreground text-background"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <ImagePlus className="size-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Click or drag image to upload</span>
            <span className="text-[10px] text-muted-foreground/60">JPG, PNG, WebP, GIF — max 5MB</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
