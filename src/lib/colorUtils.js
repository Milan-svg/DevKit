export const clamp = (n, a, b) => Math.max(a, Math.min(b, n))
export const round = (n) => Math.round(n)

export function hexToRgb(hex) {
  const s = hex.trim().replace(/^#/, '')
  let h = s
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) }
}

export function rgbToHex({ r, g, b }) {
  const to = (n) => clamp(round(n), 0, 255).toString(16).padStart(2, '0')
  return ('#' + to(r) + to(g) + to(b)).toUpperCase()
}

export function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h *= 60
  }
  return { h: round(h), s: round(s * 100), l: round(l * 100) }
}

export function hslToRgb({ h, s, l }) {
  h = ((h % 360) + 360) % 360; s /= 100; l /= 100
  if (s === 0) { const v = round(l * 255); return { r: v, g: v, b: v } }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1; if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return {
    r: round(hue2rgb(p, q, h / 360 + 1 / 3) * 255),
    g: round(hue2rgb(p, q, h / 360) * 255),
    b: round(hue2rgb(p, q, h / 360 - 1 / 3) * 255),
  }
}

const NAMED = {
  black: '#000000', white: '#ffffff', red: '#ff0000', green: '#008000', blue: '#0000ff',
  yellow: '#ffff00', orange: '#ffa500', purple: '#800080', pink: '#ffc0cb', gray: '#808080',
  grey: '#808080', cyan: '#00ffff', magenta: '#ff00ff', teal: '#008080', indigo: '#4b0082',
  violet: '#ee82ee', brown: '#a52a2a', beige: '#f5f5dc', maroon: '#800000', navy: '#000080',
  olive: '#808000', silver: '#c0c0c0', gold: '#ffd700', lime: '#00ff00', coral: '#ff7f50',
  salmon: '#fa8072', crimson: '#dc143c', khaki: '#f0e68c', plum: '#dda0dd', orchid: '#da70d6',
  turquoise: '#40e0d0', tomato: '#ff6347', slategray: '#708090', slategrey: '#708090',
}

export function parseCss(input) {
  if (!input) return null
  const t = input.trim().toLowerCase()
  if (NAMED[t]) return hexToRgb(NAMED[t])
  if (t.startsWith('#')) return hexToRgb(t)
  let m = t.match(/^rgba?\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/)
  if (m) return { r: +m[1], g: +m[2], b: +m[3] }
  m = t.match(/^hsla?\s*\(\s*([\d.]+)(?:deg)?\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%/)
  if (m) return hslToRgb({ h: +m[1], s: +m[2], l: +m[3] })
  if (/^[0-9a-f]{3}$/i.test(t) || /^[0-9a-f]{6}$/i.test(t)) return hexToRgb(t)
  return null
}

export function relLum({ r, g, b }) {
  const ch = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4) }
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)
}

export function contrastRatio(a, b) {
  const L1 = relLum(a), L2 = relLum(b)
  const hi = Math.max(L1, L2), lo = Math.min(L1, L2)
  return (hi + 0.05) / (lo + 0.05)
}

export function isLight(rgb) { return relLum(rgb) > 0.55 }

export function shadeScale(rgb) {
  const hsl = rgbToHsl(rgb)
  const ls = [88, 72, hsl.l, Math.max(8, hsl.l - 18), Math.max(4, hsl.l - 32)]
  ls[2] = hsl.l
  return ls.map((l) => hslToRgb({ h: hsl.h, s: hsl.s, l }))
}

export function harmony(rgb, kind) {
  const { h, s, l } = rgbToHsl(rgb)
  const at = (delta) => hslToRgb({ h: h + delta, s, l })
  if (kind === 'complementary') return [rgb, at(180)]
  if (kind === 'analogous') return [at(-30), rgb, at(30)]
  if (kind === 'triadic') return [rgb, at(120), at(240)]
  if (kind === 'split') return [rgb, at(150), at(210)]
  return [rgb]
}

export function fixForegroundContrast(fg, bg, target = 4.5) {
  if (contrastRatio(fg, bg) >= target) return fg
  const fhsl = rgbToHsl(fg)
  const bgLum = relLum(bg)
  const direction = bgLum > 0.4 ? -1 : 1
  let bestRgb = fg, bestDelta = Infinity
  for (let step = 1; step <= 100; step++) {
    const l = clamp(fhsl.l + direction * step, 0, 100)
    const candidate = hslToRgb({ h: fhsl.h, s: fhsl.s, l })
    if (contrastRatio(candidate, bg) >= target) {
      const delta = Math.abs(l - fhsl.l)
      if (delta < bestDelta) { bestDelta = delta; bestRgb = candidate }
      break
    }
  }
  if (contrastRatio(bestRgb, bg) < target) {
    for (let step = 1; step <= 100; step++) {
      const l = clamp(fhsl.l + direction * step, 0, 100)
      const candidate = hslToRgb({ h: fhsl.h, s: Math.max(0, fhsl.s - 20), l })
      if (contrastRatio(candidate, bg) >= target) { bestRgb = candidate; break }
    }
  }
  return bestRgb
}

export function paletteToCss(name, rgbList) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return rgbList.map((rgb, i) => `--${slug}-${i + 1}: ${rgbToHex(rgb)};`).join('\n')
}

export const COLOR_PRESETS = [
  { id: 'ocean',    name: 'Ocean',    fg: '#0A84FF', bg: '#F5F5F7' },
  { id: 'forest',   name: 'Forest',   fg: '#1F7A35', bg: '#F2F7F0' },
  { id: 'sunset',   name: 'Sunset',   fg: '#B83C2C', bg: '#FFF6EE' },
  { id: 'graphite', name: 'Graphite', fg: '#1D1D1F', bg: '#FAFAFB' },
  { id: 'berry',    name: 'Berry',    fg: '#7E2F7B', bg: '#F8F0F8' },
  { id: 'midnight', name: 'Midnight', fg: '#E8E8EA', bg: '#1A1A1C' },
]

export const HARMONY_DESCRIPTIONS = {
  complementary: {
    name: 'Complementary',
    blurb: 'Two colors directly opposite each other on the wheel. Highest possible contrast — use the second color sparingly, for accents and CTAs.',
  },
  analogous: {
    name: 'Analogous',
    blurb: 'Three neighboring hues, 30° apart. Reads as one cohesive family — great for backgrounds, illustrations, and gentle gradients.',
  },
  triadic: {
    name: 'Triadic',
    blurb: 'Three colors evenly spaced around the wheel. Vibrant and balanced. Pick one to dominate; let the other two support.',
  },
  split: {
    name: 'Split-complementary',
    blurb: 'Your color plus the two neighbors of its complement. The energy of complementary without the head-on clash — friendlier than a straight pair.',
  },
}
