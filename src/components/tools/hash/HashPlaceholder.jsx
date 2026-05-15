import Panel from '../../Panel.jsx'
import { Hash, Sparkles } from '../../Icons.jsx'

export default function HashPlaceholder() {
  return (
    <div className="placeholder">
      <div className="split">
        <Panel title="Encode / Decode" chips={['base64', 'url', 'html', 'jwt']}>
          <div className="empty">
            <div className="empty-icon"><Hash /></div>
            <div className="empty-title">Transform text</div>
            <div className="empty-sub">Base64, URL and HTML entity encoders, plus a JWT decoder for header and payload claims.</div>
          </div>
        </Panel>
        <Panel title="Hash" chips={['md5', 'sha-1', 'sha-256', 'sha-512']}>
          <div className="empty">
            <div className="empty-icon"><Sparkles /></div>
            <div className="empty-title">Generate hashes</div>
            <div className="empty-sub">Type text or drop a file. Compare two hashes to verify integrity.</div>
          </div>
        </Panel>
      </div>
    </div>
  )
}
