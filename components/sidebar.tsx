import Link from "next/link";
import { ArtContainer, Session } from "@/lib/types";

type SidebarProps = {
  containers: ArtContainer[];
  session: Session;
  onSignOut: () => void;
  activeView?: "dashboard" | "create" | "container";
};

export function Sidebar({
  containers,
  session,
  onSignOut,
  activeView = "dashboard"
}: SidebarProps) {
  const assets = containers.reduce((count, container) => count + container.assets.length, 0);
  const unfinished = containers.filter((container) => container.status === "Unfinished").length;

  return (
    <aside className="sidebar panel">
      <div className="brand-mark">
        <div className="brand-seal" />
        <div>
          <p className="eyebrow">Creative OS</p>
          <h1 className="card-title">Artchive</h1>
        </div>
      </div>

      <div className="section">
        <p className="subtitle">
          {session.user.name}, keep every project’s intent, references, and visual exploration in
          one place.
        </p>
      </div>

      <div className="section">
        <p className="section-title">Studio snapshot</p>
        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-value">{containers.length}</p>
            <p className="stat-label">Containers</p>
          </div>
          <div className="stat-card">
            <p className="stat-value">{assets}</p>
            <p className="stat-label">Pinned assets</p>
          </div>
          <div className="stat-card">
            <p className="stat-value">{unfinished}</p>
            <p className="stat-label">In progress</p>
          </div>
          <div className="stat-card">
            <p className="stat-value">
              {containers.length === 0 ? "0" : Math.round(assets / containers.length)}
            </p>
            <p className="stat-label">Avg per board</p>
          </div>
        </div>
      </div>

      <div className="section">
        <p className="section-title">MVP highlights</p>
        <p className="helper">Searchable containers, tags, notes, image uploads, and a draggable board.</p>
      </div>

      <div className="section">
        <p className="section-title">Navigate</p>
        <div className="nav-links">
          <Link className={`nav-link ${activeView === "dashboard" ? "active" : ""}`} href="/">
            Dashboard
          </Link>
          <Link className={`nav-link ${activeView === "create" ? "active" : ""}`} href="/containers/new">
            New container
          </Link>
        </div>
      </div>

      <button className="ghost-button" type="button" onClick={onSignOut}>
        Sign out
      </button>
    </aside>
  );
}
