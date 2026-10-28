const TEXT = {
  idle: "",
  pending: "Unsaved changes",
  saving: "Saving…",
  saved: "Saved ✓",
  error: "Couldn't save",
};

export default function SaveIndicator({ status }) {
  if (status === "idle") return null;
  return (
    <span className={`save-indicator ${status}`} role="status">
      <span className="save-dot" />
      {TEXT[status]}
    </span>
  );
}
