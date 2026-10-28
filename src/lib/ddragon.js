// Riot Data Dragon: official, free game data and images. No API key needed.
// Docs: https://developer.riotgames.com/docs/lol#data-dragon

const BASE = "https://ddragon.leagueoflegends.com";
const LANG = "en_US";

// Lowercase and strip everything but letters/numbers, so
// "Dr. Mundo", "drmundo" and "DR MUNDO" all become "drmundo".
export function normalize(name) {
  return String(name ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Full-size splash art. Skin 0 is the default skin; other numbers are listed
// under "skins" in cdn/<version>/data/en_US/champion/<Id>.json.
export function splashUrl(championId, skin = 0) {
  return `${BASE}/cdn/img/champion/splash/${championId}_${skin}.jpg`;
}

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Data Dragon request failed (${res.status}): ${url}`);
  return res.json();
}

// Loads everything the app needs for the current patch.
export async function loadGameData() {
  const [version] = await getJson(`${BASE}/api/versions.json`);
  const cdn = `${BASE}/cdn/${version}`;

  const [champJson, itemJson, spellJson, runeJson] = await Promise.all([
    getJson(`${cdn}/data/${LANG}/champion.json`),
    getJson(`${cdn}/data/${LANG}/item.json`),
    getJson(`${cdn}/data/${LANG}/summoner.json`),
    getJson(`${cdn}/data/${LANG}/runesReforged.json`),
  ]);

  const champions = Object.values(champJson.data)
    .map((c) => ({
      id: c.id, // e.g. "MonkeyKing" — used for image URLs and file names
      name: c.name, // e.g. "Wukong" — what people search for
      title: c.title,
      tags: c.tags,
      icon: `${cdn}/img/champion/${c.image.full}`,
      splash: splashUrl(c.id),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Only items you can actually buy on Summoner's Rift, one per name.
  const items = [];
  const seenItems = new Set();
  for (const [id, item] of Object.entries(itemJson.data)) {
    const onRift = item.maps?.["11"] && item.gold?.purchasable && item.inStore !== false;
    if (!onRift || item.requiredChampion || item.requiredAlly) continue;
    if (seenItems.has(item.name)) continue;
    seenItems.add(item.name);
    items.push({ id, name: item.name, gold: item.gold.total, icon: `${cdn}/img/item/${item.image.full}` });
  }
  items.sort((a, b) => a.name.localeCompare(b.name));

  // Summoner spells usable in normal Summoner's Rift games.
  const spells = Object.values(spellJson.data)
    .filter((s) => s.modes.includes("CLASSIC"))
    .map((s) => ({ id: s.id, name: s.name, icon: `${cdn}/img/spell/${s.image.full}` }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Rune trees: each has 4 rows (row 0 = keystones).
  const runeTrees = runeJson.map((tree) => ({
    id: tree.id,
    name: tree.name,
    icon: `${BASE}/cdn/img/${tree.icon}`,
    rows: tree.slots.map((slot) =>
      slot.runes.map((r) => ({ id: r.id, name: r.name, icon: `${BASE}/cdn/img/${r.icon}` })),
    ),
  }));

  return {
    version,
    champions,
    items,
    spells,
    runeTrees,
    champion: makeLookup(champions, (c) => [c.name, c.id]),
    item: makeLookup(items, (i) => [i.name]),
    spell: makeLookup(spells, (s) => [s.name, s.id]),
    rune: makeLookup(runeTrees.flatMap((t) => t.rows.flat()), (r) => [r.name]),
    tree: makeLookup(runeTrees, (t) => [t.name]),
  };
}

// Builds a function that finds an entry by any of its names, ignoring case and punctuation.
// Returns undefined when nothing matches (e.g. an item removed in a patch).
function makeLookup(list, namesOf) {
  const map = new Map();
  for (const entry of list) {
    for (const n of namesOf(entry)) map.set(normalize(n), entry);
  }
  return (name) => map.get(normalize(name));
}

// "15.21.1" -> "15.21"
export function shortPatch(version) {
  return String(version ?? "").split(".").slice(0, 2).join(".");
}
