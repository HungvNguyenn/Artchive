"use client";

import Image from "next/image";
import { MouseEvent, PointerEvent, useEffect, useMemo, useState } from "react";
import { ArtContainer } from "@/lib/types";
import { assetLabel, sortAssets } from "@/lib/utils";

type BoardViewProps = {
  container: ArtContainer | null;
  onMoveAsset: (assetId: string, x: number, y: number) => void;
  onSelectAsset: (assetId: string) => void;
};

type DragState = {
  assetId: string;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
} | null;

type PositionMap = Record<
  string,
  {
    x: number;
    y: number;
  }
>;

export function BoardView({ container, onMoveAsset, onSelectAsset }: BoardViewProps) {
  const [dragState, setDragState] = useState<DragState>(null);
  const [positions, setPositions] = useState<PositionMap>({});

  const sortedAssets = useMemo(() => (container ? sortAssets(container.assets) : []), [container]);

  useEffect(() => {
    const nextPositions: PositionMap = {};
    for (const asset of sortedAssets) {
      nextPositions[asset.id] = {
        x: asset.position.x,
        y: asset.position.y
      };
    }
    setPositions(nextPositions);
    setDragState(null);
  }, [sortedAssets]);

  function handleAssetClick(
    event: MouseEvent<HTMLDivElement>,
    assetId: string,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    const board = event.currentTarget.parentElement;
    if (!board) {
      return;
    }
    event.stopPropagation();

    if (dragState?.assetId === assetId) {
      void onMoveAsset(assetId, positions[assetId]?.x ?? x, positions[assetId]?.y ?? y);
      setDragState(null);
      return;
    }

    const rect = board.getBoundingClientRect();
    setDragState({
      assetId,
      offsetX: event.clientX - rect.left - x,
      offsetY: event.clientY - rect.top - y,
      width,
      height
    });
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragState) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(
      8,
      Math.min(rect.width - dragState.width - 8, event.clientX - rect.left - dragState.offsetX)
    );
    const y = Math.max(
      8,
      Math.min(rect.height - dragState.height - 8, event.clientY - rect.top - dragState.offsetY)
    );

    setPositions((current) => ({
      ...current,
      [dragState.assetId]: {
        x: Math.round(x),
        y: Math.round(y)
      }
    }));
  }

  function handleBoardClick() {
    if (!dragState) {
      return;
    }

    const nextPosition = positions[dragState.assetId];
    void onMoveAsset(dragState.assetId, nextPosition.x, nextPosition.y);
    setDragState(null);
  }

  return (
    <section className="card board-card">
      <div className="board-header">
        <p className="eyebrow">Corkboard</p>
        <div className="row-between">
          <div>
            <h3 className="card-title">{container?.name ?? "Select a container to open its board"}</h3>
            <p className="helper">Click an item to move it, then click again to place it.</p>
          </div>
          {container ? <div className="tag">{container.assets.length} assets</div> : null}
        </div>
      </div>
      <div
        className={`board-surface ${dragState ? "drag-armed" : ""}`}
        onPointerMove={handlePointerMove}
        onClick={handleBoardClick}
      >
        {!container ? (
          <div className="board-empty">
            <h4 className="card-title">Your corkboard will appear here</h4>
            <p className="helper">
              Pick a container on the left, then pin notes, references, sketches, or final pieces.
            </p>
          </div>
        ) : null}

        {container && container.assets.length === 0 ? (
          <div className="board-empty">
            <h4 className="card-title">Start pinning assets</h4>
            <p className="helper">
              Add an image upload or note below to populate this board.
            </p>
          </div>
        ) : null}

        {container
          ? sortedAssets.map((asset, index) => (
              <div
                key={asset.id}
                className={`asset-card ${asset.isPrimary ? "primary" : ""} ${
                  dragState?.assetId === asset.id ? "active-drag" : ""
                }`}
                onClick={(event) =>
                  handleAssetClick(
                    event,
                    asset.id,
                    positions[asset.id]?.x ?? asset.position.x,
                    positions[asset.id]?.y ?? asset.position.y,
                    asset.isPrimary ? 420 : 220,
                    asset.isPrimary ? 560 : 236
                  )
                }
                style={{
                  left: positions[asset.id]?.x ?? asset.position.x,
                  top: positions[asset.id]?.y ?? asset.position.y,
                  transform: `rotate(${asset.position.rotation}deg)`,
                  zIndex: dragState?.assetId === asset.id ? sortedAssets.length + 2 : index + 1
                }}
              >
                <span
                  className={`pin ${asset.isPrimary ? "gold" : index % 2 === 0 ? "red" : "blue"}`}
                />
                <button
                  className="asset-edit-button"
                  type="button"
                  onPointerDown={(event) => {
                    event.stopPropagation();
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelectAsset(asset.id);
                  }}
                >
                  Edit
                </button>
                {asset.imageUrl ? (
                  <Image
                    alt={asset.title}
                    src={asset.imageUrl}
                    width={asset.isPrimary ? 680 : 400}
                    height={asset.isPrimary ? 460 : 280}
                    unoptimized={asset.imageUrl.startsWith("data:")}
                  />
                ) : null}
                <h4 className="asset-title">{asset.title}</h4>
                {asset.note ? <p className="asset-note">{asset.note}</p> : null}
                <p className="asset-meta">
                  {asset.isPrimary ? "Primary sketch" : assetLabel(asset.type)}
                </p>
              </div>
            ))
          : null}
      </div>
    </section>
  );
}
