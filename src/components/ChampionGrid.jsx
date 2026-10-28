import { useState } from "react";
import Icon from "./Icon";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "written", label: "Written" },
  { key: "todo", label: "Not written" },
];

export default function ChampionGrid({ champions, written, onSelect }) {
  const [filter, setFilter] = useState("all");
  const count = champions.filter((c) => written.has(c.id)).length;

  const shown = champions.filter((c) => {
    if (filter === "written") return written.has(c.id);
    if (filter === "todo") return !written.has(c.id);
    return true;
  });

  return (
    <section className="home">
      <div className="home-head">
        <div>
          <h1>Volibear matchups</h1>
          <p className="muted">
            <strong className="accent">{count}</strong> / {champions.length} guides written
          </p>
        </div>
        <div className="segmented">
          {FILTERS.map((f) => (
            <button key={f.key} className={filter === f.key ? "on" : ""} onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 && <p className="empty-note">Nothing here yet.</p>}

      <div className="champ-grid">
        {shown.map((c) => (
          <button key={c.id} className="champ-tile" onClick={() => onSelect(c.id)}>
            <Icon src={c.icon} alt={c.name} />
            <span className="champ-name">{c.name}</span>
            {written.has(c.id) && <span className="written-dot" title="Guide written" />}
          </button>
        ))}
      </div>
    </section>
  );
}

ChampionGrid.Skeleton = function Skeleton() {
  return (
    <section className="home">
      <div className="home-head">
        <div>
          <div className="skeleton" style={{ width: 260, height: 32 }} />
          <div className="skeleton" style={{ width: 160, height: 16, marginTop: 10 }} />
        </div>
      </div>
      <div className="champ-grid">
        {Array.from({ length: 40 }, (_, i) => (
          <div key={i} className="champ-tile">
            <div className="skeleton" style={{ width: 64, height: 64 }} />
            <div className="skeleton" style={{ width: 50, height: 10 }} />
          </div>
        ))}
      </div>
    </section>
  );
};
