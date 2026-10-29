import { normalize } from "./ddragon";

// Champions picked in more than 1% of top-lane games (op.gg, patch 16.21, 2026-10-28).
// The champion list shows only these (plus any you've written a guide for) until you tick "Show all".
// Riot's game data has no pick rates, so this list is kept by hand: add or remove names as the meta changes.
// Names as the app shows them; spelling details like "Cho'Gath" vs "Chogath" don't matter.
const TOP_LANERS = [
  "Aatrox", "Akali", "Ambessa", "Camille", "Cho'Gath", "Darius", "Dr. Mundo", "Fiora",
  "Gangplank", "Garen", "Gnar", "Gragas", "Gwen", "Heimerdinger", "Illaoi", "Irelia",
  "Jax", "Jayce", "K'Sante", "Kayle", "Kennen", "Kled", "Malphite", "Mordekaiser",
  "Nasus", "Olaf", "Ornn", "Pantheon", "Renekton", "Riven", "Sett", "Shen",
  "Singed", "Sion", "Sylas", "Tahm Kench", "Teemo", "Trundle", "Tryndamere", "Urgot",
  "Vladimir", "Volibear", "Warwick", "Yasuo", "Yone", "Yorick", "Zaahen",
];

const topSet = new Set(TOP_LANERS.map(normalize));

export function isTopLaner(champion) {
  return topSet.has(normalize(champion.name));
}
