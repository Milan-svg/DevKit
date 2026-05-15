const Svg = ({ children, size = 18, ...rest }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...rest}
  >
    {children}
  </svg>
)

export const Braces = (p) => (
  <Svg {...p}>
    <path d="M8 3H7a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1" />
    <path d="M16 21h1a2 2 0 0 0 2-2v-4a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1" />
  </Svg>
)

export const Regex = (p) => (
  <Svg {...p}>
    <path d="M17 3v10" />
    <path d="m12.67 5.5 8.66 5" />
    <path d="m12.67 10.5 8.66-5" />
    <path d="M9 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
    <path d="M5 17v4" />
  </Svg>
)

export const Palette = (p) => (
  <Svg {...p}>
    <circle cx="13.5" cy="6.5" r=".7" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".7" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".7" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r=".7" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.7-.7 1.7-1.7 0-.4-.2-.8-.5-1.1-.3-.3-.5-.7-.5-1.1 0-.9.7-1.7 1.7-1.7H16c3.3 0 6-2.7 6-6 0-4.9-4.5-8.4-10-8.4Z" />
  </Svg>
)

export const Hash = (p) => (
  <Svg {...p}>
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </Svg>
)

export const Sun = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" /><path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" /><path d="M20 12h2" />
    <path d="m4.93 19.07 1.41-1.41" /><path d="m17.66 6.34 1.41-1.41" />
  </Svg>
)

export const Moon = (p) => (
  <Svg {...p}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
  </Svg>
)

export const Search = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
)

export const Help = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5" />
    <line x1="12" y1="17" x2="12" y2="17" />
  </Svg>
)

export const Command = (p) => (
  <Svg {...p}>
    <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
  </Svg>
)

export const Copy = (p) => (
  <Svg {...p}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Svg>
)

export const Sparkles = (p) => (
  <Svg {...p}>
    <path d="m12 3-1.5 4.5L6 9l4.5 1.5L12 15l1.5-4.5L18 9l-4.5-1.5L12 3z" />
    <path d="M19 15v4" /><path d="M17 17h4" />
  </Svg>
)

export const Check = (p) => (
  <Svg {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Svg>
)

export const Shuffle = (p) => (
  <Svg {...p}>
    <path d="M3 6h4l8 12h6" />
    <path d="m21 18-3-3" /><path d="m21 18-3 3" />
    <path d="M3 18h4l3-4.5" />
    <path d="m14.5 10.5 1.5-2h5" />
    <path d="m21 8.5-3-3" /><path d="m21 8.5-3 3" />
  </Svg>
)

export const Pipette = (p) => (
  <Svg {...p}>
    <path d="m2 22 1-1h3l9-9" />
    <path d="M3 21v-3l9-9" />
    <path d="m15 6 3.4-3.4a2.121 2.121 0 1 1 3 3L18 9l.4.4a2.121 2.121 0 1 1-3 3l-3.8-3.8a2.121 2.121 0 1 1 3-3L15 6Z" />
  </Svg>
)
