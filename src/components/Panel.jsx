export default function Panel({ title, chips, actions, children, style }) {
  return (
    <div className="panel" style={style}>
      <div className="panel-head">
        <div className="panel-head-left">
          <span className="dot" />
          <span>{title}</span>
        </div>
        <div className="toolbar">
          {chips && (
            <div className="chips">
              {chips.map((c) => <span className="chip" key={c}>{c}</span>)}
            </div>
          )}
          {actions}
        </div>
      </div>
      <div className="panel-body">{children}</div>
    </div>
  )
}
