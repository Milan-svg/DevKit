import { useState, memo } from 'react'
import { typeOf, describeValue } from '../../../lib/jsonUtils.js'

function Chevron({ open }) {
  return (
    <svg
      className={'tree-chev ' + (open ? 'open' : '')}
      viewBox="0 0 24 24"
      width="11"
      height="11"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}

function PrimitiveValue({ value }) {
  const t = typeOf(value)
  if (t === 'string')
    return <span className="tk-string">{JSON.stringify(value)}</span>
  if (t === 'number')
    return <span className="tk-number">{JSON.stringify(value)}</span>
  if (t === 'boolean')
    return <span className="tk-bool">{JSON.stringify(value)}</span>
  if (t === 'null') return <span className="tk-null">null</span>
  return <span>{String(value)}</span>
}

function TreeNode({ keyName, value, depth, isLast, defaultOpen }) {
  const t = typeOf(value)
  const isContainer = t === 'object' || t === 'array'
  const [open, setOpen] = useState(
    typeof defaultOpen === 'boolean' ? defaultOpen : depth < 2,
  )

  const keyLabel =
    keyName !== undefined ? (
      <>
        <span className={typeof keyName === 'number' ? 'tk-key-idx' : 'tk-key'}>
          {typeof keyName === 'number' ? keyName : `"${keyName}"`}
        </span>
        <span className="tk-punct">: </span>
      </>
    ) : null

  if (!isContainer) {
    return (
      <div className="tree-row leaf" style={{ paddingLeft: depth * 14 }}>
        <span className="tree-gap" />
        {keyLabel}
        <PrimitiveValue value={value} />
        {!isLast && <span className="tk-punct">,</span>}
      </div>
    )
  }

  const entries =
    t === 'array'
      ? value.map((v, i) => [i, v])
      : Object.keys(value).map((k) => [k, value[k]])
  const empty = entries.length === 0
  const open_ = open && !empty
  const openBr = t === 'array' ? '[' : '{'
  const closeBr = t === 'array' ? ']' : '}'

  return (
    <div className="tree-block">
      <div
        className="tree-row container"
        style={{ paddingLeft: depth * 14 }}
        onClick={() => !empty && setOpen((v) => !v)}
        role="button"
        aria-expanded={open_}
      >
        {empty ? <span className="tree-gap" /> : <Chevron open={open_} />}
        {keyLabel}
        <span className="tk-punct">{openBr}</span>
        {!open_ && !empty && (
          <span className="tree-summary">
            {' '}
            {describeValue(value)}{' '}
            <span className="tk-punct">{closeBr}</span>
            {!isLast && <span className="tk-punct">,</span>}
          </span>
        )}
        {empty && (
          <>
            <span className="tk-punct">{closeBr}</span>
            {!isLast && <span className="tk-punct">,</span>}
          </>
        )}
      </div>
      {open_ && (
        <>
          <div className="tree-children">
            {entries.map(([k, v], i) => (
              <TreeNode
                key={k}
                keyName={k}
                value={v}
                depth={depth + 1}
                isLast={i === entries.length - 1}
              />
            ))}
          </div>
          <div
            className="tree-row close"
            style={{ paddingLeft: depth * 14 }}
          >
            <span className="tree-gap" />
            <span className="tk-punct">{closeBr}</span>
            {!isLast && <span className="tk-punct">,</span>}
          </div>
        </>
      )}
    </div>
  )
}

function JsonTreeView({ value }) {
  return (
    <div className="json-tree">
      <TreeNode keyName={undefined} value={value} depth={0} isLast={true} />
    </div>
  )
}

export default memo(JsonTreeView)
