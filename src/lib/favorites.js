// Favorites (the ★ in the item picker), stored by name in the app's local storage on this PC.
// Not in the VoliGuides folder: they're a preference, not part of any guide.
// The key must not start with "voliguide:"; in the browser preview, those keys are guides (see storage.js).
const key = (kind) => `voli-favorites:${kind}`;

export function loadFavorites(kind) {
  try {
    return new Set(JSON.parse(localStorage.getItem(key(kind))) ?? []);
  } catch {
    return new Set(); // nothing saved yet, or storage unavailable
  }
}

export function saveFavorites(kind, names) {
  try {
    localStorage.setItem(key(kind), JSON.stringify([...names]));
  } catch (e) {
    console.warn("Couldn't save favorites", e);
  }
}
