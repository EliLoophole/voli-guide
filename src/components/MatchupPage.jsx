import { useEffect, useRef, useState } from "react";
import { loadGuide, saveGuide, storageLabel } from "../lib/storage";
import { DIFFICULTIES, SECTIONS, newGuide } from "../lib/guideTemplate";
import { shortPatch } from "../lib/ddragon";
import Icon from "./Icon";
import RuneEditor from "./RuneEditor";
import SpellSlots from "./SpellSlots";
import ItemRow from "./ItemRow";
import TextSection from "./TextSection";
import SaveIndicator from "./SaveIndicator";

const AUTOSAVE_DELAY_MS = 700;

export default function MatchupPage({ game, championId, onBack, onSaved }) {
  const champ = game.champion(championId);
  const voli = game.champion("Volibear");
  const patch = shortPatch(game.version);

  const [guide, setGuide] = useState(undefined); // undefined = loading, null = not written yet
  const [editing, setEditing] = useState(false);
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

  function update(changes) {
    dirty.current = true;
    setGuide((g) => ({ ...g, ...changes }));
  }

  function startEditing() {
    snapshot.current = structuredClone(guide);
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

  const stale = guide && guide.patch && guide.patch !== patch;

  return (
    <article className="matchup">
      <header className="hero" style={{ "--splash": `url(${champ.splash})` }}>
        <button className="link-btn" onClick={onBack}>← All champions</button>

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
          <div className="hero-meta">
            {editing ? (
              <div className="segmented caps">
                {DIFFICULTIES.map((d) => (
                  <button key={d} className={guide.difficulty === d ? `on diff-${d}` : ""} onClick={() => update({ difficulty: d })}>
                    {d}
                  </button>
                ))}
              </div>
            ) : (
              <span className={`badge diff-${guide.difficulty}`}>{guide.difficulty}</span>
            )}

            <span className={`badge ${stale ? "stale" : ""}`} title={stale ? `Current patch is ${patch}` : undefined}>
              Patch {guide.patch || "?"}
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
          <div className="guide-grid">
            <section className="card">
              <h2>Runes</h2>
              <RuneEditor game={game} runes={guide.runes} editing={editing} onChange={(runes) => update({ runes })} />
            </section>

            <section className="card">
              <h2>Summoner spells</h2>
              <SpellSlots
                game={game}
                spells={guide.summoners}
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
                  names={guide.build[key]}
                  editing={editing}
                  onChange={(names) => update({ build: { ...guide.build, [key]: names } })}
                />
              ))}
            </section>
          </div>

          {SECTIONS.map((s) => (
            <TextSection
              key={s.key}
              label={s.label}
              value={guide[s.key]}
              editing={editing}
              onChange={(text) => update({ [s.key]: text })}
            />
          ))}

          {guide.updated && (
            <p className="muted small footer-note">Last edited {new Date(guide.updated).toLocaleString()}</p>
          )}
        </>
      )}
    </article>
  );
}
