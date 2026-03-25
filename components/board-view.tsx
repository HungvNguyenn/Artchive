"use client";

import Image from "next/image";
import { PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArtContainer } from "@/lib/types";
import { assetLabel, sortAssets } from "@/lib/utils";

type BoardViewProps = {
  container: ArtContainer | null;
  onMoveAsset: (assetId: string, x: number, y: number) => void;
  onResizeAsset: (assetId: string, displayWidth: number) => void;
  onSelectAsset: (assetId: string) => void;
};

type DragState = {
  assetId: string;
  pointerId: number;
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

type SizeMap = Record<string, number>;

type ResizeState = {
  assetId: string;
  pointerId: number;
  startX: number;
  startWidth: number;
} | null;

export function BoardView({ container, onMoveAsset, onResizeAsset, onSelectAsset }: BoardViewProps) {
  const [dragState, setDragState] = useState<DragState>(null);
  const [positions, setPositions] = useState<PositionMap>({});
  const [sizes, setSizes] = useState<SizeMap>({});
  const [resizeState, setResizeState] = useState<ResizeState>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);

  const sortedAssets = useMemo(() => (container ? sortAssets(container.assets) : []), [container]);

  useEffect(() => {
    const nextPositions: PositionMap = {};
    const nextSizes: SizeMap = {};
    for (const asset of sortedAssets) {
      nextPositions[asset.id] = {
        x: asset.position.x,
        y: asset.position.y
      };
      nextSizes[asset.id] = asset.displayWidth;
    }
    setPositions(nextPositions);
    setSizes(nextSizes);
    setDragState(null);
    setResizeState(null);
  }, [sortedAssets]);

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

    if (event.button !== 0) {
      return;
    }

    event.stopPropagation();
    event.preventDefault();

    const cardRect = event.currentTarget.getBoundingClientRect();
    const rect = board.getBoundingClientRect();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragState({
      assetId,
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left - x,
      offsetY: event.clientY - rect.top - y,
      width: cardRect.width,
      height: cardRect.height
    });
  }

  function handleResizePointerDown(
    event: PointerEvent<HTMLButtonElement>,
    assetId: string,
    startWidth: number
  ) {
    const board = boardRef.current;
    if (!board) {
      return;
    }

    if (event.button !== 0) {
      return;
    }

    event.stopPropagation();
    event.preventDefault();
    board.setPointerCapture(event.pointerId);
    setResizeState({
      assetId,
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth
    });
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    if (resizeState && event.pointerId === resizeState.pointerId && container) {
      const asset = container.assets.find((item) => item.id === resizeState.assetId);
      if (!asset) {
        return;
      }

      const currentX = positions[asset.id]?.x ?? asset.position.x;
      const minWidth = asset.isPrimary ? 280 : 160;
      const maxWidth = Math.max(minWidth, rect.width - currentX - 12);
      const nextWidth = Math.max(
        minWidth,
        Math.min(maxWidth, Math.round(resizeState.startWidth + (event.clientX - resizeState.startX)))
      );

      setSizes((current) => ({
        ...current,
        [asset.id]: nextWidth
      }));
      return;
    }

    if (!dragState || event.pointerId !== dragState.pointerId) {
      return;
    }

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

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (resizeState && event.pointerId === resizeState.pointerId) {
      const nextWidth = sizes[resizeState.assetId];
      if (typeof nextWidth === "number") {
        void onResizeAsset(resizeState.assetId, nextWidth);
      }
      setResizeState(null);
      return;
    }

    if (!dragState) {
      return;
    }

    if (event.pointerId !== dragState.pointerId) {
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
            <h3 className="card-title">{container?.name ?? "Select a board to open"}</h3>
            <p className="helper">Click and drag to move an item. Drag the bottom-right corner to resize images. Double-click any item to edit it.</p>
          </div>
          {container ? <div className="tag">{container.assets.length} assets</div> : null}
        </div>
      </div>
      <div
        className={`board-surface ${dragState || resizeState ? "drag-armed" : ""}`}
        ref={boardRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {!container ? (
          <div className="board-empty">
            <h4 className="card-title">Your corkboard will appear here</h4>
            <p className="helper">
              Pick a board on the left, then pin notes, references, sketches, or final pieces.
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
                className={`asset-card ${asset.isPrimary ? "primary" : ""} ${asset.type === "note" ? "note-card" : ""} ${
                  dragState?.assetId === asset.id ? "active-drag" : ""
                }`}
                onPointerDown={(event) =>
                  handlePointerDown(
                    event,
                    asset.id,
                    positions[asset.id]?.x ?? asset.position.x,
                    positions[asset.id]?.y ?? asset.position.y
                  )
                }
                onDoubleClick={(event) => {
                  event.stopPropagation();
                  onSelectAsset(asset.id);
                }}
                style={{
                  left: positions[asset.id]?.x ?? asset.position.x,
                  top: positions[asset.id]?.y ?? asset.position.y,
                  width: sizes[asset.id] ?? asset.displayWidth,
                  zIndex: dragState?.assetId === asset.id ? sortedAssets.length + 2 : index + 1
                }}
              >
                <span
                  className={`pin ${asset.isPrimary ? "gold" : index % 2 === 0 ? "red" : "blue"}`}
                />
                {asset.imageUrl ? (
                  <>
                    <Image
                      alt={asset.title}
                      src={asset.imageUrl}
                      width={asset.isPrimary ? 680 : 400}
                      height={asset.isPrimary ? 460 : 280}
                      unoptimized={asset.imageUrl.startsWith("data:")}
                    />
                    <button
                      aria-label={`Resize ${asset.title}`}
                      className="asset-resize-handle"
                      type="button"
                      onPointerDown={(event) =>
                        handleResizePointerDown(
                          event,
                          asset.id,
                          sizes[asset.id] ?? asset.displayWidth
                        )
                      }
                    />
                  </>
                ) : null}
                <h4 className="asset-title">{asset.title}</h4>
                <p className="asset-meta">
                  {asset.isPrimary ? "Primary sketch" : assetLabel(asset.type)}
                </p>
                {asset.note ? <p className="asset-note">{asset.note}</p> : null}
              </div>
            ))
          : null}
      </div>
    </section>
  );
}
