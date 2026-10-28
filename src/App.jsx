import { useCallback, useEffect, useState } from "react";
import { loadGameData, shortPatch } from "./lib/ddragon";
import { listGuides } from "./lib/storage";
import SearchBar from "./components/SearchBar";
import ChampionGrid from "./components/ChampionGrid";
import MatchupPage from "./components/MatchupPage";
import { Bolt } from "./components/Icon";
import "./App.css";

export default function App() {
  const [game, setGame] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [written, setWritten] = useState(new Set()); // champion ids with a guide
  const [selected, setSelected] = useState(null); // champion id being viewed

  const loadGame = useCallback(() => {
    setLoadError(null);
    loadGameData()
      .then(setGame)
      .catch((e) => setLoadError(e.message));
  }, []);

  const refreshWritten = useCallback(() => {
    listGuides()
      .then((ids) => setWritten(new Set(ids)))
      .catch((e) => console.error("Couldn't list guides", e));
  }, []);

  useEffect(() => {
    loadGame();
    refreshWritten();
  }, [loadGame, refreshWritten]);

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={() => setSelected(null)}>
          <Bolt />
          <span>Voli Guide</span>
        </button>
        {game && <SearchBar champions={game.champions} written={written} onSelect={setSelected} />}
        {game && <span className="patch-tag">Patch {shortPatch(game.version)}</span>}
      </header>

      <main>
        {loadError && (
          <div className="state-card">
            <h2>Couldn't reach Data Dragon</h2>
            <p className="muted">Check your internet connection. Riot's game data loads from the web.</p>
            <p className="muted small">{loadError}</p>
            <button className="btn primary" onClick={loadGame}>Try again</button>
          </div>
        )}

        {!game && !loadError && <ChampionGrid.Skeleton />}

        {game && !selected && (
          <ChampionGrid champions={game.champions} written={written} onSelect={setSelected} />
        )}

        {game && selected && (
          <MatchupPage
            key={selected}
            game={game}
            championId={selected}
            onBack={() => setSelected(null)}
            onSaved={refreshWritten}
          />
        )}
      </main>
    </div>
  );
}
