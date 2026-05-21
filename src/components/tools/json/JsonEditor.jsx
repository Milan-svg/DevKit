import { useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { EditorView } from '@codemirror/view'
import { oneDark } from '@codemirror/theme-one-dark'
import { useTheme } from '../../../hooks/useTheme.js'

export default function JsonEditor({
  value,
  onChange,
  readOnly = false,
  placeholder = 'Paste or type JSON…',
  height = '520px',
  showLineNumbers = true,
}) {
  const theme = useTheme()

  const tweak = useMemo(
    () =>
      EditorView.theme({
        '&': {
          backgroundColor: 'transparent !important',
          height: '100%',
          fontSize: '13px',
          fontFamily: 'var(--font-mono)',
        },
        '.cm-scroller': {
          fontFamily: 'var(--font-mono)',
          backgroundColor: 'transparent',
        },
        '.cm-content': { padding: '12px 0' },
        '.cm-gutters': {
          backgroundColor: 'transparent !important',
          color: 'var(--text-3)',
          border: 'none',
          paddingRight: '6px',
        },
        '.cm-activeLine': { backgroundColor: 'var(--hover)' },
        '.cm-activeLineGutter': {
          backgroundColor: 'transparent',
          color: 'var(--text-2)',
        },
        '.cm-line': { padding: '0 12px' },
        '.cm-placeholder': { color: 'var(--text-3)', fontStyle: 'italic' },
        '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--accent-text)' },
        '&.cm-focused .cm-selectionBackground, ::selection': {
          backgroundColor: 'var(--accent-soft) !important',
        },
      }),
    [],
  )

  return (
    <div className="json-editor" style={{ height }}>
      <CodeMirror
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder}
        height="100%"
        theme={theme === 'dark' ? oneDark : 'light'}
        extensions={[json(), tweak, EditorView.lineWrapping]}
        basicSetup={{
          lineNumbers: showLineNumbers,
          foldGutter: true,
          highlightActiveLine: !readOnly,
          highlightActiveLineGutter: !readOnly,
          drawSelection: true,
          autocompletion: false,
          searchKeymap: false,
          tabSize: 2,
        }}
      />
    </div>
  )
}
