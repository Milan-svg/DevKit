import { useState } from 'react'
import { Copy, Check } from '../../Icons.jsx'

export default function CopyChip({ value }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      className="swatch-copy"
      onClick={(e) => {
        e.stopPropagation()
        navigator.clipboard?.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 900)
      }}
      title="Copy"
    >
      {copied ? <Check /> : <Copy />}
      <span>{copied ? 'Copied' : value}</span>
    </button>
  )
}
