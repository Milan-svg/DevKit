import { useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import RegexInput from './RegexInput.jsx'
import RegexTextArea from './RegexTextArea.jsx'
import RegexResults from './RegexResults.jsx'
import {
  findMatches,
  replaceWithRegex,
} from '../../../lib/regexUtils.js'
import { DEFAULT_SAMPLE_TEXT, COMMON_PATTERNS } from '../../../lib/regexPatterns.js'
import { Copy, Sparkles, Regex } from '../../Icons.jsx'

const initialPreset = COMMON_PATTERNS[0]

export default function RegexTester() {
  const [pattern, setPattern] = useState(initialPreset.pattern)
  const [flags, setFlags] = useState(initialPreset.flags)
  const [text, setText] = useState(DEFAULT_SAMPLE_TEXT)
  const [activeIndex, setActiveIndex] = useState(null)
  const [replaceEnabled, setReplaceEnabled] = useState(false)
  const [replacement, setReplacement] = useState('[REDACTED]')

  const textareaRef = useRef(null)

  const result = useMemo(
    () => findMatches(text, pattern, flags),
    [text, pattern, flags],
  )

  const replaced = useMemo(() => {
    if (!replaceEnabled) return null
    return replaceWithRegex(text, pattern, flags, replacement)
  }, [text, pattern, flags, replacement, replaceEnabled])

  const onPreset = (p) => {
    setPattern(p.pattern)
    setFlags(p.flags)
    if (p.sample) setText(p.sample)
    setActiveIndex(null)
  }

  const onSelectMatch = (idx) => {
    setActiveIndex(idx)
    textareaRef.current?.focusMatch(idx)
  }

  const copy = (s, label = 'Copied!') => {
    if (s == null) return
    navigator.clipboard?.writeText(s)
    toast(label)
  }

  const copyMatches = () => {
    if (!result.matches.length) return
    const out = result.matches.map((m) => m.text).join('\n')
    copy(out, `Copied ${result.matches.length} matches`)
  }

  return (
    <div className="regex-tool">
      <RegexInput
        pattern={pattern}
        flags={flags}
        onPatternChange={(v) => {
          setPattern(v)
          setActiveIndex(null)
        }}
        onFlagsChange={(v) => {
          setFlags(v)
          setActiveIndex(null)
        }}
        onPreset={onPreset}
        error={result.error}
        matchCount={result.matches.length}
      />

      <div className="regex-grid">
        <div className="regex-panel">
          <div className="regex-panel-head">
            <div className="json-panel-title">
              <span className="status-dot ok" />
              <span>Test text</span>
            </div>
            <div className="json-toolbar">
              <button
                className="ghost-btn"
                onClick={() => setText(DEFAULT_SAMPLE_TEXT)}
              >
                <Sparkles /> Sample
              </button>
              <button
                className="ghost-btn"
                onClick={() => setText('')}
                disabled={!text}
              >
                Clear
              </button>
              <button
                className={
                  'ghost-btn ' + (replaceEnabled ? 'primary' : '')
                }
                onClick={() => setReplaceEnabled((v) => !v)}
                title="Toggle Replace mode"
              >
                Replace
              </button>
            </div>
          </div>
          <div data-paste-target="primary">
            <RegexTextArea
              ref={textareaRef}
              value={text}
              onChange={(v) => {
                setText(v)
                setActiveIndex(null)
              }}
              matches={result.error ? [] : result.matches}
              activeIndex={activeIndex}
              onMatchClick={onSelectMatch}
              placeholder="Paste or type text to search"
              height={420}
            />
          </div>
          <div className="regex-panel-foot">
            <div className="json-stats">
              <span className="json-stat">
                <span className="json-stat-val value-mono">
                  {text.length.toLocaleString()}
                </span>
                <span className="json-stat-lbl">chars</span>
              </span>
              <span className="json-stat">
                <span className="json-stat-val value-mono">
                  {text ? text.split('\n').length.toLocaleString() : 0}
                </span>
                <span className="json-stat-lbl">lines</span>
              </span>
              <span className="json-stat">
                <span className="json-stat-val value-mono">
                  {result.error ? '—' : result.matches.length.toLocaleString()}
                </span>
                <span className="json-stat-lbl">matches</span>
              </span>
            </div>
          </div>
        </div>

        <div className="regex-panel">
          <div className="regex-panel-head">
            <div className="json-panel-title">
              <span className="status-dot ok" />
              <span>Matches</span>
            </div>
            <div className="json-toolbar">
              <button
                className="ghost-btn"
                onClick={copyMatches}
                disabled={result.error || !result.matches.length}
                title="Copy each match on its own line"
              >
                <Copy /> Copy
              </button>
            </div>
          </div>
          <div className="regex-results-wrap">
            <RegexResults
              matches={result.matches}
              text={text}
              activeIndex={activeIndex}
              onSelect={onSelectMatch}
              truncated={result.truncated}
              error={result.error}
              empty={result.empty}
            />
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {replaceEnabled && (
          <motion.div
            className="regex-replace"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="regex-panel">
              <div className="regex-panel-head">
                <div className="json-panel-title">
                  <span className="status-dot ok" />
                  <span>Replace</span>
                  <span className="regex-replace-hint">
                    Use <code>$1</code>, <code>$2</code> for captured groups
                  </span>
                </div>
                <div className="json-toolbar">
                  <button
                    className="ghost-btn"
                    onClick={() => copy(replaced?.text, 'Copied result')}
                    disabled={!replaced || replaced.error || replaced.empty}
                  >
                    <Copy /> Copy result
                  </button>
                </div>
              </div>
              <div className="regex-replace-input-wrap">
                <span className="regex-replace-label">Replacement</span>
                <input
                  className="regex-replace-input value-mono"
                  value={replacement}
                  onChange={(e) => setReplacement(e.target.value)}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  placeholder="e.g. [hidden] or $1 → $2"
                />
              </div>
              <div className="regex-replace-result">
                {replaced?.error ? (
                  <div className="regex-empty">
                    <div className="empty-icon error">
                      <Regex />
                    </div>
                    <div className="empty-title">Replacement failed</div>
                    <div className="empty-sub">{replaced.error}</div>
                  </div>
                ) : replaced?.empty || !pattern ? (
                  <div className="regex-empty">
                    <div className="empty-icon">
                      <Regex />
                    </div>
                    <div className="empty-title">Awaiting a pattern</div>
                    <div className="empty-sub">
                      Enter a regular expression above to preview the replaced output.
                    </div>
                  </div>
                ) : (
                  <pre className="regex-replace-output">{replaced?.text}</pre>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
