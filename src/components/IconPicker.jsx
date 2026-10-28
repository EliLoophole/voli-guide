import { useEffect, useState } from "react";
import { normalize } from "../lib/ddragon";
import Icon from "./Icon";

// A pop-up grid of icons with a search box. Enter picks the first match, Esc closes.
export default function IconPicker({ title, options, onPick, onClose, onClear }) {
  const [query, setQuery] = useState("");
  const shown = options.filter((o) => normalize(o.name).includes(normalize(query)));

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
            <button key={o.name} className="picker-item" onClick={() => onPick(o.name)} title={o.name}>
              <Icon src={o.icon} alt={o.name} size={44} />
              <span>{o.name}</span>
            </button>
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
