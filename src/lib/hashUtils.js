import { Base64 } from "js-base64";
import MD5 from "crypto-js/md5";

// ── Base64 ──
export function base64Encode(text, { url = false } = {}) {
  if (!text) return { text: "", error: null, empty: true };
  try {
    return {
      text: url ? Base64.encodeURI(text) : Base64.encode(text),
      error: null,
    };
  } catch (e) {
    return { text: "", error: e.message || "Encode failed" };
  }
}

export function base64Decode(text) {
  if (!text) return { text: "", error: null, empty: true };
  try {
    let s = text.trim();
    s = s.replace(/-/g, "+").replace(/_/g, "/");
    const pad = s.length % 4;
    if (pad) s += "=".repeat(4 - pad);
    if (!/^[A-Za-z0-9+/=]*$/.test(s)) {
      return {
        text: "",
        error: "Contains characters that aren’t valid Base64",
      };
    }
    return { text: Base64.decode(s), error: null };
  } catch (e) {
    return { text: "", error: "Could not decode — input is not valid Base64" };
  }
}

// ── URL ──
export function urlEncode(text) {
  if (!text) return { text: "", error: null, empty: true };
  try {
    return { text: encodeURIComponent(text), error: null };
  } catch (e) {
    return { text: "", error: e.message };
  }
}

export function urlDecode(text) {
  if (!text) return { text: "", error: null, empty: true };
  try {
    return { text: decodeURIComponent(text), error: null };
  } catch (e) {
    return {
      text: "",
      error: "Malformed URL-encoded input — unexpected escape sequence",
    };
  }
}

// ── HTML entities ──
const HTML_ENC = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#x60;",
};

export function htmlEncode(text) {
  if (!text) return { text: "", error: null, empty: true };
  return {
    text: text.replace(/[&<>"'`/]/g, (c) => HTML_ENC[c]),
    error: null,
  };
}

const NAMED_ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  copy: "©",
  reg: "®",
  trade: "™",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  laquo: "«",
  raquo: "»",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
};

export function htmlDecode(text) {
  if (!text) return { text: "", error: null, empty: true };
  try {
    const out = text.replace(
      /&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g,
      (match, body) => {
        if (body[0] === "#") {
          const code =
            body[1] === "x" || body[1] === "X"
              ? parseInt(body.slice(2), 16)
              : parseInt(body.slice(1), 10);
          if (!Number.isFinite(code)) return match;
          try {
            return String.fromCodePoint(code);
          } catch {
            return match;
          }
        }
        return NAMED_ENTITIES[body] ?? match;
      },
    );
    return { text: out, error: null };
  } catch (e) {
    return { text: "", error: e.message };
  }
}

// ── Hashing ──
function bytesToHex(arr) {
  let s = "";
  for (const b of arr) s += b.toString(16).padStart(2, "0");
  return s;
}

export async function shaText(algorithm, text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest(algorithm, data);
  return bytesToHex(new Uint8Array(hash));
}

export async function shaBytes(algorithm, buffer) {
  const hash = await crypto.subtle.digest(algorithm, buffer);
  return bytesToHex(new Uint8Array(hash));
}

export function md5Text(text) {
  return MD5(text).toString();
}

export const HASH_ALGORITHMS = [
  { id: "MD5", label: "MD5", length: 32, fast: true, kind: "md5" },
  { id: "SHA-1", label: "SHA-1", length: 40, fast: true, kind: "sha" },
  { id: "SHA-256", label: "SHA-256", length: 64, fast: true, kind: "sha" },
  { id: "SHA-512", label: "SHA-512", length: 128, fast: true, kind: "sha" },
];

export async function hashAllText(text) {
  const out = { MD5: md5Text(text) };
  out["SHA-1"] = await shaText("SHA-1", text);
  out["SHA-256"] = await shaText("SHA-256", text);
  out["SHA-512"] = await shaText("SHA-512", text);
  return out;
}

export async function hashAllBytes(buffer) {
  const out = {};
  out["MD5"] = md5FromBuffer(buffer);
  out["SHA-1"] = await shaBytes("SHA-1", buffer);
  out["SHA-256"] = await shaBytes("SHA-256", buffer);
  out["SHA-512"] = await shaBytes("SHA-512", buffer);
  return out;
}

function md5FromBuffer(buffer) {
  const bytes = new Uint8Array(buffer);
  const words = [];
  for (let i = 0; i < bytes.length; i += 4) {
    words.push(
      ((bytes[i] || 0) << 24) |
        ((bytes[i + 1] || 0) << 16) |
        ((bytes[i + 2] || 0) << 8) |
        (bytes[i + 3] || 0),
    );
  }
  const wa = { words, sigBytes: bytes.length };
  return MD5(wa).toString();
}

export function hashesMatch(a, b) {
  if (!a || !b) return null;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function bytesFormat(n) {
  if (n < 1024) return n + " B";
  if (n < 1024 ** 2) return (n / 1024).toFixed(1) + " KB";
  if (n < 1024 ** 3) return (n / 1024 ** 2).toFixed(1) + " MB";
  return (n / 1024 ** 3).toFixed(2) + " GB";
}

// ── JWT ──
const JWT_CLAIM_DESCRIPTIONS = {
  iss: "Issuer — who minted the token",
  sub: "Subject — who the token is about",
  aud: "Audience — intended recipient(s)",
  exp: "Expiration time",
  nbf: "Not before — earliest valid time",
  iat: "Issued at",
  jti: "JWT ID — unique identifier",
  azp: "Authorized party",
  scope: "Granted scopes",
  scp: "Granted scopes",
  acr: "Authentication context class",
  amr: "Authentication methods used",
  auth_time: "Time of authentication",
  nonce: "Nonce — replay protection",
  name: "User’s full name",
  given_name: "Given (first) name",
  family_name: "Family (last) name",
  middle_name: "Middle name",
  nickname: "Nickname",
  preferred_username: "Preferred display name",
  email: "Email address",
  email_verified: "Email verification status",
  picture: "Profile picture URL",
  locale: "Locale",
  zoneinfo: "Time zone",
  client_id: "OAuth client ID",
  roles: "Granted roles",
};

const TIME_CLAIMS = new Set(["exp", "nbf", "iat", "auth_time"]);

export function annotatePayload(payload) {
  if (!payload || typeof payload !== "object") return {};
  const out = {};
  for (const [k, v] of Object.entries(payload)) {
    out[k] = {
      description: JWT_CLAIM_DESCRIPTIONS[k] || null,
      isTime: TIME_CLAIMS.has(k) && typeof v === "number",
      isExpired: k === "exp" && typeof v === "number" && v * 1000 < Date.now(),
      isPending: k === "nbf" && typeof v === "number" && v * 1000 > Date.now(),
    };
    if (out[k].isTime) {
      const d = new Date(v * 1000);
      out[k].iso = d.toISOString();
      out[k].pretty = d.toUTCString();
      out[k].relative = formatRelative(d);
    }
  }
  return out;
}

function formatRelative(date) {
  const now = Date.now();
  const diff = date.getTime() - now;
  const abs = Math.abs(diff);
  const past = diff < 0;
  if (abs < 1000) return past ? "just now" : "now";
  const units = [
    { name: "year", ms: 365 * 86400e3 },
    { name: "month", ms: 30 * 86400e3 },
    { name: "day", ms: 86400e3 },
    { name: "hour", ms: 3600e3 },
    { name: "minute", ms: 60e3 },
    { name: "second", ms: 1000 },
  ];
  for (const u of units) {
    if (abs >= u.ms) {
      const n = Math.floor(abs / u.ms);
      const plural = n !== 1 ? "s" : "";
      return past
        ? `${n} ${u.name}${plural} ago`
        : `in ${n} ${u.name}${plural}`;
    }
  }
  return past ? "recently" : "soon";
}

export function parseJwt(token) {
  if (!token || !token.trim()) return { empty: true };
  const parts = token.trim().split(".");
  if (parts.length < 2 || parts.length > 3) {
    return {
      error: `Expected 3 segments separated by '.', got ${parts.length}.`,
    };
  }
  const [hRaw, pRaw, sRaw = ""] = parts;

  let header, payload;
  const hDec = base64Decode(hRaw);
  if (hDec.error) return { error: "Header is not valid Base64URL" };
  try {
    header = JSON.parse(hDec.text);
  } catch {
    return { error: "Header is not valid JSON" };
  }

  const pDec = base64Decode(pRaw);
  if (pDec.error) return { error: "Payload is not valid Base64URL" };
  try {
    payload = JSON.parse(pDec.text);
  } catch {
    return { error: "Payload is not valid JSON" };
  }

  return {
    header,
    payload,
    signature: sRaw,
    annotations: annotatePayload(payload),
    raw: { header: hRaw, payload: pRaw, signature: sRaw },
    error: null,
  };
}

export const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OWU4ZjJiZmQzYzUxNWVjMmM2MzJkNTYiLCJyb2xlIjoidXNlciIsImlhdCI6MTc3OTM5NzU4MiwiZXhwIjoxNzc5NDE5MTgyfQ.vND8NbLNO5G7yAICiNwU3Y61S428tNCuiG1MUUq0zqw";

export const SAMPLE_TEXT_FOR_HASH =
  "The quick brown fox jumps over the lazy dog.";

export const SAMPLE_ENCODE_INPUT = `POST /api/comments
{"body": "first thoughtthat's wild! ", "authorId": "69e8f2bf"}`;
