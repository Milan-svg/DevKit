import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { parseJwt, SAMPLE_JWT } from '../../../lib/hashUtils.js'
import { Copy, Sparkles, Hash as HashIcon } from '../../Icons.jsx'

function renderValue(v) {
  if (v === null) return <span className="tk-null">null</span>
  if (typeof v === 'string') return <span className="tk-string">{JSON.stringify(v)}</span>
  if (typeof v === 'number') return <span className="tk-number">{String(v)}</span>
  if (typeof v === 'boolean') return <span className="tk-bool">{String(v)}</span>
  return <span className="value-mono">{JSON.stringify(v)}</span>
}

function ClaimRow({ k, v, ann }) {
  const isTime = ann?.isTime
  return (
    <div
      className={
        'jwt-claim ' +
        (ann?.isExpired ? 'expired ' : '') +
        (ann?.isPending ? 'pending ' : '')
      }
    >
      <div className="jwt-claim-row">
        <span className="jwt-claim-key value-mono">{k}</span>
        <span className="jwt-claim-val">
          {Array.isArray(v) ? (
            <span className="jwt-claim-array">
              [
              {v.map((item, i) => (
                <span key={i}>
                  {renderValue(item)}
                  {i < v.length - 1 ? <span className="tk-punct">, </span> : null}
                </span>
              ))}
              ]
            </span>
          ) : (
            renderValue(v)
          )}
        </span>
      </div>
      {(ann?.description || isTime) && (
        <div className="jwt-claim-meta">
          {ann?.description && (
            <span className="jwt-claim-desc">{ann.description}</span>
          )}
          {isTime && (
            <>
              <span className="jwt-claim-sep">·</span>
              <span className="jwt-claim-date value-mono">{ann.pretty}</span>
              <span
                className={
                  'jwt-claim-rel ' +
                  (ann.isExpired
                    ? 'past'
                    : ann.isPending
                      ? 'future'
                      : 'future')
                }
              >
                {ann.relative}
              </span>
              {ann.isExpired && (
                <span className="jwt-badge expired">expired</span>
              )}
              {ann.isPending && (
                <span className="jwt-badge pending">not yet valid</span>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function Segment({ title, side, content, raw, onCopy }) {
  return (
    <div className={'jwt-seg ' + side}>
      <div className="jwt-seg-head">
        <span className={'jwt-seg-tag ' + side} />
        <span className="jwt-seg-title">{title}</span>
        {raw && (
          <button
            className="iconbtn-mini"
            onClick={onCopy}
            title="Copy raw segment"
          >
            <Copy />
          </button>
        )}
      </div>
      <div className="jwt-seg-body">{content}</div>
      {raw != null && (
        <div className="jwt-seg-raw value-mono" title="Raw Base64URL">
          {raw || '∅'}
        </div>
      )}
    </div>
  )
}

export default function JwtDecoder() {
  const [token, setToken] = useState(SAMPLE_JWT)
  const decoded = useMemo(() => parseJwt(token), [token])

  const copyText = (s) => {
    if (!s) return
    navigator.clipboard?.writeText(s)
    toast('Copied!')
  }

  const status =
    decoded.empty
      ? { kind: 'empty', label: 'Awaiting token' }
      : decoded.error
        ? { kind: 'error', label: 'Invalid JWT' }
        : { kind: 'ok', label: 'Decoded' }

  return (
    <div className="jwt-tool">
      <div className="enc-panel">
        <div className="enc-panel-head">
          <div className="enc-panel-title">
            <span className={'status-dot ' + status.kind} />
            <span>JWT</span>
            <span className={'status-label ' + status.kind}>{status.label}</span>
            <span className="jwt-disclaimer">
              Signature is not verified — decoding only.
            </span>
          </div>
          <div className="json-toolbar">
            <button
              className="ghost-btn"
              onClick={() => setToken(SAMPLE_JWT)}
              title="Load sample JWT"
            >
              <Sparkles /> Sample
            </button>
            <button
              className="ghost-btn"
              onClick={() => setToken('')}
              disabled={!token}
            >
              Clear
            </button>
            <button
              className="ghost-btn"
              onClick={() => copyText(token)}
              disabled={!token}
            >
              <Copy /> Copy token
            </button>
          </div>
        </div>
        <textarea
          data-paste-target="primary"
          className="jwt-input value-mono"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste a JWT (header.payload.signature)…"
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />
        {decoded.error && (
          <div className="jwt-error">
            <span className="json-error-dot" />
            <span className="json-error-msg">{decoded.error}</span>
          </div>
        )}
      </div>

      {decoded.empty ? (
        <div className="enc-panel jwt-empty">
          <div className="empty-icon">
            <HashIcon />
          </div>
          <div className="empty-title">Paste a JWT to decode it</div>
          <div className="empty-sub">
            We split the three Base64URL segments, parse the header and payload,
            and annotate well-known claims like <code>exp</code>, <code>iss</code>,
            and <code>sub</code>.
          </div>
        </div>
      ) : decoded.error ? null : (
        <>
          <div className="jwt-segments">
            <Segment
              title="Header"
              side="a"
              raw={decoded.raw.header}
              onCopy={() => copyText(decoded.raw.header)}
              content={
                <div className="jwt-claims">
                  {Object.entries(decoded.header).map(([k, v]) => (
                    <ClaimRow key={k} k={k} v={v} ann={null} />
                  ))}
                </div>
              }
            />
            <Segment
              title="Payload"
              side="b"
              raw={decoded.raw.payload}
              onCopy={() => copyText(decoded.raw.payload)}
              content={
                <div className="jwt-claims">
                  {Object.entries(decoded.payload).map(([k, v]) => (
                    <ClaimRow
                      key={k}
                      k={k}
                      v={v}
                      ann={decoded.annotations?.[k] || null}
                    />
                  ))}
                </div>
              }
            />
          </div>
          <Segment
            title="Signature"
            side="c"
            raw={decoded.signature}
            onCopy={() => copyText(decoded.signature)}
            content={
              <div className="jwt-signature">
                <div className="jwt-sig-note">
                  This decoder does not verify the signature. To validate, you’d
                  need the issuer’s key and the algorithm declared in the header.
                </div>
              </div>
            }
          />
        </>
      )}
    </div>
  )
}
