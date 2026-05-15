import Panel from '../../Panel.jsx'
import { Regex, Sparkles } from '../../Icons.jsx'

export default function RegexPlaceholder() {
  return (
    <div className="placeholder">
      <Panel title="Pattern" chips={['g', 'i', 'm', 's']}>
        <div className="empty">
          <div className="empty-icon"><Regex /></div>
          <div className="empty-title">Enter a regular expression</div>
          <div className="empty-sub">Toggle flags as chips. Common patterns (email, URL, IP) ship as quick-inserts.</div>
        </div>
      </Panel>
      <div className="split with-side">
        <Panel title="Test text">
          <div className="stripes">live-highlighted matches</div>
        </Panel>
        <Panel title="Matches">
          <div className="empty">
            <div className="empty-icon"><Sparkles /></div>
            <div className="empty-title">No matches yet</div>
            <div className="empty-sub">Match index, captured groups, and click-to-jump will appear here.</div>
          </div>
        </Panel>
      </div>
    </div>
  )
}
