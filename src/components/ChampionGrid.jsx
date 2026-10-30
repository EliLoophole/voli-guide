import Icon from "./Icon";
import WrittenDot from "./WrittenDot";
import { isTopLaner } from "../lib/toplaners";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "written", label: "Written" },
  { key: "todo", label: "Not written" },
];

// filter / setFilter and showAll / setShowAll come from App, so they're still set after visiting a matchup.
// Without "Show all", only common top laners are listed, plus any champion you've already written a guide for.
export default function ChampionGrid({ champions, written, onSelect, filter, setFilter, showAll, setShowAll }) {
  const shown = champions.filter((c) => {
    if (!showAll && !isTopLaner(c) && !written.has(c.id)) return false;
    if (filter === "written") return written.has(c.id);
    if (filter === "todo") return !written.has(c.id);
    return true;
  });

  return (
    <section className="home">
      <div className="home-head">
        <h2>{showAll ? "All champions" : "Top laners"}</h2>
        <div className="home-head-controls">
          <div className="segmented">
            {FILTERS.map((f) => (
              <button key={f.key} className={filter === f.key ? "on" : ""} onClick={() => setFilter(f.key)}>
                {f.label}
              </button>
            ))}
          </div>
          {/* One-button toggle, styled like the filter buttons next to it */}
          <div className="segmented">
            <button className={showAll ? "on" : ""} onClick={() => setShowAll(!showAll)} title="Also list champions that are rarely played top">
              Show all
            </button>
          </div>
        </div>
      </div>

      {shown.length === 0 && <p className="empty-note">Nothing here yet.</p>}

      <div className="champ-grid">
        {shown.map((c) => (
          <button key={c.id} className="champ-tile" onClick={() => onSelect(c.id)}>
            <Icon src={c.icon} alt={c.name} />
            <span className="champ-name">{c.name}</span>
            {written.has(c.id) && <WrittenDot difficulty={written.get(c.id)} />}
          </button>
        ))}
      </div>
    </section>
  );
}
