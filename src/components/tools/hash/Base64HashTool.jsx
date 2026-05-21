import { useState } from 'react'
import EncoderDecoder from './EncoderDecoder.jsx'
import HashGenerator from './HashGenerator.jsx'
import JwtDecoder from './JwtDecoder.jsx'

const TABS = [
  { id: 'encode', label: 'Encode / Decode', desc: 'Base64, URL, HTML entities' },
  { id: 'hash', label: 'Hash', desc: 'MD5, SHA-1, SHA-256, SHA-512' },
  { id: 'jwt', label: 'JWT', desc: 'Decode header & payload' },
]

export default function Base64HashTool() {
  const [tab, setTab] = useState('encode')

  return (
    <div className="hash-tool">
      <div className="hash-tab-bar">
        <div className="json-mode-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={'json-mode-tab ' + (tab === t.id ? 'active' : '')}
              onClick={() => setTab(t.id)}
              title={t.desc}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="json-tool-hint">
          Runs locally — files and tokens never leave your browser.
        </div>
      </div>
      <div className="hash-tool-stage">
        <div
          className="hash-tool-pane"
          style={{ display: tab === 'encode' ? 'block' : 'none' }}
        >
          <EncoderDecoder />
        </div>
        <div
          className="hash-tool-pane"
          style={{ display: tab === 'hash' ? 'block' : 'none' }}
        >
          <HashGenerator />
        </div>
        <div
          className="hash-tool-pane"
          style={{ display: tab === 'jwt' ? 'block' : 'none' }}
        >
          <JwtDecoder />
        </div>
      </div>
    </div>
  )
}
