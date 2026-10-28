import Markdown from "react-markdown";

// A written section (early game, trading, ...). Uses Markdown:
//   **bold**, *italic*, "- " for bullet points, "## " for a sub-heading.
export default function TextSection({ label, value, editing, onChange }) {
  return (
    <section className="card text-section">
      <h2>{label}</h2>
      {editing ? (
        <div className="text-edit">
          <textarea
            value={value}
            placeholder={"Write here…\n\n- bullet point\n**bold** for key points"}
            onChange={(e) => onChange(e.target.value)}
          />
          <div className="prose preview">
            {value ? <Markdown>{value}</Markdown> : <p className="empty-note">Preview shows up here.</p>}
          </div>
        </div>
      ) : value ? (
        <div className="prose">
          <Markdown>{value}</Markdown>
        </div>
      ) : (
        <p className="empty-note">Not written yet.</p>
      )}
    </section>
  );
}
