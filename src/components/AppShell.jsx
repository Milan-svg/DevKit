import { useState, useEffect, useMemo } from "react";
import { Toaster, toast } from "sonner";
import Sidebar from "./Sidebar.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import {
  Braces,
  Regex,
  Palette,
  Hash,
  Search,
  Command,
  Help,
} from "./Icons.jsx";
import JsonFormatter from "./tools/json/JsonFormatter.jsx";
import RegexTester from "./tools/regex/RegexTester.jsx";
import ColorTool from "./tools/color/ColorTool.jsx";
import Base64HashTool from "./tools/hash/Base64HashTool.jsx";

const TOOLS = [
  {
    id: "json",
    name: "JSON Formatter",
    subtitle: "Validate, pretty-print, and diff JSON in real time.",
    Icon: Braces,
    Component: JsonFormatter,
  },
  {
    id: "regex",
    name: "Regex Tester",
    subtitle: "Live-highlighted matches with flags, groups, and replace.",
    Icon: Regex,
    Component: RegexTester,
  },
  {
    id: "color",
    name: "Color Toolkit",
    subtitle: "Synced color inputs, palettes, and WCAG contrast.",
    Icon: Palette,
    Component: ColorTool,
  },
  {
    id: "hash",
    name: "Base64 & Hash",
    subtitle: "Encoders, JWT decoder, and crypto digest tools.",
    Icon: Hash,
    Component: Base64HashTool,
  },
];

function isEditable(el) {
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable === true;
}

function findVisiblePasteTarget() {
  const targets = document.querySelectorAll('[data-paste-target="primary"]');
  for (const t of targets) {
    if (t.offsetParent === null) continue;
    const editable = t.querySelector('[contenteditable="true"]');
    if (editable) return editable;
    return t;
  }
  return null;
}

export default function AppShell() {
  const [active, setActive] = useState("json");
  const [theme, setTheme] = useState(
    () => localStorage.getItem("devkit-theme") || "dark",
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("devkit-theme", theme);
  }, [theme]);

  useEffect(() => {
    const onKey = (e) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.key === "v" || e.key === "V") {
        if (isEditable(document.activeElement)) return;
        const target = findVisiblePasteTarget();
        if (target) {
          target.focus();
        }
        return;
      }
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= TOOLS.length) {
        e.preventDefault();
        setActive(TOOLS[n - 1].id);
        toast(TOOLS[n - 1].name, { duration: 900 });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const tool = useMemo(() => TOOLS.find((t) => t.id === active), [active]);

  return (
    <>
      <div className="app" data-tool={active}>
        <Sidebar tools={TOOLS} active={active} onSelect={setActive} />
        <main className="main">
          <div className="titlebar">
            <div>
              <h1>{tool.name}</h1>
              <p>{tool.subtitle}</p>
            </div>
            <div className="titlebar-actions">
              <ThemeToggle theme={theme} onTheme={setTheme} />
              <span className="titlebar-divider" aria-hidden="true" />
              <button className="iconbtn" title="Search (⌘K)">
                <Search />
              </button>
              <button className="iconbtn" title="Command palette">
                <Command />
              </button>
              <button className="iconbtn" title="Help">
                <Help />
              </button>
            </div>
          </div>
          <div className="content">
            {TOOLS.map(({ id, Component }) => (
              <div
                key={id}
                className={active === id ? "tool-enter" : ""}
                style={{ display: active === id ? "block" : "none" }}
              >
                <Component />
              </div>
            ))}
          </div>
          <footer className="app-footer">
            <span className="app-footer-left">
              <span className="app-footer-dot" />
              Runs locally. nothing leaves your browser.
            </span>
            <span className="app-footer-right">
              <kbd>⌘1</kbd>–<kbd>⌘4</kbd> to switch tools
              <span className="app-footer-sep">·</span>
              <kbd>⌘V</kbd> pastes into the active tool
            </span>
          </footer>
        </main>
      </div>
      <Toaster position="bottom-center" theme={theme} />
    </>
  );
}
