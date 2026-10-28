// Checks GitHub for a newer published release of this app.
// GitHub's "latest release" skips drafts, so a new version only shows up
// here after you click Publish on the Releases page.

import { version as currentVersion } from "../../package.json";

const REPO = "EliLoophole/voli-guide";
export const RELEASES_URL = `https://github.com/${REPO}/releases/latest`;
export { currentVersion };

// True if version a is newer than b, e.g. isNewer("0.1.10", "0.1.9") -> true.
function isNewer(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const x = pa[i] || 0;
    const y = pb[i] || 0;
    if (x !== y) return x > y;
  }
  return false;
}

// Resolves to the newer version (e.g. "0.1.3"), or null if this one is up to date.
export async function checkForUpdate() {
  const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`);
  if (!res.ok) throw new Error(`GitHub request failed (${res.status})`);
  const latest = (await res.json()).tag_name.replace(/^v/, ""); // "v0.1.3" -> "0.1.3"
  return isNewer(latest, currentVersion) ? latest : null;
}
