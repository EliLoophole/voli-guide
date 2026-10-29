import { useEffect, useRef } from "react";
import SearchBar from "./SearchBar";
import ChampionGrid from "./ChampionGrid";

// Start screen: a big search bar in the middle, with the full champion grid one click away.
// view = { browsing, filter, showAll, scrollY } lives in App, so going back from a matchup returns to the same view.
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

  function openList() {
    opening.current = true;
    onViewChange({ ...view, browsing: true });
  }

  function closeList() {
    window.scrollTo(0, 0); // to the top first, so the page shrinking doesn't count as a scroll that reopens it
    onViewChange({ ...view, browsing: false });
  }

  // Scrolling opens and closes the list: scroll down at all (wheel, scrollbar, keys) to open it,
  // scroll back to the very top to close it.
  useEffect(() => {
    // "At the top" = within 2px, since with display scaling the scroll position can be a fraction like 0.6.
    function onScroll() {
      const atTop = window.scrollY < 2;
      if (!view.browsing && !atTop) openList();
      else if (view.browsing && atTop) onViewChange({ ...view, browsing: false });
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }); // no [] here: re-attached after every render, so onScroll always sees the current view

  return (
    <>
      <section className="home-hero">
        <h1>Volibear matchups</h1>
        <p className="muted">
          <strong className="accent">{count}</strong> / {champions.length} guides written
        </p>
        <SearchBar champions={champions} written={written} onSelect={onSelect} large autoFocus />
        <button className="link-btn" onClick={view.browsing ? closeList : openList}>
          {view.browsing ? "Hide champion list" : "Browse all champions"}
        </button>
      </section>

      {/* A little extra height while the list is closed, so there's a scrollbar to scroll down with */}
      {!view.browsing && <div className="home-scroll-room" />}

      {view.browsing && (
        <div ref={gridRef} className="home-browse">
          <ChampionGrid
            champions={champions}
            written={written}
            onSelect={onSelect}
            filter={view.filter}
            setFilter={(filter) => onViewChange({ ...view, filter })}
            showAll={view.showAll}
            setShowAll={(showAll) => onViewChange({ ...view, showAll })}
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
