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
  const unfinished = containers.filter((container) => container.status === "Unfinished").length;
  const finished = containers.filter((container) => container.status === "Finished").length;

  return (
    <aside className="sidebar panel">
      <div className="brand-mark">
        <div>
          <p className="eyebrow">Welcome</p>
          <h1 className="card-title">{session.user.name}</h1>
        </div>
      </div>

      <div className="section">
        <p className="section-title">Studio snapshot</p>
        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-value">{containers.length}</p>
            <p className="stat-label">Boards</p>
          </div>
          <div className="stat-card">
            <p className="stat-value">{finished}</p>
            <p className="stat-label">Finished</p>
          </div>
          <div className="stat-card">
            <p className="stat-value">{unfinished}</p>
            <p className="stat-label">In progress</p>
          </div>
        </div>
      </div>

      <div className="section">
        <p className="section-title">Navigate</p>
        <div className="nav-links">
          <Link className={`nav-link ${activeView === "dashboard" ? "active" : ""}`} href="/">
            Dashboard
          </Link>
          <Link
            className={`nav-link ${activeView === "create" ? "active" : ""}`}
            href="/containers/new"
          >
            New board
          </Link>
        </div>
      </div>

      <button className="ghost-button" type="button" onClick={onSignOut}>
        Sign out
      </button>
    </aside>
  );
}
