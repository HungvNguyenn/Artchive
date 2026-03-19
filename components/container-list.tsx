import { ArtContainer } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type ContainerListProps = {
  containers: ArtContainer[];
  selectedContainerId: string | null;
  onSelect: (containerId: string) => void;
};

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
        {containers.map((container) => (
          <button
            key={container.id}
            type="button"
            className={`container-item ${selectedContainerId === container.id ? "active" : ""}`}
            onClick={() => onSelect(container.id)}
          >
            <div className="container-head">
              <div>
                <h4 className="container-name">{container.name}</h4>
                <p className="meta">
                  {container.medium || "Medium TBD"} • {container.status}
                </p>
              </div>
              <p className="meta">{formatDate(container.updatedAt)}</p>
            </div>
            <p className="meta">{container.description || "No description yet."}</p>
            <div className="tag-row">
              {container.tags.length === 0 ? <span className="tag">No tags</span> : null}
              {container.tags.map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
