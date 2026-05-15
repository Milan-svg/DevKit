export default function Slider({ value, min = 0, max = 255, onChange, fill }) {
  return (
    <div className="slider">
      <div className="track">
        <div className="fill" style={{ background: fill }} />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
      />
    </div>
  )
}
