// The ONLY place that reads and writes guides. Everything else calls these three:
//   listGuides()  -> ["Darius", "Garen", ...]   (champion ids that have a guide)
//   loadGuide(id) -> guide object, or null if none written yet
//   saveGuide(guide)
//
// In the desktop app, each guide is a JSON file in Documents/VoliGuides.
// In a plain browser (npm run dev), it falls back to browser storage so you
// can still try things out.

import { BaseDirectory, exists, mkdir, readDir, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { isOldFormat, withDefaults } from "./guideTemplate";

const FOLDER = "VoliGuides";
const BACKUP_FOLDER = `${FOLDER}/_before-playstyles`; // "_" so listGuides skips it
const baseDir = BaseDirectory.Document;
const inDesktopApp = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export const storageLabel = inDesktopApp ? `Documents/${FOLDER}` : "browser storage (preview mode)";

const fileFor = (championId) => `${FOLDER}/${championId}.json`;

async function ensureFolder() {
  if (!(await exists(FOLDER, { baseDir }))) await mkdir(FOLDER, { baseDir, recursive: true });
}

const desktop = {
  async list() {
    await ensureFolder();
    const entries = await readDir(FOLDER, { baseDir });
    return entries
      .filter((e) => e.isFile && e.name.endsWith(".json") && !e.name.startsWith("_"))
      .map((e) => e.name.replace(/\.json$/, ""));
  },
  async load(championId) {
    if (!(await exists(fileFor(championId), { baseDir }))) return null;
    return JSON.parse(await readTextFile(fileFor(championId), { baseDir }));
  },
  async save(guide) {
    await ensureFolder();
    await writeTextFile(fileFor(guide.champion), JSON.stringify(guide, null, 2), { baseDir });
  },
  // Keeps an untouched copy of a guide from before playstyles existed (only once).
  async backupOldFormat(championId) {
    const backup = `${BACKUP_FOLDER}/${championId}.json`;
    if (await exists(backup, { baseDir })) return;
    if (!(await exists(BACKUP_FOLDER, { baseDir }))) await mkdir(BACKUP_FOLDER, { baseDir, recursive: true });
    await writeTextFile(backup, await readTextFile(fileFor(championId), { baseDir }), { baseDir });
  },
};

const browser = {
  key: (championId) => `voliguide:${championId}`,
  async list() {
    return Object.keys(localStorage)
      .filter((k) => k.startsWith("voliguide:"))
      .map((k) => k.slice("voliguide:".length));
  },
  async load(championId) {
    const text = localStorage.getItem(this.key(championId));
    return text ? JSON.parse(text) : null;
  },
  async save(guide) {
    localStorage.setItem(this.key(guide.champion), JSON.stringify(guide, null, 2));
  },
  async backupOldFormat() {}, // browser storage is only for trying things out
};

const backend = inDesktopApp ? desktop : browser;

export const listGuides = () => backend.list();

export async function loadGuide(championId) {
  const guide = await backend.load(championId);
  if (!guide) return null;
  // Guides from before playstyles get converted when saved, so back up the original first.
  // (A failed backup mustn't stop the guide from opening; converting loses nothing.)
  if (isOldFormat(guide)) {
    await backend.backupOldFormat(championId).catch((e) => console.error("Couldn't back up old guide", e));
  }
  return withDefaults(guide);
}

export async function saveGuide(guide) {
  const stamped = { ...guide, updated: new Date().toISOString() };
  await backend.save(stamped);
  return stamped;
}
