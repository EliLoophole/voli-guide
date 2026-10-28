import { useEffect, useState } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { checkForUpdate, currentVersion, RELEASES_URL } from "../lib/updates";

const inDesktopApp = "__TAURI_INTERNALS__" in window;

// Top-bar button that only appears when a newer version is on GitHub.
// Desktop app: one click downloads it, installs it and restarts.
// Browser preview: there's nothing to install, so it opens the release page instead.
export default function UpdateNotice() {
  const [update, setUpdate] = useState(null); // { version, downloadAndInstall } or null
  const [status, setStatus] = useState("idle"); // "idle" | "downloading" | "error"
  const [percent, setPercent] = useState(0);

  // Check once when the app starts. If offline or GitHub is down, just stay quiet.
  useEffect(() => {
    const checking = inDesktopApp
      ? check() // the updater plugin: reads latest.json from the newest release
      : checkForUpdate().then((version) => version && { version });
    checking.then((u) => u && setUpdate(u)).catch((e) => console.warn("Couldn't check for updates", e));
  }, []);

  if (!update) return null;

  function openDownloadPage() {
    if (inDesktopApp) openUrl(RELEASES_URL);
    else window.open(RELEASES_URL, "_blank");
  }

  async function install() {
    setStatus("downloading");
    try {
      let total = 0;
      let done = 0;
      await update.downloadAndInstall((event) => {
        if (event.event === "Started") total = event.data.contentLength ?? 0;
        if (event.event === "Progress" && total) {
          done += event.data.chunkLength;
          setPercent(Math.round((done / total) * 100));
        }
      });
      // On Windows the installer closes the app and reopens it by itself;
      // this restart is for when it doesn't.
      await relaunch();
    } catch (e) {
      console.error("Update failed", e);
      setStatus("error");
    }
  }

  let label = `Update to v${update.version}`;
  let onClick = inDesktopApp ? install : openDownloadPage;
  if (status === "downloading") label = `Updating… ${percent}%`;
  if (status === "error") {
    label = "Update failed: open download page";
    onClick = openDownloadPage;
  }

  return (
    <button
      className="update-pill"
      onClick={onClick}
      disabled={status === "downloading"}
      title={`You have v${currentVersion}. Installs v${update.version} and restarts the app.`}
    >
      <span className="update-dot" />
      {label}
    </button>
  );
}
