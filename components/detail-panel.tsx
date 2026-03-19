"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { ArtContainer, CreateAssetInput } from "@/lib/types";
import { normalizeTags, readFileAsDataUrl } from "@/lib/utils";

type DetailPanelProps = {
  container: ArtContainer | null;
  onSave: (container: ArtContainer) => void;
  onDelete: (containerId: string) => void;
  onAddAsset: (input: CreateAssetInput) => void;
};

export function DetailPanel({ container, onSave, onDelete, onAddAsset }: DetailPanelProps) {
  const [draft, setDraft] = useState<ArtContainer | null>(container);
  const [assetTitle, setAssetTitle] = useState("");
  const [assetType, setAssetType] = useState<CreateAssetInput["type"]>("reference");
  const [assetNote, setAssetNote] = useState("");
  const [assetImage, setAssetImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    setDraft(container);
    setAssetTitle("");
    setAssetType("reference");
    setAssetNote("");
    setAssetImage(undefined);
  }, [container]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    setAssetImage(dataUrl);
  }

  function handleSaveDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) {
      return;
    }
    onSave({
      ...draft,
      tags: Array.from(new Set(draft.tags.map((tag) => tag.trim()).filter(Boolean)))
    });
  }

  function handleAddAsset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!container || !assetTitle.trim()) {
      return;
    }
    onAddAsset({
      containerId: container.id,
      title: assetTitle.trim(),
      type: assetType,
      note: assetType === "note" ? assetNote.trim() : undefined,
      imageUrl: assetType === "note" ? undefined : assetImage
    });
    setAssetTitle("");
    setAssetType("reference");
    setAssetNote("");
    setAssetImage(undefined);
  }

  if (!draft) {
    return (
      <section className="card">
        <div className="empty-state">
          <h3 className="card-title">No container selected</h3>
          <p className="helper">Select or create a container to manage its notes, tags, and assets.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="detail-grid">
      <form className="card form-grid" onSubmit={handleSaveDetails}>
        <div className="row-between">
          <div>
            <p className="eyebrow">Container details</p>
            <h3 className="card-title">Edit project metadata</h3>
          </div>
          <button className="button" type="submit">
            Save changes
          </button>
        </div>
        <input
          className="input"
          value={draft.name}
          onChange={(event) =>
            setDraft((current) => (current ? { ...current, name: event.target.value } : current))
          }
        />
        <textarea
          className="textarea"
          value={draft.description}
          onChange={(event) =>
            setDraft((current) =>
              current ? { ...current, description: event.target.value } : current
            )
          }
        />
        <div className="split">
          <input
            className="input"
            value={draft.medium}
            onChange={(event) =>
              setDraft((current) => (current ? { ...current, medium: event.target.value } : current))
            }
            placeholder="Medium"
          />
          <select
            className="select"
            value={draft.status}
            onChange={(event) =>
              setDraft((current) =>
                current
                  ? {
                      ...current,
                      status: event.target.value as ArtContainer["status"]
                    }
                  : current
              )
            }
          >
            <option value="Unfinished">Unfinished</option>
            <option value="Finished">Finished</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
        <input
          className="input"
          value={draft.tags.join(", ")}
          onChange={(event) =>
            setDraft((current) =>
              current
                ? {
                    ...current,
                    tags: normalizeTags(event.target.value)
                  }
                : current
            )
          }
          placeholder="Tags"
        />
        <button className="danger-button" type="button" onClick={() => onDelete(draft.id)}>
          Delete container
        </button>
      </form>

      <form className="card form-grid" onSubmit={handleAddAsset}>
        <div>
          <p className="eyebrow">Pin something new</p>
          <h3 className="card-title">Add note or image asset</h3>
        </div>
        <input
          className="input"
          placeholder="Asset title"
          value={assetTitle}
          onChange={(event) => setAssetTitle(event.target.value)}
          required
        />
        <select
          className="select"
          value={assetType}
          onChange={(event) => setAssetType(event.target.value as CreateAssetInput["type"])}
        >
          <option value="reference">Reference image</option>
          <option value="sketch">Sketch</option>
          <option value="final">Final artwork</option>
          <option value="note">Note</option>
        </select>
        {assetType === "note" ? (
          <textarea
            className="textarea"
            placeholder="Capture reasoning, palette choices, reminders, or assignment notes."
            value={assetNote}
            onChange={(event) => setAssetNote(event.target.value)}
          />
        ) : (
          <label className="upload-zone form-grid">
            <span className="section-title">Upload image</span>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <p className="helper tiny">Images are stored locally in this MVP and can later move to Supabase Storage.</p>
          </label>
        )}
        <button className="button" type="submit">
          Add to corkboard
        </button>
      </form>
    </section>
  );
}
