import { useEffect, useRef, useState } from "react";
import SearchBar from "./SearchBar";
import ChampionGrid from "./ChampionGrid";

// Start screen: a big search bar in the middle, with the full champion grid one click away.
export default function Home({ champions, written, onSelect }) {
  const [browsing, setBrowsing] = useState(false);
  const gridRef = useRef(null);
  const count = champions.filter((c) => written.has(c.id)).length;

  // When the grid opens, scroll down to it.
  useEffect(() => {
    if (browsing) gridRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [browsing]);

  return (
    <>
      <section className="home-hero">
        <h1>Volibear matchups</h1>
        <p className="muted">
          <strong className="accent">{count}</strong> / {champions.length} guides written
        </p>
        <SearchBar champions={champions} written={written} onSelect={onSelect} large autoFocus />
        <button className="link-btn" onClick={() => setBrowsing((b) => !b)}>
          {browsing ? "Hide champion list" : "Browse all champions"}
        </button>
      </section>

      {browsing && (
        <div ref={gridRef} className="home-browse">
          <ChampionGrid champions={champions} written={written} onSelect={onSelect} />
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
