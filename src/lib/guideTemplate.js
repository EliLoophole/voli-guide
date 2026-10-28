// The shape of one matchup guide. Every guide file follows this.
// Runes, spells and items are stored by NAME (e.g. "Grasp of the Undying"),
// the app finds the icons for you.

export const SECTIONS = [
  { key: "trading", label: "Trading patterns" },
  { key: "early", label: "Early game" },
  { key: "mid", label: "Mid game" },
  { key: "late", label: "Late game" },
  { key: "outlook", label: "Overall outlook" },
];

export const DIFFICULTIES = ["easy", "even", "hard"];

export function newGuide(championId, patch) {
  return {
    champion: championId,
    difficulty: "even",
    patch,
    updated: new Date().toISOString(),
    runes: {
      primaryTree: "",
      primary: ["", "", "", ""], // keystone + one per row
      secondaryTree: "",
      secondary: ["", ""],
    },
    summoners: ["", ""],
    build: { start: [], core: [], situational: [] },
    trading: "",
    early: "",
    mid: "",
    late: "",
    outlook: "",
  };
}

// Fills in anything missing from a guide (handy if you edit a file by hand
// and leave a field out), so the rest of the app never has to check.
export function withDefaults(guide) {
  const base = newGuide(guide.champion, guide.patch);
  return {
    ...base,
    ...guide,
    runes: { ...base.runes, ...guide.runes },
    build: { ...base.build, ...guide.build },
  };
}
