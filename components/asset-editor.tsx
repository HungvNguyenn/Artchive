"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Asset, AssetType } from "@/lib/types";
import { readFileAsDataUrl } from "@/lib/utils";

type AssetEditorProps = {
  asset: Asset | null;
  onSave: (input: { title: string; type: AssetType; note?: string; imageUrl?: string }) => void | Promise<void>;
  onDelete: () => void | Promise<void>;
};

export function AssetEditor({ asset, onSave, onDelete }: AssetEditorProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<AssetType>("reference");
  const [note, setNote] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!asset) {
      return;
    }
    setTitle(asset.title);
    setType(asset.type);
    setNote(asset.note ?? "");
    setImageUrl(undefined);
    setFeedback("");
    setIsSaving(false);
    setIsDownloading(false);
  }, [asset]);

  if (!asset) {
    return null;
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    setImageUrl(dataUrl);
  }

  async function handleDownload() {
    if (!asset?.imageUrl) {
      return;
    }

    try {
      setIsDownloading(true);
      const response = await fetch(asset.imageUrl);
      if (!response.ok) {
        throw new Error("Unable to download this image right now.");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const extension = blob.type.split("/")[1] || "png";
      link.href = objectUrl;
      link.download = `${(title || asset.title).trim() || "artchive-asset"}.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }

    setIsSaving(true);
    setFeedback("");

    try {
      await onSave({
        title: title.trim(),
        type,
        note: type === "note" ? note.trim() : note.trim() || undefined,
        imageUrl: type === "note" ? undefined : imageUrl
      });
      setFeedback("Board item updated successfully.");
      setImageUrl(undefined);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="card form-grid" onSubmit={handleSubmit}>
      <div className="asset-editor-header">
        <div>
          <p className="eyebrow">Pinned asset</p>
          <h3 className="card-title">Edit this item</h3>
        </div>
        <div className="action-feedback">
          <div className="inline-actions">
          {asset.imageUrl ? (
            <button className="ghost-button" type="button" onClick={() => void handleDownload()}>
              {isDownloading ? "Downloading..." : "Download image"}
            </button>
          ) : null}
          <button className="button" type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save changes"}
          </button>
          </div>
          {feedback ? <p className="helper asset-feedback">{feedback}</p> : null}
        </div>
      </div>
      <input
        className="input"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Asset title"
        spellCheck={false}
      />
      <select
        className="select"
        value={type}
        onChange={(event) => setType(event.target.value as AssetType)}
        disabled={asset.isPrimary}
      >
        <option value="reference">Reference image</option>
        <option value="sketch">Sketch</option>
        <option value="final">Final artwork</option>
        <option value="note">Note</option>
      </select>
      {type === "note" || asset.note ? (
        <textarea
          className="textarea"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Add note text"
          spellCheck={false}
        />
      ) : null}
      {type !== "note" ? (
        <label className="upload-zone form-grid">
          <span className="section-title">Replace image</span>
          {imageUrl || asset.imageUrl ? (
            <div className="asset-editor-preview">
              <Image
                alt={`${title || asset.title} preview`}
                src={imageUrl || asset.imageUrl || ""}
                width={240}
                height={180}
                unoptimized
              />
            </div>
          ) : null}
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <p className="helper tiny">Upload a new file only if you want to replace the current image.</p>
        </label>
      ) : null}
      {asset.isPrimary ? (
        <p className="helper">
          The primary sketch can be renamed here, but deletion is disabled so each board keeps
          its anchor image.
        </p>
      ) : (
        <button className="danger-button" type="button" onClick={() => void onDelete()}>
          Delete asset
        </button>
      )}
    </form>
  );
}
