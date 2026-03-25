type SearchToolbarProps = {
  query: string;
  tagFilter: string;
  tags: string[];
  onQueryChange: (value: string) => void;
  onTagChange: (value: string) => void;
  actionLabel?: string;
  onAction?: () => void;
};

export function SearchToolbar({
  query,
  tagFilter,
  tags,
  onQueryChange,
  onTagChange,
  actionLabel,
  onAction
}: SearchToolbarProps) {
  return (
    <section className="panel hero-card">
      <div className="hero-top">
        <div className="hero-copy">
          <p className="eyebrow">Artist workspace</p>
          <h2 className="title">Artchive</h2>
        </div>
      </div>
      <div className="toolbar" style={{ marginTop: 22 }}>
        <input
          className="input"
          placeholder="Search boards, ideas, or mediums"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          spellCheck={false}
        />
        <select
          className="select"
          value={tagFilter}
          onChange={(event) => onTagChange(event.target.value)}
        >
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
        <button className="ghost-button" type="button" onClick={() => onTagChange("All")}>
          Reset filters
        </button>
      </div>
      {actionLabel && onAction ? (
        <div className="inline-actions" style={{ marginTop: 16 }}>
          <button className="button" type="button" onClick={onAction}>
            {actionLabel}
          </button>
        </div>
      ) : null}
    </section>
  );
}
