export default function ContrastBadge({ ratio, threshold, label }) {
  const pass = ratio >= threshold
  return (
    <span className={'badge ' + (pass ? 'pass' : 'fail')}>
      <span className="b-dot" />
      {label} {pass ? 'Pass' : 'Fail'}
    </span>
  )
}
