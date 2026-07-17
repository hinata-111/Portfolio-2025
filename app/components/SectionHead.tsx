export default function SectionHead({ num, label }: { num: string; label: string }) {
  return (
    <div className="sec-head">
      <span className="sec-num mono">{num}</span>
      <span className="sec-label mono">{label}</span>
    </div>
  );
}
