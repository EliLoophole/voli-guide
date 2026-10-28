import { useEffect, useState } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { checkForUpdate, currentVersion, RELEASES_URL } from "../lib/updates";

const inDesktopApp = "__TAURI_INTERNALS__" in window;

// Top-bar button that only appears when a newer version is on GitHub.
export default function UpdateNotice() {
  const [latest, setLatest] = useState(null); // newer version number, or null

  // Check once when the app starts. If offline or GitHub is down, just stay quiet.
  useEffect(() => {
    checkForUpdate()
      .then(setLatest)
      .catch((e) => console.warn("Couldn't check for updates", e));
  }, []);

  if (!latest) return null;

  // The desktop app has to ask Tauri to open the real browser.
  function openDownload() {
    if (inDesktopApp) openUrl(RELEASES_URL);
    else window.open(RELEASES_URL, "_blank");
  }

  return (
    <button className="update-pill" onClick={openDownload} title={`You have v${currentVersion}. Opens the download page.`}>
      <span className="update-dot" />
      Update available: v{latest}
    </button>
  );
}
