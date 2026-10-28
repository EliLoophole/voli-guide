import { useEffect, useRef } from "react";
import SearchBar from "./SearchBar";
import ChampionGrid from "./ChampionGrid";

// Start screen: a big search bar in the middle, with the full champion grid one click away.
// view = { browsing, filter, scrollY } lives in App, so going back from a matchup returns to the same view.
export default function Home({ champions, written, onSelect, view, onViewChange }) {
  const gridRef = useRef(null);
  const opening = useRef(false); // true right after clicking "Browse all champions"
  const count = champions.filter((c) => written.has(c.id)).length;

  // Coming back from a matchup: scroll to where you were. ([] = only when the home screen first shows.)
  useEffect(() => {
    window.scrollTo(0, view.scrollY);
  }, []);

  // When you open the grid, scroll down to it. (Not when coming back with it already open.)
  useEffect(() => {
    if (opening.current) gridRef.current?.scrollIntoView({ behavior: "smooth" });
    opening.current = false;
  }, [view.browsing]);

  function toggleBrowsing() {
    opening.current = !view.browsing;
    onViewChange({ ...view, browsing: !view.browsing });
  }

  return (
    <>
      <section className="home-hero">
        <h1>Volibear matchups</h1>
        <p className="muted">
          <strong className="accent">{count}</strong> / {champions.length} guides written
        </p>
        <SearchBar champions={champions} written={written} onSelect={onSelect} large autoFocus />
        <button className="link-btn" onClick={toggleBrowsing}>
          {view.browsing ? "Hide champion list" : "Browse all champions"}
        </button>
      </section>

      {view.browsing && (
        <div ref={gridRef} className="home-browse">
          <ChampionGrid
            champions={champions}
            written={written}
            onSelect={onSelect}
            filter={view.filter}
            setFilter={(filter) => onViewChange({ ...view, filter })}
          />
        </div>
      )}
    </>
  );
}

// Placeholder while game data loads.
Home.Skeleton = function Skeleton() {
  return (
    <section className="home-hero">
      <div className="skeleton" style={{ width: 340, height: 40 }} />
      <div className="skeleton" style={{ width: 160, height: 16 }} />
      <div className="skeleton" style={{ width: "100%", maxWidth: 560, height: 52, marginTop: 18 }} />
    </section>
  );
};
