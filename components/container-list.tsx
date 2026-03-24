import Image from "next/image";
import { ArtContainer } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type ContainerListProps = {
  containers: ArtContainer[];
  selectedContainerId: string | null;
  onSelect: (containerId: string) => void;
};

function getPreviewImage(container: ArtContainer) {
  return (
    container.assets.find((asset) => asset.isPrimary && asset.imageUrl)?.imageUrl ||
    container.assets.find((asset) => asset.imageUrl)?.imageUrl ||
    null
  );
}

export function ContainerList({
  containers,
  selectedContainerId,
  onSelect
}: ContainerListProps) {
  return (
    <section className="card">
      <div className="row-between">
        <div>
          <p className="eyebrow">Library</p>
          <h3 className="card-title">Your containers</h3>
        </div>
        <p className="helper">{containers.length} visible</p>
      </div>
      <div className="container-list" style={{ marginTop: 16 }}>
        {containers.length === 0 ? (
          <div className="empty-state">
            <h4 className="card-title">No matching containers</h4>
            <p className="helper">Try a different search or start a new artwork container.</p>
          </div>
        ) : null}
        {containers.map((container) => {
          const previewImage = getPreviewImage(container);

          return (
            <button
              key={container.id}
              type="button"
              className={`container-item ${selectedContainerId === container.id ? "active" : ""}`}
              onClick={() => onSelect(container.id)}
            >
              <div className="container-preview">
                {previewImage ? (
                  <Image
                    alt={container.name}
                    src={previewImage}
                    fill
                    unoptimized
                    style={{
                      objectFit: "cover",
                      objectPosition: `${50 + container.preview.offsetX}% ${50 + container.preview.offsetY}%`,
                      transform: `scale(${container.preview.scale}) rotate(${container.preview.rotation}deg)`
                    }}
                  />
                ) : (
                  <div className="container-preview-fallback">
                    <span>{container.name.slice(0, 1)}</span>
                  </div>
                )}
              </div>

              <div className="container-body">
                <div className="container-head">
                  <div>
                    <h4 className="container-name">{container.name}</h4>
                    <p className="meta">
                      {container.medium || "Medium TBD"} {"•"} {container.status}
                    </p>
                  </div>
                  <p className="meta">Updated {formatDate(container.updatedAt)}</p>
                </div>

                <p className="meta container-description">
                  {container.description || "No description yet."}
                </p>

                <div className="container-footer">
                  <div className="tag-row">
                    {container.tags.length === 0 ? <span className="tag">No tags</span> : null}
                    {container.tags.map((tag) => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="meta container-created">Created {formatDate(container.createdAt)}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
