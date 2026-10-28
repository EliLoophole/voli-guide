import { useState } from "react";
import { GameIcon } from "./Icon";
import IconPicker from "./IconPicker";

export default function SpellSlots({ game, spells, editing, onChange }) {
  const [pickingSlot, setPickingSlot] = useState(null); // 0, 1 or null

  function setSlot(slot, name) {
    const next = [...spells];
    next[slot] = name;
    onChange(next);
    setPickingSlot(null);
  }

  if (!editing && !spells.some(Boolean)) return <p className="empty-note">No spells chosen yet.</p>;

  return (
    <div className="spell-slots">
      {spells.map((name, slot) =>
        editing ? (
          <button key={slot} className={`slot ${name ? "" : "empty"}`} onClick={() => setPickingSlot(slot)}>
            {name ? <GameIcon entry={game.spell(name)} name={name} size={48} /> : <span className="plus">+</span>}
            <span className="slot-name">{name || "Choose"}</span>
          </button>
        ) : (
          name && (
            <div key={slot} className="slot">
              <GameIcon entry={game.spell(name)} name={name} size={48} />
              <span className="slot-name">{name}</span>
            </div>
          )
        ),
      )}

      {pickingSlot !== null && (
        <IconPicker
          title="Summoner spell"
          options={game.spells}
          onPick={(name) => setSlot(pickingSlot, name)}
          onClear={() => setSlot(pickingSlot, "")}
          onClose={() => setPickingSlot(null)}
        />
      )}
    </div>
  );
}
