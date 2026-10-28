// Checks every guide in Documents/VoliGuides against the current patch.
//   npm run check                 -> checks Documents/VoliGuides
//   npm run check -- C:\some\dir  -> checks another folder
// Reports typos, removed items, wrong rune trees, and empty sections.

import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { loadGameData, shortPatch } from "../src/lib/ddragon.js";
import { SECTIONS } from "../src/lib/guideTemplate.js";

function documentsFolder() {
  // Windows may move Documents into OneDrive, so ask Windows where it is.
  try {
    return execSync("powershell -NoProfile -Command [Environment]::GetFolderPath('MyDocuments')").toString().trim();
  } catch {
    return join(homedir(), "Documents");
  }
}

const folder = process.argv[2] ?? join(documentsFolder(), "VoliGuides");
if (!existsSync(folder)) {
  console.log(`No guides folder yet at ${folder}. Write a guide in the app first.`);
  process.exit(0);
}

const game = await loadGameData();
const patch = shortPatch(game.version);
const files = readdirSync(folder).filter((f) => f.endsWith(".json") && !f.startsWith("_"));
let problemCount = 0;

console.log(`Checking ${files.length} guide(s) in ${folder} against patch ${patch}\n`);

for (const file of files) {
  const problems = [];
  const notes = [];
  let guide;
  try {
    guide = JSON.parse(readFileSync(join(folder, file), "utf8"));
  } catch (e) {
    problems.push(`not valid JSON: ${e.message}`);
  }

  if (guide) {
    const { runes = {}, summoners = [], build = {} } = guide;
    if (!game.champion(guide.champion)) problems.push(`unknown champion "${guide.champion}"`);

    const primaryTree = game.tree(runes.primaryTree);
    const secondaryTree = game.tree(runes.secondaryTree);
    if (runes.primaryTree && !primaryTree) problems.push(`unknown rune tree "${runes.primaryTree}"`);
    if (runes.secondaryTree && !secondaryTree) problems.push(`unknown rune tree "${runes.secondaryTree}"`);

    const inTree = (tree, name) => tree?.rows.flat().some((r) => r.id === game.rune(name)?.id);
    for (const name of (runes.primary ?? []).filter(Boolean)) {
      if (!game.rune(name)) problems.push(`unknown rune "${name}"`);
      else if (primaryTree && !inTree(primaryTree, name)) problems.push(`"${name}" isn't in ${primaryTree.name}`);
    }
    for (const name of (runes.secondary ?? []).filter(Boolean)) {
      if (!game.rune(name)) problems.push(`unknown rune "${name}"`);
      else if (secondaryTree && !inTree(secondaryTree, name)) problems.push(`"${name}" isn't in ${secondaryTree.name}`);
    }

    for (const name of summoners.filter(Boolean)) {
      if (!game.spell(name)) problems.push(`unknown summoner spell "${name}"`);
    }
    for (const [row, names] of Object.entries(build)) {
      for (const name of names ?? []) if (!game.item(name)) problems.push(`unknown item "${name}" (${row})`);
    }

    const empty = SECTIONS.filter((s) => !guide[s.key]?.trim()).map((s) => s.label.toLowerCase());
    if (empty.length) notes.push(`not written yet: ${empty.join(", ")}`);
    if (guide.patch && guide.patch !== patch) notes.push(`written for patch ${guide.patch}`);
  }

  problemCount += problems.length;
  const mark = problems.length ? "✗" : "✓";
  console.log(`${mark} ${file}`);
  for (const p of problems) console.log(`    problem: ${p}`);
  for (const n of notes) console.log(`    note:    ${n}`);
}

console.log(problemCount ? `\n${problemCount} problem(s) found.` : "\nAll guides look good.");
process.exit(problemCount ? 1 : 0);
