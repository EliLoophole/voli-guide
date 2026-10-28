#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Lets the app read/write guide files. Which folders it may touch is
        // set in capabilities/default.json (only Documents/VoliGuides).
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        // Downloads and installs new versions from GitHub Releases (endpoint and
        // signing public key are in tauri.conf.json under plugins.updater).
        .plugin(tauri_plugin_updater::Builder::new().build())
        // Lets the app restart itself after an update.
        .plugin(tauri_plugin_process::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
