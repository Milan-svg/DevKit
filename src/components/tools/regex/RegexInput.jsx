import { useEffect, useRef, useState } from 'react'
import { FLAGS, COMMON_PATTERNS } from '../../../lib/regexPatterns.js'
import { Sparkles } from '../../Icons.jsx'

function ChevronDown() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="11"
      height="11"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export default function RegexInput({
  pattern,
  flags,
  onPatternChange,
  onFlagsChange,
  onPreset,
  error,
  matchCount,
}) {
  const [presetOpen, setPresetOpen] = useState(false)
  const presetRef = useRef(null)

  useEffect(() => {
    if (!presetOpen) return
    const onDoc = (e) => {
      if (presetRef.current && !presetRef.current.contains(e.target))
        setPresetOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [presetOpen])

  const toggleFlag = (id) => {
    if (flags.includes(id)) onFlagsChange(flags.replace(id, ''))
    else onFlagsChange(flags + id)
  }

  const status =
    error != null
      ? { kind: 'error', label: 'Invalid pattern' }
      : !pattern
        ? { kind: 'empty', label: 'No pattern' }
        : matchCount === 0
          ? { kind: 'warn', label: 'No matches' }
          : {
              kind: 'ok',
              label: matchCount === 1 ? '1 match' : `${matchCount} matches`,
            }

  return (
    <div className={'regex-pattern ' + (error ? 'has-error' : '')}>
      <div className="regex-pattern-row">
        <div className="regex-input-shell">
          <span className="regex-slash">/</span>
          <input
            className="regex-pattern-input"
            value={pattern}
            onChange={(e) => onPatternChange(e.target.value)}
            placeholder="Enter a regular expression…"
            spellCheck="false"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
          <span className="regex-slash">/</span>
          <span className="regex-flags-readout value-mono">{flags || '·'}</span>
        </div>

        <div className="regex-flags">
          {FLAGS.map((f) => {
            const on = flags.includes(f.id)
            return (
              <button
                key={f.id}
                className={'regex-flag ' + (on ? 'on' : '')}
                onClick={() => toggleFlag(f.id)}
                title={`${f.name} — ${f.desc}`}
                aria-pressed={on}
              >
                {f.label}
              </button>
            )
          })}
        </div>

        <div className="regex-preset" ref={presetRef}>
          <button
            className="ghost-btn"
            onClick={() => setPresetOpen((v) => !v)}
            aria-expanded={presetOpen}
            aria-haspopup="listbox"
          >
            <Sparkles /> Presets <ChevronDown />
          </button>
          {presetOpen && (
            <div className="regex-preset-menu" role="listbox">
              <div className="regex-preset-head">Common patterns</div>
              {COMMON_PATTERNS.map((p) => (
                <button
                  key={p.id}
                  role="option"
                  className="regex-preset-item"
                  onClick={() => {
                    onPreset(p)
                    setPresetOpen(false)
                  }}
                >
                  <span className="regex-preset-name">{p.name}</span>
                  <span className="regex-preset-pattern value-mono">
                    /{p.pattern}/{p.flags}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="regex-status-row">
        <div className={'regex-status ' + status.kind}>
          <span className="status-dot" />
          <span className="regex-status-label">{status.label}</span>
        </div>
        {error && <div className="regex-error-msg">{error}</div>}
      </div>
    </div>
  )
}
