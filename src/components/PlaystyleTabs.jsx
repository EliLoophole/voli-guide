import { useState } from "react";

// Tabs for switching between the playstyles of one matchup.
// While editing, the open tab's name is a text box, and you can add, duplicate, copy, paste or delete playstyles.
// copied: a playstyle copied from any matchup ({ from, style }) or null.
export default function PlaystyleTabs({
  playstyles, active, editing, focusName, copied,
  onSelect, onRename, onAdd, onDuplicate, onDelete, onCopy, onPaste,
}) {
  const [justCopied, setJustCopied] = useState(false); // shows "Copied ✓" for a moment

  // With only one playstyle there's nothing to switch between, so hide the tabs (except while editing).
  if (!editing && playstyles.length < 2) return null;

  function copy() {
    onCopy();
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 1500);
  }

  return (
    <div className="playstyle-tabs" role="tablist">
      {playstyles.map((p, i) =>
        editing && i === active ? (
          <label key={i} className="tab on tab-name" title="Rename this playstyle">
            <input
              value={p.name}
              placeholder="Name"
              size={Math.max(p.name.length, 6)} // grow with the name
              autoFocus={focusName} // only right after adding a tab
              onFocus={(e) => e.target.select()} // select the old name so typing replaces it
              onChange={(e) => onRename(e.target.value)}
              aria-label="Playstyle name"
            />
            <span className="pencil" aria-hidden="true">✎</span>
          </label>
        ) : (
          <button key={i} role="tab" aria-selected={i === active} className={i === active ? "tab on" : "tab"} onClick={() => onSelect(i)}>
            {p.name || "Untitled"}
          </button>
        ),
      )}

      {editing && (
        <span className="tab-actions">
          <button className="link-btn" onClick={onAdd} title="Add an empty playstyle">+ New</button>
          <button className="link-btn" onClick={onDuplicate} title="Copy the open playstyle into a new tab here">Duplicate</button>
          <button className="link-btn" onClick={copy} title="Remember the open playstyle so you can paste it into another matchup">
            {justCopied ? "Copied ✓" : "Copy"}
          </button>
          {copied && (
            <button className="link-btn" onClick={onPaste} title={`Add “${copied.style.name}” (copied from ${copied.from}) as a new tab`}>
              Paste
            </button>
          )}
          {playstyles.length > 1 && (
            <button className="link-btn danger" onClick={onDelete} title="Delete the open playstyle (Discard changes brings it back)">
              Delete
            </button>
          )}
        </span>
      )}
    </div>
  );
}
