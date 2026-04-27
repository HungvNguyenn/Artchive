"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { TagInput } from "@/components/tag-input";
import { ArtContainer, CreateAssetInput } from "@/lib/types";
import { readFileAsDataUrl } from "@/lib/utils";

type DetailPanelProps = {
  container: ArtContainer | null;
  onSave: (container: ArtContainer) => void;
  onDelete: (containerId: string) => void;
  onAddAsset: (input: CreateAssetInput) => void | Promise<void>;
  mode?: "all" | "details" | "asset";
};

export function DetailPanel({
  container,
  onSave,
  onDelete,
  onAddAsset,
  mode = "all"
}: DetailPanelProps) {
  const [draft, setDraft] = useState<ArtContainer | null>(container);
  const [assetTitle, setAssetTitle] = useState("");
  const [assetType, setAssetType] = useState<CreateAssetInput["type"]>("reference");
  const [assetNote, setAssetNote] = useState("");
  const [assetImage, setAssetImage] = useState<string | undefined>(undefined);
  const [assetFeedback, setAssetFeedback] = useState("");
  const [detailsFeedback, setDetailsFeedback] = useState("");
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const previousContainerId = useRef<string | null>(container?.id ?? null);
  const [previewDrag, setPreviewDrag] = useState<{
    pointerId: number;
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
  } | null>(null);

  const previewImage = useMemo(() => {
    if (!draft) {
      return null;
    }
    return (
      draft.assets.find((asset) => asset.isPrimary && asset.imageUrl)?.imageUrl ||
      draft.assets.find((asset) => asset.imageUrl)?.imageUrl ||
      null
    );
  }, [draft]);

  useEffect(() => {
    const containerChanged = previousContainerId.current !== (container?.id ?? null);
    setDraft(container);
    setAssetTitle("");
    setAssetType("reference");
    setAssetNote("");
    setAssetImage(undefined);
    if (containerChanged) {
      setDetailsFeedback("");
      setAssetFeedback("");
    }
    setIsAddingAsset(false);
    setIsSavingDetails(false);
    setPreviewDrag(null);
    previousContainerId.current = container?.id ?? null;
  }, [container]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    setAssetImage(dataUrl);
  }

  async function handleSaveDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) {
      return;
    }
    setIsSavingDetails(true);
    setDetailsFeedback("");

    try {
      await onSave({
        ...draft,
        tags: Array.from(new Set(draft.tags.map((tag) => tag.trim()).filter(Boolean)))
      });
      setDetailsFeedback("Changes saved.");
    } catch (error) {
      setDetailsFeedback(error instanceof Error ? error.message : "Could not save board details.");
    } finally {
      setIsSavingDetails(false);
    }
  }

  async function handleAddAsset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!container || !assetTitle.trim()) {
      return;
    }
    setIsAddingAsset(true);
    setAssetFeedback("");

    try {
      await onAddAsset({
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
      setAssetFeedback(
        assetType === "note" ? "Note added to corkboard." : "Image added to corkboard."
      );
    } catch (error) {
      setAssetFeedback(error instanceof Error ? error.message : "Could not add asset.");
    } finally {
      setIsAddingAsset(false);
    }
  }

  function handlePreviewPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!draft || !previewImage) {
      return;
    }

    if (event.button !== 0) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    setPreviewDrag({
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: draft.preview.offsetX,
      startOffsetY: draft.preview.offsetY
    });
  }

  function handlePreviewPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!draft || !previewDrag || previewDrag.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - previewDrag.startX;
    const deltaY = event.clientY - previewDrag.startY;

    setDraft((current) =>
      current
        ? {
            ...current,
            preview: {
              ...current.preview,
              offsetX: Math.max(-40, Math.min(40, previewDrag.startOffsetX + deltaX / 2.2)),
              offsetY: Math.max(-40, Math.min(40, previewDrag.startOffsetY + deltaY / 2.2))
            }
          }
        : current
    );
  }

  function handlePreviewPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (previewDrag?.pointerId === event.pointerId) {
      setPreviewDrag(null);
    }
  }

  if (!draft) {
    return (
      <section className="card">
        <div className="empty-state">
          <h3 className="card-title">No board selected</h3>
          <p className="helper">Select or create a board to manage its notes, tags, and assets.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="detail-grid">
      {mode !== "asset" ? (
        <form className="card form-grid" onSubmit={handleSaveDetails}>
          <div className="row-between">
            <div>
              <p className="eyebrow">Board details</p>
              <h3 className="card-title">Edit project</h3>
            </div>
            <div className="action-feedback">
              <button className="button" type="submit" disabled={isSavingDetails}>
                {isSavingDetails ? "Saving..." : "Save changes"}
              </button>
              {detailsFeedback ? <p className="helper asset-feedback">{detailsFeedback}</p> : null}
            </div>
          </div>
          <input
            className="input"
            value={draft.name}
            onChange={(event) =>
              setDraft((current) => (current ? { ...current, name: event.target.value } : current))
            }
            spellCheck={false}
          />
          <textarea
            className="textarea"
            value={draft.description}
            placeholder="Summary / description"
            onChange={(event) =>
              setDraft((current) =>
                current ? { ...current, description: event.target.value } : current
              )
            }
            spellCheck={false}
          />
          <div className="split">
            <input
              className="input"
              value={draft.medium}
              onChange={(event) =>
                setDraft((current) =>
                  current ? { ...current, medium: event.target.value } : current
                )
              }
              placeholder="Medium"
              spellCheck={false}
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
          <TagInput
            tags={draft.tags}
            placeholder="Type a tag and press Enter"
            onChange={(tags) =>
              setDraft((current) =>
                current
                  ? {
                      ...current,
                      tags
                    }
                  : current
              )
            }
          />
          <div className="preview-controls">
            <div>
              <p className="eyebrow">Preview image</p>
              <p className="helper">
                Drag the image to frame it, then use zoom or the sliders to fine-tune the crop.
              </p>
            </div>
            {previewImage ? (
              <div className="preview-editor">
                <div
                  className={`preview-stage ${previewDrag ? "dragging" : ""}`}
                  onPointerDown={handlePreviewPointerDown}
                  onPointerMove={handlePreviewPointerMove}
                  onPointerUp={handlePreviewPointerUp}
                  onPointerCancel={handlePreviewPointerUp}
                  onContextMenu={(event) => event.preventDefault()}
                >
                  <Image
                    alt={`${draft.name} preview`}
                    src={previewImage}
                    fill
                    unoptimized
                    draggable={false}
                    style={{
                      objectFit: "cover",
                      objectPosition: `${50 + draft.preview.offsetX}% ${50 + draft.preview.offsetY}%`,
                      transform: `scale(${draft.preview.scale})`
                    }}
                  />
                  <div className="preview-stage-frame" />
                </div>
                <div className="preview-mini-card">
                  <div className="preview-mini-thumb">
                    <Image
                      alt={`${draft.name} card preview`}
                      src={previewImage}
                      fill
                      unoptimized
                      draggable={false}
                      style={{
                        objectFit: "cover",
                        objectPosition: `${50 + draft.preview.offsetX}% ${50 + draft.preview.offsetY}%`,
                        transform: `scale(${draft.preview.scale})`
                      }}
                    />
                  </div>
                  <div className="preview-mini-meta">
                    <strong>{draft.name}</strong>
                    <span>{draft.medium || "Medium TBD"}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="preview-empty helper">
                Add an image to this board first, then you can frame its dashboard preview here.
              </div>
            )}
            <label className="slider-field">
              <span className="meta">Zoom</span>
              <input
                type="range"
                min="1"
                max="2.2"
                step="0.05"
                value={draft.preview.scale}
                onChange={(event) =>
                  setDraft((current) =>
                    current
                      ? {
                          ...current,
                          preview: {
                            ...current.preview,
                            scale: Number(event.target.value)
                          }
                        }
                      : current
                  )
                }
              />
            </label>
            <label className="slider-field">
              <span className="meta">Move left / right</span>
              <input
                type="range"
                min="-40"
                max="40"
                step="1"
                value={draft.preview.offsetX}
                onChange={(event) =>
                  setDraft((current) =>
                    current
                      ? {
                          ...current,
                          preview: {
                            ...current.preview,
                            offsetX: Number(event.target.value)
                          }
                        }
                      : current
                  )
                }
              />
            </label>
            <label className="slider-field">
              <span className="meta">Move up / down</span>
              <input
                type="range"
                min="-40"
                max="40"
                step="1"
                value={draft.preview.offsetY}
                onChange={(event) =>
                  setDraft((current) =>
                    current
                      ? {
                          ...current,
                          preview: {
                            ...current.preview,
                            offsetY: Number(event.target.value)
                          }
                        }
                      : current
                  )
                }
              />
            </label>
          </div>
          <button className="danger-button" type="button" onClick={() => onDelete(draft.id)}>
            Delete board
          </button>
        </form>
      ) : null}

      {mode !== "details" ? (
        <form className="card form-grid" onSubmit={handleAddAsset}>
          <div>
            <p className="eyebrow">Pin something new</p>
            <h3 className="card-title">Add notes, references, or supporting images</h3>
            <p className="helper">
              The primary sketch is created during setup. Use this section for references, notes, and
              later-stage artwork.
            </p>
          </div>
          <input
            className="input"
            placeholder="Asset title"
            value={assetTitle}
            onChange={(event) => setAssetTitle(event.target.value)}
            spellCheck={false}
            required
          />
          <select
            className="select"
            value={assetType}
            onChange={(event) => setAssetType(event.target.value as CreateAssetInput["type"])}
          >
            <option value="reference">Reference image</option>
            <option value="sketch">Additional sketch</option>
            <option value="final">Final artwork</option>
            <option value="note">Note</option>
          </select>
          {assetType === "note" ? (
            <textarea
              className="textarea"
              placeholder="Capture reasoning, palette choices, reminders, or assignment notes."
              value={assetNote}
              onChange={(event) => setAssetNote(event.target.value)}
              spellCheck={false}
            />
          ) : (
            <label className="upload-zone form-grid">
              <span className="section-title">Upload image</span>
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </label>
          )}
          {assetFeedback ? <p className="helper asset-feedback">{assetFeedback}</p> : null}
          <button className="button" type="submit" disabled={isAddingAsset}>
            {isAddingAsset ? "Adding..." : "Add to corkboard"}
          </button>
        </form>
      ) : null}
    </section>
  );
}
