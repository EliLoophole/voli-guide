import { useEffect, useRef, useState } from "react";
import { loadGuide, saveGuide, storageLabel } from "../lib/storage";
import { DIFFICULTIES, SECTIONS, newGuide, newPlaystyle } from "../lib/guideTemplate";
import { shortPatch } from "../lib/ddragon";
import Icon from "./Icon";
import RuneEditor from "./RuneEditor";
import SpellSlots from "./SpellSlots";
import ItemRow from "./ItemRow";
import TextSection from "./TextSection";
import SaveIndicator from "./SaveIndicator";
import PlaystyleTabs from "./PlaystyleTabs";

const AUTOSAVE_DELAY_MS = 700;
const STARTING_ITEM_MAX_GOLD = 500; // the starting items picker only lists items this cheap

// backLabel: where the back link goes ("Search", "Written", ...).
export default function MatchupPage({ game, championId, onBack, backLabel, onSaved, copied, onCopy }) {
  const champ = game.champion(championId);
  const voli = game.champion("Volibear");
  const patch = shortPatch(game.version);

  const [guide, setGuide] = useState(undefined); // undefined = loading, null = not written yet
  const [editing, setEditing] = useState(false);
  const [active, setActive] = useState(0); // which playstyle tab is open
  const [focusName, setFocusName] = useState(false); // put the cursor in the name box (after adding a tab)
  const [status, setStatus] = useState("idle"); // idle | pending | saving | saved | error
  const dirty = useRef(false); // true when there are changes not yet saved
  const snapshot = useRef(null); // the guide as it was when you clicked Edit
  const latest = useRef(guide);
  latest.current = guide;

  useEffect(() => {
    loadGuide(championId)
      .then(setGuide)
      .catch((e) => {
        console.error(e);
        setGuide(null);
        setStatus("error");
      });
  }, [championId]);

  // Autosave: once you stop changing things for a moment, save.
  useEffect(() => {
    if (!dirty.current || !guide) return;
    setStatus("pending");
    const timer = setTimeout(async () => {
      dirty.current = false;
      setStatus("saving");
      try {
        await saveGuide(guide);
        if (!dirty.current) setStatus("saved");
        onSaved();
      } catch (e) {
        console.error(e);
        dirty.current = true;
        setStatus("error");
      }
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [guide, onSaved]);

  // Leaving the page right after typing still saves.
  useEffect(
    () => () => {
      if (dirty.current && latest.current) saveGuide(latest.current).then(onSaved);
    },
    [onSaved],
  );

  // The open playstyle. (Math.min in case one was just deleted or discarded.)
  const styleIndex = guide ? Math.min(active, guide.playstyles.length - 1) : 0;
  const style = guide?.playstyles[styleIndex];

  // Changes the open playstyle.
  function update(changes) {
    dirty.current = true;
    setGuide((g) => ({
      ...g,
      playstyles: g.playstyles.map((p, i) => (i === styleIndex ? { ...p, ...changes } : p)),
    }));
  }

  // Replaces the whole list of playstyles (add / duplicate / delete) and opens tab `open`.
  function setPlaystyles(playstyles, open) {
    dirty.current = true;
    setGuide((g) => ({ ...g, playstyles }));
    setActive(open);
  }

  // Adds a playstyle as a new last tab, opens it, and selects its name so you can type a new one.
  function addTab(playstyle) {
    setPlaystyles([...guide.playstyles, playstyle], guide.playstyles.length);
    setFocusName(true);
  }

  function selectTab(i) {
    setActive(i);
    setFocusName(false);
  }

  function deletePlaystyle() {
    setPlaystyles(guide.playstyles.filter((_, i) => i !== styleIndex), Math.max(0, styleIndex - 1));
  }

  // Copy remembers the open playstyle (in App), Paste adds it here as a new tab.
  function copyPlaystyle() {
    onCopy({ from: champ.name, style: structuredClone(style) });
  }

  function pastePlaystyle() {
    addTab(structuredClone(copied.style));
  }

  function startEditing() {
    snapshot.current = structuredClone(guide);
    setFocusName(false);
    setEditing(true);
  }

  function startNewGuide() {
    const fresh = newGuide(championId, patch);
    snapshot.current = structuredClone(fresh);
    dirty.current = true;
    setGuide(fresh);
    setEditing(true);
  }

  function discardChanges() {
    dirty.current = true;
    setGuide(structuredClone(snapshot.current));
  }

  if (!champ) {
    return (
      <div className="state-card">
        <h2>Unknown champion “{championId}”</h2>
        <button className="btn" onClick={onBack}>Back</button>
      </div>
    );
  }

  const stale = style && style.patch && style.patch !== patch;

  return (
    <article className="matchup">
      <header className="hero" style={{ "--splash": `url(${champ.splash})` }}>
        <button className="link-btn" onClick={onBack}>← {backLabel}</button>

        <div className="hero-main">
          <div className="vs">
            {voli && <Icon src={voli.icon} alt="Volibear" size={56} className="vs-icon" />}
            <span className="vs-text">vs</span>
            <Icon src={champ.icon} alt={champ.name} size={72} className="vs-icon enemy" />
          </div>
          <div>
            <h1>{champ.name}</h1>
            <p className="muted">{champ.title}</p>
          </div>
        </div>

        {guide && (
          <PlaystyleTabs
            playstyles={guide.playstyles}
            active={styleIndex}
            editing={editing}
            focusName={focusName}
            copied={copied}
            onSelect={selectTab}
            onRename={(name) => update({ name })}
            onAdd={() => addTab(newPlaystyle(`Playstyle ${guide.playstyles.length + 1}`, patch))}
            onDuplicate={() => addTab({ ...structuredClone(style), name: `${style.name} (copy)` })}
            onDelete={deletePlaystyle}
            onCopy={copyPlaystyle}
            onPaste={pastePlaystyle}
          />
        )}

        {guide && (
          <div className="hero-meta">
            {editing ? (
              <div className="segmented caps">
                {DIFFICULTIES.map((d) => (
                  <button key={d} className={style.difficulty === d ? `on diff-${d}` : ""} onClick={() => update({ difficulty: d })}>
                    {d}
                  </button>
                ))}
              </div>
            ) : (
              <span className={`badge diff-${style.difficulty}`}>{style.difficulty}</span>
            )}

            <span className={`badge ${stale ? "stale" : ""}`} title={stale ? `Current patch is ${patch}` : undefined}>
              Patch {style.patch || "?"}
              {stale && " · may be outdated"}
            </span>
            {editing && stale && (
              <button className="link-btn" onClick={() => update({ patch })}>Mark up to date for {patch}</button>
            )}

            <span className="spacer" />
            <SaveIndicator status={status} />
            {editing ? (
              <>
                <button className="btn ghost" onClick={discardChanges} title="Go back to how it was when you clicked Edit">
                  Discard changes
                </button>
                <button className="btn primary" onClick={() => setEditing(false)}>Done</button>
              </>
            ) : (
              <button className="btn primary" onClick={startEditing}>Edit</button>
            )}
          </div>
        )}
      </header>

      {guide === undefined && (
        <div className="guide-grid">
          <div className="card skeleton" style={{ height: 220 }} />
          <div className="card skeleton" style={{ height: 220 }} />
        </div>
      )}

      {guide === null && (
        <div className="state-card">
          <h2>No guide for {champ.name} yet</h2>
          <p className="muted">It'll be saved to {storageLabel}.</p>
          <button className="btn primary" onClick={startNewGuide}>Write guide</button>
        </div>
      )}

      {guide && (
        <>
          {/* All the cards in one box. Editing: two columns with full-width text sections.
              Reading: "board" layout that fits everything on one screen (styled in App.css). */}
          <div className={editing ? "guide-cards editing" : "guide-cards board"}>
            <section className="card">
              <h2>Runes</h2>
              <RuneEditor game={game} runes={style.runes} editing={editing} onChange={(runes) => update({ runes })} />
            </section>

            <section className="card">
              <h2>Summoner spells</h2>
              <SpellSlots
                game={game}
                spells={style.summoners}
                editing={editing}
                onChange={(summoners) => update({ summoners })}
              />

              <h2 className="mt">Build</h2>
              {[
                ["start", "Starting items"],
                ["core", "Core"],
                ["situational", "Situational"],
              ].map(([key, label]) => (
                <ItemRow
                  key={key}
                  game={game}
                  label={label}
                  names={style.build[key]}
                  maxGold={key === "start" ? STARTING_ITEM_MAX_GOLD : undefined}
                  editing={editing}
                  onChange={(names) => update({ build: { ...style.build, [key]: names } })}
                />
              ))}
            </section>

            {SECTIONS.map((s) => (
              <TextSection
                key={s.key}
                label={s.label}
                value={style[s.key]}
                editing={editing}
                onChange={(text) => update({ [s.key]: text })}
              />
            ))}
          </div>

          {guide.updated && (
            <p className="muted small footer-note">Last edited {new Date(guide.updated).toLocaleString()}</p>
          )}
        </>
      )}
    </article>
  );
}
