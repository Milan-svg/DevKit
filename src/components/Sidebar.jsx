export default function Sidebar({ tools, active, onSelect }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">Dv</div>
        <div>
          <div className="brand-name">Devkit</div>
          <div className="brand-sub">Daily developer utilities</div>
        </div>
      </div>

      <div className="section-label">Tools</div>
      <nav className="nav">
        {tools.map((t, i) => {
          const Icon = t.Icon;
          return (
            <button
              key={t.id}
              className={"nav-item" + (active === t.id ? " active" : "")}
              onClick={() => onSelect(t.id)}
            >
              <Icon className="nav-icon" />
              <span>{t.name}</span>
              <span className="nav-shortcut">⌘{i + 1}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
