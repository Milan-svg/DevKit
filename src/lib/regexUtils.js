const MATCH_CAP = 5000

export function compileRegex(pattern, flags) {
  if (!pattern) return { regex: null, error: null, empty: true }
  try {
    const safeFlags = ensureGlobal(flags)
    return { regex: new RegExp(pattern, safeFlags), error: null }
  } catch (e) {
    return { regex: null, error: cleanRegexError(e) }
  }
}

function ensureGlobal(flags) {
  return flags.includes('g') ? flags : flags + 'g'
}

function cleanRegexError(err) {
  const msg = (err && err.message) || String(err)
  return msg.replace(/^Invalid regular expression:\s+/i, '').replace(/^SyntaxError:\s+/i, '')
}

export function findMatches(text, pattern, flags) {
  const compiled = compileRegex(pattern, flags)
  if (compiled.error)
    return { matches: [], error: compiled.error, empty: false, truncated: false }
  if (compiled.empty)
    return { matches: [], error: null, empty: true, truncated: false }
  if (!text)
    return { matches: [], error: null, empty: false, truncated: false }

  const re = compiled.regex
  const matches = []
  let truncated = false
  let safety = 0

  re.lastIndex = 0
  let m
  while ((m = re.exec(text)) !== null) {
    if (matches.length >= MATCH_CAP) {
      truncated = true
      break
    }
    safety++
    if (safety > 200000) {
      truncated = true
      break
    }
    matches.push({
      index: matches.length,
      start: m.index,
      end: m.index + m[0].length,
      text: m[0],
      groups: m.slice(1),
      namedGroups: m.groups ? { ...m.groups } : null,
    })
    if (m[0].length === 0) {
      if (re.lastIndex >= text.length) break
      re.lastIndex++
    }
  }

  return { matches, error: null, empty: false, truncated }
}

export function buildHighlightSegments(text, matches) {
  if (!matches.length) return [{ kind: 'text', text }]
  const segments = []
  let cursor = 0
  for (const m of matches) {
    if (m.start > cursor) {
      segments.push({ kind: 'text', text: text.slice(cursor, m.start) })
    }
    if (m.end > m.start) {
      segments.push({
        kind: 'match',
        text: text.slice(m.start, m.end),
        index: m.index,
      })
    }
    cursor = Math.max(cursor, m.end)
  }
  if (cursor < text.length) {
    segments.push({ kind: 'text', text: text.slice(cursor) })
  }
  return segments
}

export function replaceWithRegex(text, pattern, flags, replacement) {
  const compiled = compileRegex(pattern, flags)
  if (compiled.error)
    return { text: '', error: compiled.error, empty: false }
  if (compiled.empty)
    return { text: '', error: null, empty: true }
  try {
    return { text: text.replace(compiled.regex, replacement || ''), error: null }
  } catch (e) {
    return { text: '', error: cleanRegexError(e) }
  }
}

export function summarizeMatch(m) {
  if (!m) return ''
  const parts = []
  if (m.groups && m.groups.length) {
    m.groups.forEach((g, i) => {
      parts.push(`$${i + 1}: ${g == null ? '∅' : JSON.stringify(g)}`)
    })
  }
  if (m.namedGroups) {
    for (const [k, v] of Object.entries(m.namedGroups)) {
      parts.push(`${k}: ${v == null ? '∅' : JSON.stringify(v)}`)
    }
  }
  return parts.join('  ·  ')
}
