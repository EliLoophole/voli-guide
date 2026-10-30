// The small glowing dot next to a champion that has a guide.
// Its color is the guide's easiest playstyle: green = easy, yellow = even, red = hard.
// (No difficulty, e.g. a file that couldn't be read: the normal accent color.)
export default function WrittenDot({ difficulty }) {
  const title = difficulty ? `Guide written · easiest playstyle: ${difficulty}` : "Guide written";
  return <span className={difficulty ? `written-dot dot-${difficulty}` : "written-dot"} title={title} />;
}
