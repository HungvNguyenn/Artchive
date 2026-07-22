import Link from "next/link";
import { parsePaletteValue } from "@/lib/palette";
import { ArtContainer, Asset, Session } from "@/lib/types";

type SidebarProps = {
  containers: ArtContainer[];
  session: Session;
  onSignOut: () => void;
  activeView?: "dashboard" | "create" | "container";
  paletteAssets?: Asset[];
  onSelectAsset?: (assetId: string) => void;
};

export function Sidebar({
  containers,
  session,
  onSignOut,
  activeView = "dashboard",
  paletteAssets,
  onSelectAsset
}: SidebarProps) {
  const unfinished = containers.filter((container) => container.status === "Unfinished").length;
  const finished = containers.filter((container) => container.status === "Finished").length;
  const palettes = paletteAssets ?? [];

  return (
    <aside className="sidebar-stack">
      <div className="sidebar panel">
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
      </div>

      {palettes.length > 0 ? (
        <div className="palette-dashboard panel">
          <p className="section-title">Palette shelf</p>
          <div className="sidebar-palette-list">
            {palettes.map((asset) => {
              const palette = parsePaletteValue(asset.note);
              const content = (
                <>
                  <div className="palette-grid sidebar-palette-grid">
                    {palette.entries.map((entry) => (
                      <div
                        className="palette-swatch"
                        key={`${asset.id}-${entry.label}-${entry.color}`}
                        style={{ background: entry.color }}
                      >
                        <span>{entry.label}</span>
                      </div>
                    ))}
                  </div>
                  <h4 className="asset-title">{asset.title}</h4>
                </>
              );

              return onSelectAsset ? (
                <button
                  className="sidebar-palette-card"
                  key={asset.id}
                  type="button"
                  onClick={() => onSelectAsset(asset.id)}
                >
                  {content}
                </button>
              ) : (
                <div className="sidebar-palette-card" key={asset.id}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
