import JSON5 from 'json5'

export function typeOf(v) {
  if (v === null) return 'null'
  if (Array.isArray(v)) return 'array'
  return typeof v
}

export function positionToLineCol(input, position) {
  let line = 1, col = 1
  for (let i = 0; i < position && i < input.length; i++) {
    if (input.charCodeAt(i) === 10) { line++; col = 1 }
    else col++
  }
  return { line, col }
}

function cleanErrorMessage(raw) {
  return raw
    .replace(/^JSON\.parse:\s+/, '')
    .replace(/\s+in JSON at position \d+(?:\s+\(line \d+ column \d+\))?/, '')
    .replace(/^Unexpected end of JSON input.*/, 'Unexpected end of JSON input')
    .trim()
}

export function parseJsonError(err, input) {
  const raw = (err && err.message) || String(err)
  let line = null, col = null, position = null

  const lcMatch = /\(line (\d+) column (\d+)\)/.exec(raw)
  if (lcMatch) {
    line = parseInt(lcMatch[1], 10)
    col = parseInt(lcMatch[2], 10)
  }
  const posMatch = /position (\d+)/.exec(raw)
  if (posMatch) {
    position = parseInt(posMatch[1], 10)
    if (line == null) {
      const lc = positionToLineCol(input, position)
      line = lc.line
      col = lc.col
    }
  }

  return { message: cleanErrorMessage(raw), line, col, position, raw }
}

export function parseJson(input, { lenient = false } = {}) {
  const trimmed = input.trim()
  if (!trimmed) return { value: null, error: null, empty: true }
  try {
    return { value: JSON.parse(input), error: null }
  } catch (e) {
    const err = parseJsonError(e, input)
    if (lenient) {
      try {
        return { value: JSON5.parse(input), error: null, lenient: true }
      } catch (_) {
        return { value: null, error: err }
      }
    }
    return { value: null, error: err }
  }
}

export function formatJson(input, { indent = 2 } = {}) {
  const r = parseJson(input)
  if (r.empty) return { text: '', error: null, empty: true }
  if (r.error) return { text: input, error: r.error }
  return { text: JSON.stringify(r.value, null, indent), error: null }
}

export function minifyJson(input) {
  const r = parseJson(input)
  if (r.empty) return { text: '', error: null, empty: true }
  if (r.error) return { text: input, error: r.error }
  return { text: JSON.stringify(r.value), error: null }
}

export function describeValue(value) {
  const t = typeOf(value)
  if (t === 'object') return `${Object.keys(value).length} keys`
  if (t === 'array') return `${value.length} items`
  if (t === 'string') return `${value.length} chars`
  return t
}

export function jsonStats(value) {
  let objects = 0, arrays = 0, strings = 0, numbers = 0, booleans = 0, nulls = 0
  let maxDepth = 0
  function walk(v, depth) {
    if (depth > maxDepth) maxDepth = depth
    const t = typeOf(v)
    if (t === 'object') {
      objects++
      for (const k of Object.keys(v)) walk(v[k], depth + 1)
    } else if (t === 'array') {
      arrays++
      for (const item of v) walk(item, depth + 1)
    } else if (t === 'string') strings++
    else if (t === 'number') numbers++
    else if (t === 'boolean') booleans++
    else if (t === 'null') nulls++
  }
  walk(value, 0)
  return { objects, arrays, strings, numbers, booleans, nulls, maxDepth }
}

function deepEqual(a, b) {
  if (a === b) return true
  if (typeof a !== typeof b) return false
  if (a === null || b === null) return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false
    return true
  }
  if (typeof a === 'object') {
    const ka = Object.keys(a), kb = Object.keys(b)
    if (ka.length !== kb.length) return false
    for (const k of ka) if (!(k in b) || !deepEqual(a[k], b[k])) return false
    return true
  }
  return false
}

const tk = (cls, text) => ({ cls, text })

function tokensForPrimitive(v) {
  const t = typeOf(v)
  if (t === 'string') return [tk('tk-string', JSON.stringify(v))]
  if (t === 'number') return [tk('tk-number', JSON.stringify(v))]
  if (t === 'boolean') return [tk('tk-bool', JSON.stringify(v))]
  if (t === 'null') return [tk('tk-null', 'null')]
  return [tk('tk-string', JSON.stringify(v))]
}

export function prettyPrintWithMap(value, indent = 2) {
  const lines = []
  const lineMap = new Map()
  const pathKey = (p) => '/' + p.map(String).join('/')
  const indStr = (depth) => ' '.repeat(depth * indent)

  function emit(v, path, depth, keyTokens, trail) {
    const start = lines.length
    const lead = [tk('tk-indent', indStr(depth))]
    if (keyTokens) lead.push(...keyTokens, tk('tk-punct', ': '))
    const trailTokens = trail ? [tk('tk-punct', trail)] : []

    const t = typeOf(v)

    if (t === 'object') {
      const keys = Object.keys(v)
      if (keys.length === 0) {
        lines.push([...lead, tk('tk-punct', '{}'), ...trailTokens])
      } else {
        lines.push([...lead, tk('tk-punct', '{')])
        keys.forEach((k, i) => {
          const kTok = [tk('tk-key', JSON.stringify(k))]
          const t2 = i < keys.length - 1 ? ',' : ''
          emit(v[k], [...path, k], depth + 1, kTok, t2)
        })
        lines.push([tk('tk-indent', indStr(depth)), tk('tk-punct', '}'), ...trailTokens])
      }
    } else if (t === 'array') {
      if (v.length === 0) {
        lines.push([...lead, tk('tk-punct', '[]'), ...trailTokens])
      } else {
        lines.push([...lead, tk('tk-punct', '[')])
        v.forEach((item, i) => {
          const t2 = i < v.length - 1 ? ',' : ''
          emit(item, [...path, i], depth + 1, null, t2)
        })
        lines.push([tk('tk-indent', indStr(depth)), tk('tk-punct', ']'), ...trailTokens])
      }
    } else {
      lines.push([...lead, ...tokensForPrimitive(v), ...trailTokens])
    }

    const end = lines.length - 1
    lineMap.set(pathKey(path), { start, end })
  }

  emit(value, [], 0, null, '')
  const text = lines.map((toks) => toks.map((t) => t.text).join('')).join('\n')
  return { lines, lineMap, text }
}

export function buildDiffView(leftValue, rightValue, { indent = 2 } = {}) {
  const left = prettyPrintWithMap(leftValue, indent)
  const right = prettyPrintWithMap(rightValue, indent)
  const leftMarks = new Map()
  const rightMarks = new Map()
  const pathKey = (p) => '/' + p.map(String).join('/')
  let added = 0, removed = 0, changed = 0

  function walk(a, b, path) {
    if (deepEqual(a, b)) return
    const ta = typeOf(a), tb = typeOf(b)
    if (ta === tb && (ta === 'object' || ta === 'array')) {
      if (ta === 'object') {
        const allKeys = new Set([...Object.keys(a), ...Object.keys(b)])
        for (const k of allKeys) {
          const p = [...path, k]
          if (!(k in a)) { rightMarks.set(pathKey(p), 'added'); added++ }
          else if (!(k in b)) { leftMarks.set(pathKey(p), 'removed'); removed++ }
          else walk(a[k], b[k], p)
        }
      } else {
        const maxLen = Math.max(a.length, b.length)
        for (let i = 0; i < maxLen; i++) {
          const p = [...path, i]
          if (i >= a.length) { rightMarks.set(pathKey(p), 'added'); added++ }
          else if (i >= b.length) { leftMarks.set(pathKey(p), 'removed'); removed++ }
          else walk(a[i], b[i], p)
        }
      }
    } else {
      leftMarks.set(pathKey(path), 'changed')
      rightMarks.set(pathKey(path), 'changed')
      changed++
    }
  }

  walk(leftValue, rightValue, [])

  const leftClasses = new Array(left.lines.length).fill('')
  const rightClasses = new Array(right.lines.length).fill('')
  for (const [pk, cls] of leftMarks) {
    const r = left.lineMap.get(pk)
    if (r) for (let i = r.start; i <= r.end; i++) leftClasses[i] = cls
  }
  for (const [pk, cls] of rightMarks) {
    const r = right.lineMap.get(pk)
    if (r) for (let i = r.start; i <= r.end; i++) rightClasses[i] = cls
  }

  return {
    left: { lines: left.lines, classes: leftClasses, text: left.text },
    right: { lines: right.lines, classes: rightClasses, text: right.text },
    summary: { added, removed, changed, identical: added + removed + changed === 0 },
  }
}

export const SAMPLE_JSON = `{
  "statusCode": 200,
  "data": {
    "user": {
      "fullname": {
        "firstname": "John",
        "lastname": "Doe"
      },
      "_id": "69e8f2bfd3c515ec2c632d56",
      "email": "a@a.com",
      "password": "$2b$10$qJ/2y5l1sbrDb6GYzJ/PbuqSMixuQXB2/jRWElAjOsT8BaHXIbe92",
      "createdAt": "2026-04-22T16:09:35.290Z",
      "updatedAt": "2026-04-23T12:40:22.421Z",
      "__v": 0,
      "socketId": "R-JPE-J4B8S-jQu4AAAv"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OWU4ZjJiZmQzYzUxNWVjMmM2MzJkNTYiLCJyb2xlIjoidXNlciIsImlhdCI6MTc3OTM5NzU4MiwiZXhwIjoxNzc5NDE5MTgyfQ.vND8NbLNO5G7yAICiNwU3Y61S428tNCuiG1MUUq0zqw"
  },
  "message": "Login Successful",
  "success": true
}`

export const SAMPLE_DIFF_LEFT = `{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "69e8f2bfd3c515ec2c632d56",
      "email": "a@a.com",
      "fullname": { "firstname": "John", "lastname": "Doe" },
      "role": "user",
      "createdAt": "2026-04-22T16:09:35.290Z",
      "updatedAt": "2026-04-23T12:40:22.421Z"
    }
  },
  "success": true
}`

export const SAMPLE_DIFF_RIGHT = `{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "69e8f2bfd3c515ec2c632d56",
      "email": "john.doe@example.com",
      "fullname": { "firstname": "John", "lastname": "Doe" },
      "role": "admin",
      "createdAt": "2026-04-22T16:09:35.290Z",
      "updatedAt": "2026-05-22T09:14:02.117Z",
      "lastLoginIp": "10.42.0.19"
    }
  },
  "success": true
}`
