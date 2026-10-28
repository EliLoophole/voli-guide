import { useEffect, useMemo, useRef, useState } from "react";
import { normalize } from "../lib/ddragon";
import Icon from "./Icon";

const MAX_RESULTS = 8;

// large: the big centered version on the home screen. autoFocus: put the cursor in it right away.
export default function SearchBar({ champions, written, onSelect, large = false, autoFocus = false }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0); // highlighted result
  const inputRef = useRef(null);

  // Press "/" anywhere (outside a text box) to jump to search.
  useEffect(() => {
    function onKey(e) {
      const typing = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Names that start with the query come first, then names that contain it.
  const results = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];
    const starts = [];
    const contains = [];
    for (const c of champions) {
      const name = normalize(c.name);
      if (name.startsWith(q)) starts.push(c);
      else if (name.includes(q) || normalize(c.id).includes(q)) contains.push(c);
    }
    return [...starts, ...contains].slice(0, MAX_RESULTS);
  }, [query, champions]);

  function choose(champ) {
    onSelect(champ.id);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  }

  function onKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      choose(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div className={large ? "search large" : "search"}>
      <input
        ref={inputRef}
        autoFocus={autoFocus}
        value={query}
        placeholder="Search a champion…"
        spellCheck={false}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      <kbd className="search-hint">/</kbd>

      {open && query && (
        <ul className="search-results">
          {results.length === 0 && <li className="search-empty">No champion matches “{query}”</li>}
          {results.map((c, i) => (
            <li
              key={c.id}
              className={i === active ? "active" : ""}
              // mousedown (not click) so it fires before the input loses focus
              onMouseDown={(e) => {
                e.preventDefault();
                choose(c);
              }}
              onMouseEnter={() => setActive(i)}
            >
              <Icon src={c.icon} alt={c.name} size={28} />
              <span>{c.name}</span>
              {written.has(c.id) && <span className="written-dot" title="Guide written" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
