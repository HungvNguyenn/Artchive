"use client";

import Image from "next/image";
import { PointerEvent, useRef } from "react";
import { ArtContainer } from "@/lib/types";
import { assetLabel, sortAssets } from "@/lib/utils";

type BoardViewProps = {
  container: ArtContainer | null;
  onMoveAsset: (assetId: string, x: number, y: number) => void;
};

type DragState = {
  assetId: string;
  offsetX: number;
  offsetY: number;
} | null;

export function BoardView({ container, onMoveAsset }: BoardViewProps) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<DragState>(null);

  function handlePointerDown(
    event: PointerEvent<HTMLDivElement>,
    assetId: string,
    x: number,
    y: number
  ) {
    const board = boardRef.current;
    if (!board) {
      return;
    }
    const rect = board.getBoundingClientRect();
    dragState.current = {
      assetId,
      offsetX: event.clientX - rect.left - x,
      offsetY: event.clientY - rect.top - y
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const board = boardRef.current;
    const drag = dragState.current;
    if (!board || !drag) {
      return;
    }
    const rect = board.getBoundingClientRect();
    const x = Math.max(8, Math.min(rect.width - 236, event.clientX - rect.left - drag.offsetX));
    const y = Math.max(8, Math.min(rect.height - 236, event.clientY - rect.top - drag.offsetY));
    onMoveAsset(drag.assetId, Math.round(x), Math.round(y));
  }

  function handlePointerUp() {
    dragState.current = null;
  }

  return (
    <section className="card board-card">
      <div className="board-header">
        <p className="eyebrow">Corkboard</p>
        <div className="row-between">
          <div>
            <h3 className="card-title">{container?.name ?? "Select a container to open its board"}</h3>
            <p className="helper">
              Drag pinned items to arrange your creative context visually.
            </p>
          </div>
          {container ? <div className="tag">{container.assets.length} assets</div> : null}
        </div>
      </div>
      <div
        ref={boardRef}
        className="board-surface"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
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
          ? sortAssets(container.assets).map((asset, index) => (
              <div
                key={asset.id}
                className="asset-card"
                onPointerDown={(event) =>
                  handlePointerDown(event, asset.id, asset.position.x, asset.position.y)
                }
                style={{
                  left: asset.position.x,
                  top: asset.position.y,
                  transform: `rotate(${asset.position.rotation}deg)`,
                  zIndex: index + 1
                }}
              >
                <span className={`pin ${index % 2 === 0 ? "red" : "blue"}`} />
                {asset.imageUrl ? (
                  <Image
                    alt={asset.title}
                    src={asset.imageUrl}
                    width={400}
                    height={280}
                    unoptimized={asset.imageUrl.startsWith("data:")}
                  />
                ) : null}
                <h4 className="asset-title">{asset.title}</h4>
                {asset.note ? <p className="asset-note">{asset.note}</p> : null}
                <p className="asset-meta">{assetLabel(asset.type)}</p>
              </div>
            ))
          : null}
      </div>
    </section>
  );
}
