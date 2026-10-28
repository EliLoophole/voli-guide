import Icon, { GameIcon } from "./Icon";

// View mode: shows the chosen runes.
// Edit mode: click a tree, then click one rune per row.
export default function RuneEditor({ game, runes, editing, onChange }) {
  const primaryTree = game.tree(runes.primaryTree);
  const secondaryTree = game.tree(runes.secondaryTree);

  if (!editing) {
    if (!runes.primaryTree) return <p className="empty-note">No runes chosen yet.</p>;
    return (
      <div className="rune-view">
        <RuneColumn game={game} treeName={runes.primaryTree} tree={primaryTree} names={runes.primary} keystone />
        <RuneColumn game={game} treeName={runes.secondaryTree} tree={secondaryTree} names={runes.secondary} />
      </div>
    );
  }

  const isPicked = (rune, names) => names.some((n) => game.rune(n)?.id === rune.id);

  function pickPrimaryTree(tree) {
    onChange({
      ...runes,
      primaryTree: tree.name,
      primary: ["", "", "", ""],
      // can't use the same tree twice
      ...(runes.secondaryTree === tree.name && { secondaryTree: "", secondary: ["", ""] }),
    });
  }

  function pickPrimaryRune(row, rune) {
    const primary = [...runes.primary];
    primary[row] = rune.name;
    onChange({ ...runes, primary });
  }

  function pickSecondaryRune(rune) {
    const rowOf = (name) => secondaryTree.rows.findIndex((row) => row.some((r) => r.name === name));
    // Secondary = 2 runes from different rows. Picking a new one replaces the one
    // in the same row, or the oldest pick.
    let picked = runes.secondary.filter((n) => n && rowOf(n) !== rowOf(rune.name));
    picked = [...picked, rune.name].slice(-2);
    while (picked.length < 2) picked.push("");
    onChange({ ...runes, secondary: picked });
  }

  return (
    <div className="rune-edit">
      <p className="label">Primary</p>
      <TreePicker trees={game.runeTrees} selected={runes.primaryTree} onPick={pickPrimaryTree} />
      {primaryTree?.rows.map((row, r) => (
        <div key={r} className={`rune-row ${r === 0 ? "keystones" : ""}`}>
          {row.map((rune) => (
            <button
              key={rune.id}
              className={`rune-btn ${isPicked(rune, [runes.primary[r]]) ? "on" : ""}`}
              onClick={() => pickPrimaryRune(r, rune)}
              title={rune.name}
            >
              <Icon src={rune.icon} alt={rune.name} />
            </button>
          ))}
        </div>
      ))}

      <p className="label mt">Secondary</p>
      <TreePicker
        trees={game.runeTrees.filter((t) => t.name !== runes.primaryTree)}
        selected={runes.secondaryTree}
        onPick={(tree) => onChange({ ...runes, secondaryTree: tree.name, secondary: ["", ""] })}
      />
      {secondaryTree?.rows.slice(1).map((row, r) => (
        <div key={r} className="rune-row">
          {row.map((rune) => (
            <button
              key={rune.id}
              className={`rune-btn ${isPicked(rune, runes.secondary) ? "on" : ""}`}
              onClick={() => pickSecondaryRune(rune)}
              title={rune.name}
            >
              <Icon src={rune.icon} alt={rune.name} />
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function TreePicker({ trees, selected, onPick }) {
  return (
    <div className="tree-picker">
      {trees.map((t) => (
        <button key={t.id} className={`tree-btn ${t.name === selected ? "on" : ""}`} onClick={() => onPick(t)} title={t.name}>
          <Icon src={t.icon} alt={t.name} size={28} />
        </button>
      ))}
    </div>
  );
}

function RuneColumn({ game, treeName, tree, names, keystone }) {
  if (!treeName) return <div className="rune-col"><p className="empty-note">—</p></div>;
  return (
    <div className="rune-col">
      <div className="rune-tree-name">
        <GameIcon entry={tree} name={treeName} size={22} />
        <span>{treeName}</span>
      </div>
      {names.map((n, i) =>
        n ? (
          <div key={i} className={`rune-line ${keystone && i === 0 ? "keystone" : ""}`}>
            <GameIcon entry={game.rune(n)} name={n} size={keystone && i === 0 ? 44 : 28} />
            <span>{n}</span>
          </div>
        ) : null,
      )}
    </div>
  );
}
