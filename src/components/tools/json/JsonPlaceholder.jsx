import Panel from '../../Panel.jsx'
import { Braces, Copy } from '../../Icons.jsx'

export default function JsonPlaceholder() {
  return (
    <div className="placeholder">
      <div className="split">
        <Panel
          title="Input"
          chips={['raw']}
          actions={<button className="iconbtn" title="Paste"><Copy /></button>}
        >
          <div className="empty">
            <div className="empty-icon"><Braces /></div>
            <div className="empty-title">Paste or type raw JSON</div>
            <div className="empty-sub">Validation runs on every keystroke. Errors show inline with line and column.</div>
          </div>
        </Panel>
        <Panel
          title="Formatted output"
          chips={['tree', 'minify']}
          actions={<button className="iconbtn" title="Copy"><Copy /></button>}
        >
          <div className="stripes">syntax-highlighted output · tree view</div>
        </Panel>
      </div>
    </div>
  )
}
