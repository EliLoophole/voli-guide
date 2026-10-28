import { useState } from "react";

// An image that fades in once loaded, instead of popping in.
export default function Icon({ src, alt = "", className = "", size }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const style = size ? { width: size, height: size } : undefined;

  if (failed) return <span className={`icon icon-missing ${className}`} style={style} title={alt}>?</span>;
  return (
    <img
      src={src}
      alt={alt}
      title={alt}
      style={style}
      loading="lazy"
      draggable={false}
      className={`icon ${loaded ? "loaded" : ""} ${className}`}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
    />
  );
}

// Shows a rune/item/spell found by name. If the name isn't on the current patch
// (typo, or Riot removed/renamed it), shows a warning tile instead of a broken image.
export function GameIcon({ entry, name, size, className = "" }) {
  if (entry) return <Icon src={entry.icon} alt={entry.name} size={size} className={className} />;
  return (
    <span
      className={`icon icon-missing ${className}`}
      style={size ? { width: size, height: size } : undefined}
      title={`"${name}" wasn't found on this patch`}
    >
      !
    </span>
  );
}

export function Bolt({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="bolt">
      <path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="currentColor" />
    </svg>
  );
}
