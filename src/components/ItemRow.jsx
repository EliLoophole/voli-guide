import { useRef, useState } from "react";
import { GameIcon } from "./Icon";
import IconPicker from "./IconPicker";

// One row of items (e.g. "Core"). In edit mode: + to add, × to remove, drag to reorder.
// maxGold: if given, the picker only lists items costing that much or less (used for starting items).
export default function ItemRow({ game, label, names, editing, onChange, maxGold }) {
  const [picking, setPicking] = useState(false);
  const dragFrom = useRef(null);
  const options = maxGold ? game.items.filter((item) => item.gold <= maxGold) : game.items;

  function move(from, to) {
    if (from === null || from === to) return;
    const next = [...names];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  return (
    <div className="item-row">
      <p className="label">{label}</p>
      <div className="items">
        {names.length === 0 && !editing && <span className="empty-note">—</span>}
        {names.map((name, i) => (
          <div
            key={`${name}-${i}`}
            className={`item ${editing ? "editable" : ""}`}
            draggable={editing}
            onDragStart={() => (dragFrom.current = i)}
            onDragOver={(e) => editing && e.preventDefault()}
            onDrop={() => move(dragFrom.current, i)}
            title={name}
          >
            <GameIcon entry={game.item(name)} name={name} size={44} />
            {editing && (
              <button className="remove" onClick={() => onChange(names.filter((_, j) => j !== i))} title="Remove">
                ×
              </button>
            )}
          </div>
        ))}
        {editing && (
          <button className="item add" onClick={() => setPicking(true)} title="Add item">
            +
          </button>
        )}
      </div>

      {picking && (
        <IconPicker
          title={maxGold ? `Add item · ${label} (${maxGold} gold or less)` : `Add item · ${label}`}
          options={options}
          favoritesKey="items"
          onPick={(name) => onChange([...names, name])} // stays open, so you can add several in a row
          closeLabel="Done"
          onClose={() => setPicking(false)}
        />
      )}
    </div>
  );
}
