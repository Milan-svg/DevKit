import { useState } from 'react'
import { toast } from 'sonner'
import { Copy, Check } from '../../Icons.jsx'
import Swatch from './Swatch.jsx'

export default function PaletteCard({ title, hint, swatches, cols, copyText, copyLabel = 'Copy', description }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="palette-block-card">
      <div className="palette-head" style={{ marginBottom: description ? 6 : 8 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h5>{title}</h5>
          {hint && <span className="hint">{hint}</span>}
        </div>
        <div className="palette-actions">
          <button
            className="ghost-btn"
            onClick={() => {
              navigator.clipboard?.writeText(copyText)
              setCopied(true)
              toast('Copied!')
              setTimeout(() => setCopied(false), 1100)
            }}
          >
            {copied ? <Check /> : <Copy />}
            {copied ? 'Copied' : copyLabel}
          </button>
        </div>
      </div>
      {description && <p className="harmony-desc">{description}</p>}
      <div className={'swatch-strip cols-' + cols}>
        {swatches.map((s, i) => (
          <Swatch key={i} rgb={s.rgb} label={s.label} delay={i * 35} />
        ))}
      </div>
    </div>
  )
}
