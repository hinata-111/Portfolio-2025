// 写真を出せない活動用のサムネ。文字はタイトルや本文と重複するので読み上げから外す
export default function TextThumb({ label, lines }: { label: string; lines: string[] }) {
  return (
    <span className="thumb-text" aria-hidden="true">
      <span className="thumb-text-label mono">{label}</span>
      {lines.map((line) => (
        <b key={line}>{line}</b>
      ))}
    </span>
  );
}
