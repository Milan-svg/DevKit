import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { parseJson, buildDiffView, SAMPLE_DIFF_LEFT, SAMPLE_DIFF_RIGHT } from '../../../lib/jsonUtils.js'
import JsonEditor from './JsonEditor.jsx'
import { Copy, Sparkles, Check } from '../../Icons.jsx'

function DiffSide({ side, title, classes, lines, leadingHidden }) {
  return (
    <div className="diff-side">
      <div className="diff-side-head">
        <span className={'diff-side-tag ' + side} />
        <span>{title}</span>
      </div>
      <div className="diff-scroll">
        <div className="diff-gutter">
          {lines.map((_, i) => (
            <span
              key={i}
              className={
                'diff-gutter-line ' +
                (classes[i] ? 'm-' + classes[i] : '')
              }
            >
              {leadingHidden ? '' : i + 1}
            </span>
          ))}
        </div>
        <pre className="diff-code">
          {lines.map((toks, i) => (
            <div
              key={i}
              className={'diff-line ' + (classes[i] ? 'm-' + classes[i] : '')}
            >
              <span className="diff-marker">
                {classes[i] === 'added'
                  ? '+'
                  : classes[i] === 'removed'
                    ? '−'
                    : classes[i] === 'changed'
                      ? '~'
                      : ' '}
              </span>
              <span className="diff-content">
                {toks.map((t, j) => (
                  <span key={j} className={t.cls}>
                    {t.text}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  )
}

export default function JsonDiff() {
  const [left, setLeft] = useState(SAMPLE_DIFF_LEFT)
  const [right, setRight] = useState(SAMPLE_DIFF_RIGHT)

  const leftParse = useMemo(() => parseJson(left), [left])
  const rightParse = useMemo(() => parseJson(right), [right])

  const diff = useMemo(() => {
    if (leftParse.error || rightParse.error) return null
    if (leftParse.empty || rightParse.empty) return null
    return buildDiffView(leftParse.value, rightParse.value, { indent: 2 })
  }, [leftParse, rightParse])

  const swap = () => {
    setLeft(right)
    setRight(left)
  }

  const copyChanges = () => {
    if (!diff) return
    const summary = `Diff summary: +${diff.summary.added} added, -${diff.summary.removed} removed, ~${diff.summary.changed} changed`
    navigator.clipboard?.writeText(summary)
    toast('Copied diff summary')
  }

  return (
    <motion.div
      className="json-diff"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="diff-editors">
        <div className="diff-editor-card">
          <div className="diff-editor-head">
            <div className="diff-editor-title">
              <span className="diff-side-tag a" />
              <span>Source A</span>
              {leftParse.error && (
                <span className="diff-editor-err">
                  Line {leftParse.error.line || '?'} · {leftParse.error.message}
                </span>
              )}
            </div>
            <div className="diff-editor-actions">
              <button
                className="ghost-btn"
                onClick={() => setLeft('')}
                disabled={!left}
              >
                Clear
              </button>
            </div>
          </div>
          <div data-paste-target="primary">
            <JsonEditor
              value={left}
              onChange={setLeft}
              placeholder="Paste the original JSON…"
              height="280px"
            />
          </div>
        </div>
        <div className="diff-editor-card">
          <div className="diff-editor-head">
            <div className="diff-editor-title">
              <span className="diff-side-tag b" />
              <span>Source B</span>
              {rightParse.error && (
                <span className="diff-editor-err">
                  Line {rightParse.error.line || '?'} ·{' '}
                  {rightParse.error.message}
                </span>
              )}
            </div>
            <div className="diff-editor-actions">
              <button className="ghost-btn" onClick={swap}>
                Swap
              </button>
              <button
                className="ghost-btn"
                onClick={() => setRight('')}
                disabled={!right}
              >
                Clear
              </button>
            </div>
          </div>
          <JsonEditor
            value={right}
            onChange={setRight}
            placeholder="Paste the JSON to compare…"
            height="280px"
          />
        </div>
      </div>

      <div className="diff-result-card">
        <div className="diff-result-head">
          <div className="diff-result-title">
            <span className="diff-result-dot" />
            <span>Diff</span>
            {diff ? (
              <div className="diff-stats">
                <span className="stat added">+{diff.summary.added}</span>
                <span className="stat removed">−{diff.summary.removed}</span>
                <span className="stat changed">~{diff.summary.changed}</span>
                {diff.summary.identical && (
                  <span className="stat identical">
                    <Check /> identical
                  </span>
                )}
              </div>
            ) : (
              <span className="diff-result-hint">
                {leftParse.error || rightParse.error
                  ? 'Resolve the parse errors above to see the diff.'
                  : 'Paste JSON in both editors to compare.'}
              </span>
            )}
          </div>
          <div className="diff-result-actions">
            <button
              className="ghost-btn"
              onClick={copyChanges}
              disabled={!diff}
              title="Copy diff summary"
            >
              <Copy /> Summary
            </button>
          </div>
        </div>
        {diff ? (
          diff.summary.identical ? (
            <div className="diff-empty">
              <div className="empty-icon">
                <Sparkles />
              </div>
              <div className="empty-title">No differences</div>
              <div className="empty-sub">
                Both sources parse to the same JSON structure and values.
              </div>
            </div>
          ) : (
            <div className="diff-grid">
              <DiffSide
                side="a"
                title="Source A"
                lines={diff.left.lines}
                classes={diff.left.classes}
              />
              <DiffSide
                side="b"
                title="Source B"
                lines={diff.right.lines}
                classes={diff.right.classes}
              />
            </div>
          )
        ) : (
          <div className="diff-empty">
            <div className="empty-icon">
              <Sparkles />
            </div>
            <div className="empty-title">Ready to compare</div>
            <div className="empty-sub">
              Edits show up live. Added keys highlight green, removed red,
              changed values yellow.
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
