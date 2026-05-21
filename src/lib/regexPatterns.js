export const COMMON_PATTERNS = [
  {
    id: "email",
    name: "Email address",
    pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
    flags: "g",
    sample:
      "forwarded thread from notifications@github.com to me+gh-filter@gmail.com\npinged sam.r@stripe-eng.co.uk on the bridge, dependabot[bot]@noreply.github.com still spamming PRs",
  },
  {
    id: "url",
    name: "URL (http/https)",
    pattern: "https?://[\\w.-]+(?:\\.[\\w.-]+)+(?:[/?#][^\\s]*)?",
    flags: "g",
    sample:
      "Check out https://github.com/Milan-svg/MotoConnect and https://github.com/Milan-svg/uberClone",
  },
  {
    id: "ipv4",
    name: "IPv4 address",
    pattern:
      "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b",
    flags: "g",
    sample:
      '10.42.0.18 - - [21/May/2026:14:22:09 +0000] "GET /v1/charges" 200\n10.42.0.19 - - [21/May/2026:14:22:11 +0000] "POST /v1/charges" 500\nresolvers: 1.1.1.1, 8.8.8.8 (gateway is 192.168.1.1)',
  },
  {
    id: "phone-us",
    name: "US phone",
    pattern:
      "(?:\\+?1[\\s.-]?)?\\(?[2-9]\\d{2}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}",
    flags: "g",
    sample:
      "twilio test numbers in our seeds: (415) 555-0142, (212) 555-0199\npager for sev1 is +1 (800) 555-0123, sam picks up on 415.555.0177 after hours",
  },
  {
    id: "iso-date",
    name: "ISO date (YYYY-MM-DD)",
    pattern: "\\b(\\d{4})-(\\d{2})-(\\d{2})\\b",
    flags: "g",
    sample:
      "CHANGELOG:\n2026-05-21  payments outage post-mortem\n2026-05-19  cut v1.8.2-rc.4\n2026-04-30  finished the api migration begun 2026-03-12",
  },
  {
    id: "hex-color",
    name: "Hex color",
    pattern: "#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\\b",
    flags: "g",
    sample:
      ":root {\n  --bg: #0b0f17;\n  --fg: #e6e6e6;\n  --muted: #7d8590;\n  --accent: #7aa2f7;\n  --warn: #ffb86b;\n  --err: #e63946;\n}",
  },
  {
    id: "uuid",
    name: "UUID",
    pattern:
      "\\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\\b",
    flags: "g",
    sample:
      "trace headers from last bug report:\nreq_id     7c4b9d2e-3f48-4d1c-a9b2-1d8f6e3a5c9b\nparent_id  f0c2a1b8-9d44-4e5a-8b3c-2e7d4a6f1d09\nsession    3c8d2f1e-5a6b-4c7d-8e9f-0a1b2c3d4e5f",
  },
  {
    id: "iso-datetime",
    name: "ISO datetime",
    pattern:
      "\\b\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:?\\d{2})?\\b",
    flags: "g",
    sample:
      "2026-05-21T14:22:09Z  payments-svc  retrying webhook (3/5)\n2026-05-21T14:22:11Z  payments-svc  request timeout\nlast clean response was 2026-05-21T14:18:44.220-04:00",
  },
  {
    id: "semver",
    name: "SemVer",
    pattern: "\\bv?(\\d+)\\.(\\d+)\\.(\\d+)(?:-[\\w.]+)?(?:\\+[\\w.]+)?\\b",
    flags: "g",
    sample:
      "deps i need to bump:\nreact 19.2.6 -> 19.3.0\nvite 8.0.11 -> 8.1.0\nrelease tags this month: v1.8.1, v1.8.2-rc.4, v2.0.0+sha.b1a2c3d",
  },
  {
    id: "word",
    name: "Word (boundary)",
    pattern: "\\b\\w+\\b",
    flags: "g",
    sample: "The quick brown fox jumps over the lazy dog 42 times.",
  },
];

export const DEFAULT_SAMPLE_TEXT = `quick triage notes before standup, will clean up later

api.example.com started returning 500s around 2026-05-21T14:22:09Z
- box 10.42.0.18 fine, 10.42.0.19 is the noisy one (502s, then timeouts)
- alex@example.com flagged it in #payments-alerts ~30 min before i saw
- trace id from the failed retry loop: 7c4b9d2e-3f48-4d1c-a9b2-1d8f6e3a5c9b
- on-call this week: sam, (415) 555-0142
- last green build was v1.8.1 on 2026-05-19, current is v1.8.2-rc.4
- runbook: https://wiki.internal/runbooks/payments#rollback
- dashboard tile went solid #e63946 which is supposed to mean SEV-1 only

going to grab coffee then page rich.`;

export const FLAGS = [
  {
    id: "g",
    label: "g",
    name: "global",
    desc: "Find every match, not just the first.",
  },
  {
    id: "i",
    label: "i",
    name: "case-insensitive",
    desc: "Match without regard to letter case.",
  },
  {
    id: "m",
    label: "m",
    name: "multiline",
    desc: "^ and $ match the start and end of each line.",
  },
  { id: "s", label: "s", name: "dot-all", desc: "Dot (.) matches newlines." },
  {
    id: "u",
    label: "u",
    name: "unicode",
    desc: "Treat the pattern as a sequence of unicode code points.",
  },
  {
    id: "y",
    label: "y",
    name: "sticky",
    desc: "Match only from lastIndex; no scan-ahead.",
  },
];
