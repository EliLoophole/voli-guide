import { useCallback, useEffect, useState } from "react";
import { loadGameData, shortPatch, splashUrl } from "./lib/ddragon";
import { listGuides } from "./lib/storage";
import SearchBar from "./components/SearchBar";
import Home from "./components/Home";
import MatchupPage from "./components/MatchupPage";
import UpdateNotice from "./components/UpdateNotice";
import { Bolt } from "./components/Icon";
import "./App.css";

const HOME_SPLASH = splashUrl("Volibear", 1); // skin 1 = Thunder Lord Volibear

export default function App() {
  const [game, setGame] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [written, setWritten] = useState(new Set()); // champion ids with a guide
  const [selected, setSelected] = useState(null); // champion id being viewed
  // A playstyle copied with "Copy", for pasting into another matchup: { from: "Aatrox", style } or null.
  // Kept here (not on the matchup page) so it survives switching champions.
  const [copied, setCopied] = useState(null);

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
      {/* Splash art behind the home screen (styled in App.css under "Home") */}
      {!selected && <div className="home-bg" style={{ "--splash": `url(${HOME_SPLASH})` }} />}

      <header className="topbar">
        <button className="brand" onClick={() => setSelected(null)}>
          <Bolt />
          <span>Voli Guide</span>
        </button>
        {/* Home has its own big search bar, so the small one only shows on matchup pages */}
        {game && selected && <SearchBar champions={game.champions} written={written} onSelect={setSelected} />}
        <UpdateNotice />
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

        {!game && !loadError && <Home.Skeleton />}

        {game && !selected && <Home champions={game.champions} written={written} onSelect={setSelected} />}

        {game && selected && (
          <MatchupPage
            key={selected}
            game={game}
            championId={selected}
            onBack={() => setSelected(null)}
            onSaved={refreshWritten}
            copied={copied}
            onCopy={setCopied}
          />
        )}
      </main>
    </div>
  );
}
