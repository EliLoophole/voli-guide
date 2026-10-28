import { useEffect, useState } from "react";
import { normalize } from "../lib/ddragon";
import { loadFavorites, saveFavorites } from "../lib/favorites";
import Icon from "./Icon";

// A pop-up grid of icons with a search box. Enter picks the first match, Esc closes.
// favoritesKey: when given (e.g. "items"), each icon gets a small ★ and starred ones are listed first.
export default function IconPicker({ title, options, onPick, onClose, onClear, favoritesKey }) {
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState(() => (favoritesKey ? loadFavorites(favoritesKey) : null));

  const matches = options.filter((o) => normalize(o.name).includes(normalize(query)));
  // Favorites first; each group stays in A–Z order.
  const shown = favorites
    ? [...matches.filter((o) => favorites.has(o.name)), ...matches.filter((o) => !favorites.has(o.name))]
    : matches;

  function toggleFavorite(name) {
    const next = new Set(favorites);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setFavorites(next);
    saveFavorites(favoritesKey, next);
  }

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <input
            autoFocus
            value={query}
            placeholder="Search…"
            spellCheck={false}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && shown[0] && onPick(shown[0].name)}
          />
        </div>
        <div className="picker-grid">
          {shown.map((o) => (
            <div key={o.name} className="picker-cell">
              <button className="picker-item" onClick={() => onPick(o.name)} title={o.name}>
                <Icon src={o.icon} alt={o.name} size={44} />
                <span>{o.name}</span>
              </button>
              {/* Separate small button (not inside the one above), so starring doesn't pick the item */}
              {favorites && (
                <button
                  className={favorites.has(o.name) ? "fav-star on" : "fav-star"}
                  onClick={() => toggleFavorite(o.name)}
                  title={favorites.has(o.name) ? "Remove from favorites" : "Add to favorites (listed first)"}
                  aria-label={`Favorite ${o.name}`}
                >
                  ★
                </button>
              )}
            </div>
          ))}
          {shown.length === 0 && <p className="empty-note">No matches.</p>}
        </div>
        <div className="modal-foot">
          {onClear && <button className="btn ghost" onClick={onClear}>Clear slot</button>}
          <span className="spacer" />
          <button className="btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
