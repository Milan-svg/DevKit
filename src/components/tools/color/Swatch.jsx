import { useState } from 'react'
import { toast } from 'sonner'
import { rgbToHex, isLight } from '../../../lib/colorUtils.js'

export default function Swatch({ rgb, label, delay = 0, big = false }) {
  const [copied, setCopied] = useState(false)
  const hex = rgbToHex(rgb)
  const onLight = isLight(rgb)

  const onClick = () => {
    navigator.clipboard?.writeText(hex)
    setCopied(true)
    toast('Copied!')
    setTimeout(() => setCopied(false), 900)
  }

  return (
    <div
      className="sw"
      data-on-light={onLight ? '1' : '0'}
      style={{ background: hex, animationDelay: delay + 'ms', height: big ? 92 : 76 }}
      onClick={onClick}
      title={'Copy ' + hex}
    >
      <span className="sw-label">{label || hex}</span>
      <span className={'sw-copied ' + (copied ? 'show' : '')}>Copied</span>
    </div>
  )
}
