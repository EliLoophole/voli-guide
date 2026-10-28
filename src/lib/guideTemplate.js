// The shape of one matchup guide. Every guide file follows this.
// A guide has one or more PLAYSTYLES (tabs on the matchup page). Each playstyle
// has its own difficulty, runes, spells, build and text sections.
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

export function newPlaystyle(name, patch) {
  return {
    name,
    difficulty: "even",
    patch,
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

export function newGuide(championId, patch) {
  return {
    champion: championId,
    updated: new Date().toISOString(),
    playstyles: [newPlaystyle("Playstyle 1", patch)],
  };
}

// Fills in anything missing from a playstyle (handy if you edit a file by hand
// and leave a field out), so the rest of the app never has to check.
function playstyleWithDefaults(style, index) {
  const base = newPlaystyle(`Playstyle ${index + 1}`, style.patch);
  return {
    ...base,
    ...style,
    runes: { ...base.runes, ...style.runes },
    build: { ...base.build, ...style.build },
  };
}

// True for guides saved before playstyles existed (everything at the top level).
export function isOldFormat(guide) {
  return !Array.isArray(guide.playstyles);
}

// Fills in anything missing from a guide. Old guides become a guide with one
// playstyle that holds all of their content, so nothing is lost.
export function withDefaults(guide) {
  if (isOldFormat(guide)) {
    const { champion, updated, ...content } = guide;
    guide = { champion, updated, playstyles: [content] };
  }
  const playstyles = guide.playstyles.length ? guide.playstyles : [{}];
  return { ...guide, playstyles: playstyles.map(playstyleWithDefaults) };
}
