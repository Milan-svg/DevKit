import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  hashAllText,
  hashAllBytes,
  hashesMatch,
  HASH_ALGORITHMS,
  bytesFormat,
  SAMPLE_TEXT_FOR_HASH,
} from '../../../lib/hashUtils.js'
import { Copy, Sparkles, Hash as HashIcon } from '../../Icons.jsx'

function HashRow({ algorithm, value, expected, onCopy }) {
  const matchKind =
    expected && value
      ? hashesMatch(value, expected)
        ? 'match'
        : 'mismatch'
      : null
  return (
    <div className={'hash-row ' + (matchKind || '')}>
      <div className="hash-algo">
        <span className="hash-algo-name">{algorithm.label}</span>
        <span className="hash-algo-bits">{algorithm.length * 4} bit</span>
      </div>
      <div className="hash-value value-mono">
        {value || <span className="hash-placeholder">—</span>}
      </div>
      <button
        className="iconbtn-mini"
        onClick={onCopy}
        title="Copy hash"
        disabled={!value}
      >
        <Copy />
      </button>
    </div>
  )
}

export default function HashGenerator() {
  const [text, setText] = useState(SAMPLE_TEXT_FOR_HASH)
  const [hashes, setHashes] = useState({})
  const [compareA, setCompareA] = useState('')
  const [compareB, setCompareB] = useState('')
  const [file, setFile] = useState(null)
  const [fileHashes, setFileHashes] = useState({})
  const [fileBusy, setFileBusy] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    if (!text) {
      setHashes({})
      return
    }
    hashAllText(text).then((r) => {
      if (!cancelled) setHashes(r)
    })
    return () => {
      cancelled = true
    }
  }, [text])

  const handleFile = async (f) => {
    if (!f) return
    setFile({ name: f.name, size: f.size, type: f.type })
    setFileBusy(true)
    setFileHashes({})
    try {
      const buf = await f.arrayBuffer()
      const result = await hashAllBytes(buf)
      setFileHashes(result)
    } catch (e) {
      toast.error('Could not hash file — ' + (e.message || 'unknown error'))
    } finally {
      setFileBusy(false)
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  const onCopyHash = (value) => {
    if (!value) return
    navigator.clipboard?.writeText(value)
    toast('Copied hash')
  }

  const compareResult = useMemo(() => {
    if (!compareA || !compareB) return null
    return hashesMatch(compareA, compareB)
  }, [compareA, compareB])

  return (
    <div className="hash-tool-inner">
      <div className="hash-row-card">
        <div className="hash-card-head">
          <div className="enc-panel-title">
            <span className="status-dot ok" />
            <span>Hash text</span>
          </div>
          <div className="json-toolbar">
            <button
              className="ghost-btn"
              onClick={() => setText(SAMPLE_TEXT_FOR_HASH)}
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
          </div>
        </div>
        <textarea
          data-paste-target="primary"
          className="hash-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste text to hash…"
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />
        <div className="hash-list">
          {HASH_ALGORITHMS.map((a) => (
            <HashRow
              key={a.id}
              algorithm={a}
              value={hashes[a.id]}
              onCopy={() => onCopyHash(hashes[a.id])}
            />
          ))}
        </div>
        <div className="enc-panel-foot">
          <span className="json-stat">
            <span className="json-stat-val value-mono">{text.length.toLocaleString()}</span>
            <span className="json-stat-lbl">chars</span>
          </span>
          <span className="json-stat">
            <span className="json-stat-val value-mono">
              {new Blob([text]).size.toLocaleString()}
            </span>
            <span className="json-stat-lbl">bytes</span>
          </span>
        </div>
      </div>

      <div className="hash-split">
        <div className="hash-row-card">
          <div className="hash-card-head">
            <div className="enc-panel-title">
              <span className="status-dot ok" />
              <span>Hash a file</span>
            </div>
            {file && (
              <div className="json-toolbar">
                <button
                  className="ghost-btn"
                  onClick={() => {
                    setFile(null)
                    setFileHashes({})
                  }}
                >
                  Clear
                </button>
              </div>
            )}
          </div>
          <div
            className={
              'hash-drop ' +
              (dragOver ? 'over ' : '') +
              (file ? 'with-file' : '')
            }
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              hidden
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <div className="hash-drop-icon">
              <HashIcon />
            </div>
            {file ? (
              <div className="hash-file">
                <div className="hash-file-name">{file.name}</div>
                <div className="hash-file-meta">
                  {bytesFormat(file.size)}
                  {file.type ? ` · ${file.type}` : ''}
                </div>
                {fileBusy && (
                  <div className="hash-busy">Hashing…</div>
                )}
              </div>
            ) : (
              <>
                <div className="hash-drop-title">Drop a file to hash</div>
                <div className="hash-drop-sub">
                  Or click to browse. The file never leaves your browser.
                </div>
              </>
            )}
          </div>
          {file && !fileBusy && (
            <div className="hash-list">
              {HASH_ALGORITHMS.map((a) => (
                <HashRow
                  key={a.id}
                  algorithm={a}
                  value={fileHashes[a.id]}
                  onCopy={() => onCopyHash(fileHashes[a.id])}
                />
              ))}
            </div>
          )}
        </div>

        <div className="hash-row-card">
          <div className="hash-card-head">
            <div className="enc-panel-title">
              <span
                className={
                  'status-dot ' +
                  (compareResult === true
                    ? 'ok'
                    : compareResult === false
                      ? 'error'
                      : 'empty')
                }
              />
              <span>Compare hashes</span>
              {compareResult != null && (
                <span
                  className={
                    'compare-tag ' + (compareResult ? 'match' : 'mismatch')
                  }
                >
                  {compareResult ? 'Match' : 'Mismatch'}
                </span>
              )}
            </div>
          </div>
          <div className="hash-compare">
            <div className="hash-compare-field">
              <label>Hash A</label>
              <textarea
                className="hash-compare-input value-mono"
                value={compareA}
                onChange={(e) => setCompareA(e.target.value)}
                placeholder="Paste the first hash…"
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
              />
            </div>
            <div className="hash-compare-field">
              <label>Hash B</label>
              <textarea
                className="hash-compare-input value-mono"
                value={compareB}
                onChange={(e) => setCompareB(e.target.value)}
                placeholder="Paste the second hash…"
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
              />
            </div>
          </div>
          <div className="enc-panel-foot">
            <div className="hash-compare-hint">
              Compares case-insensitively, ignores surrounding whitespace.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
