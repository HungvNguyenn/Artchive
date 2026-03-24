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

  useEffect(() => {
    if (!asset) {
      return;
    }
    setTitle(asset.title);
    setType(asset.type);
    setNote(asset.note ?? "");
    setImageUrl(undefined);
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }

    void onSave({
      title: title.trim(),
      type,
      note: type === "note" ? note.trim() : note.trim() || undefined,
      imageUrl: type === "note" ? undefined : imageUrl
    });
  }

  return (
    <form className="card form-grid" onSubmit={handleSubmit}>
      <div className="row-between">
        <div>
          <p className="eyebrow">Pinned asset</p>
          <h3 className="card-title">Edit this item</h3>
        </div>
        <button className="button" type="submit">
          Save changes
        </button>
      </div>
      <input
        className="input"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Asset title"
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
          The primary sketch can be renamed here, but deletion is disabled so each container keeps
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
