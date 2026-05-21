import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  base64Encode,
  base64Decode,
  urlEncode,
  urlDecode,
  htmlEncode,
  htmlDecode,
  SAMPLE_ENCODE_INPUT,
} from '../../../lib/hashUtils.js'
import { Copy, Sparkles, Shuffle } from '../../Icons.jsx'

const FORMATS = [
  {
    id: 'base64',
    label: 'Base64',
    desc: 'RFC 4648 — encodes binary as ASCII text using 64 characters.',
    encode: base64Encode,
    decode: base64Decode,
  },
  {
    id: 'url',
    label: 'URL',
    desc: 'Percent-encodes characters that aren’t safe in URLs (path, query, hash).',
    encode: urlEncode,
    decode: urlDecode,
  },
  {
    id: 'html',
    label: 'HTML entities',
    desc: 'Replaces unsafe HTML characters with named or numeric entities.',
    encode: htmlEncode,
    decode: htmlDecode,
  },
]

export default function EncoderDecoder() {
  const [format, setFormat] = useState('base64')
  const [direction, setDirection] = useState('encode')
  const [input, setInput] = useState(SAMPLE_ENCODE_INPUT)

  const f = FORMATS.find((x) => x.id === format)

  const result = useMemo(() => {
    const fn = direction === 'encode' ? f.encode : f.decode
    return fn(input)
  }, [f, direction, input])

  const swap = () => {
    if (result.error || result.empty) {
      setDirection((d) => (d === 'encode' ? 'decode' : 'encode'))
      return
    }
    setInput(result.text)
    setDirection((d) => (d === 'encode' ? 'decode' : 'encode'))
  }

  const copy = () => {
    if (!result.text) return
    navigator.clipboard?.writeText(result.text)
    toast('Copied!')
  }

  const status =
    result.error
      ? { kind: 'error', label: 'Invalid input' }
      : result.empty
        ? { kind: 'empty', label: 'Awaiting input' }
        : { kind: 'ok', label: direction === 'encode' ? 'Encoded' : 'Decoded' }

  return (
    <div className="enc-tool">
      <div className="enc-format-row">
        <div className="enc-format-tabs" role="tablist">
          {FORMATS.map((x) => (
            <button
              key={x.id}
              role="tab"
              aria-selected={format === x.id}
              className={'enc-format-tab ' + (format === x.id ? 'active' : '')}
              onClick={() => setFormat(x.id)}
              title={x.desc}
            >
              {x.label}
            </button>
          ))}
        </div>
        <div className="enc-dir">
          <button
            className={'enc-dir-btn ' + (direction === 'encode' ? 'active' : '')}
            onClick={() => setDirection('encode')}
          >
            Encode
          </button>
          <button
            className={'enc-dir-btn ' + (direction === 'decode' ? 'active' : '')}
            onClick={() => setDirection('decode')}
          >
            Decode
          </button>
        </div>
      </div>
      <div className="enc-desc">{f.desc}</div>

      <div className="enc-grid">
        <div className="enc-panel">
          <div className="enc-panel-head">
            <div className="enc-panel-title">
              <span className="status-dot ok" />
              <span>Input</span>
            </div>
            <div className="json-toolbar">
              <button
                className="ghost-btn"
                onClick={() => setInput(SAMPLE_ENCODE_INPUT)}
              >
                <Sparkles /> Sample
              </button>
              <button
                className="ghost-btn"
                onClick={() => setInput('')}
                disabled={!input}
              >
                Clear
              </button>
            </div>
          </div>
          <textarea
            data-paste-target="primary"
            className="enc-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              direction === 'encode'
                ? 'Type or paste raw text…'
                : 'Paste encoded text…'
            }
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>

        <div className="enc-swap-wrap">
          <button
            className="enc-swap"
            onClick={swap}
            title="Swap encode/decode and feed output back as input"
          >
            <Shuffle />
          </button>
        </div>

        <div className="enc-panel">
          <div className="enc-panel-head">
            <div className="enc-panel-title">
              <span className={'status-dot ' + status.kind} />
              <span>Output</span>
              <span className={'status-label ' + status.kind}>{status.label}</span>
            </div>
            <div className="json-toolbar">
              <button
                className="ghost-btn"
                onClick={copy}
                disabled={!result.text || !!result.error}
              >
                <Copy /> Copy
              </button>
            </div>
          </div>
          {result.error ? (
            <div className="enc-error">
              <div className="json-error-dot" />
              <div className="json-error-text">
                <span className="json-error-msg">{result.error}</span>
              </div>
            </div>
          ) : (
            <pre className="enc-output">
              {result.text || (
                <span className="enc-output-empty">
                  Output appears here as you type.
                </span>
              )}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}
